import * as THREE from 'three';
import {
  MENU_ITEMS, DIFFICULTY_TIERS, COMBO_MILESTONES, SPEED_MULTIPLIERS,
  GAME_DURATION, CUSTOMER_VARIANTS, Archetype, Tier,
  WAIT_PATIENCE_MUL, COLD_DECAY, SERVING_DECAY, PAY_PATIENCE,
  VIP_UNLOCK_LEVEL, VIP_CHANCE, VIP_PAY, VIP_PATIENCE,
  FINAL_RUSH_AT, FINAL_RUSH_MUL, trayCapacity, STAR_2, STAR_3,
  CRITIC_UNLOCK_LEVEL, CRITIC_CHANCE, CRITIC_PAY,
} from '../config/GameConfig';
import {
  M, G, shadows, DISH_EMOJI, chibi, Chibi,
  poseSit, poseStand, poseCarry, makeBubble, Bubble, woodFloorTexture, signTexture,
} from './builders';
import { Effects } from './effects';
import { Kitchen, Ticket } from './kitchen';
import { SoundManager } from '../systems/SoundManager';

// ── Types shared with the UI layer ────────────────────────────────────────────
export type AnnounceKind = 'combo' | 'speed' | 'tut' | 'rush' | 'vip';
export interface HudState {
  score: number; timeLeft: number; combo: number; multiplier: number;
  urgent: boolean; rush: boolean;
}
export interface GameResult { score: number; stars: number; happy: number; angry: number; comboRecord: number; }
export interface GameCallbacks {
  onHud: (h: HudState) => void;
  onOver: (r: GameResult) => void;
  onAnnounce: (text: string, kind: AnnounceKind) => void;
  onFlash: (kind: 'gold' | 'combo' | 'red') => void;
  onCoinFly: (x: number, y: number, n: number) => void;
}
/** Multipliers from purchased upgrades (ProgressionSystem.getBoosts). */
export interface Boosts { speed: number; cook: number; patience: number; }

type TableState = 'empty' | 'seated' | 'waiting' | 'ready' | 'eating' | 'paying' | 'dirty';
type CustState = 'entering' | 'ordering' | 'waiting' | 'eating' | 'paying' | 'leaving';

interface Customer {
  c: Chibi; table: TableData; dish: number; state: CustState;
  variant: Archetype; vip: boolean; critic: boolean;
  patience: number; maxPat: number; payPat: number; eat: number; eatTotal: number;
  speedMul: number; speedLabel: string; happy: boolean;
  path: THREE.Vector3[]; t: number; bob: number;
  bubble: Bubble | null; bAcc: number; lastBucket: number;
}
interface TableData {
  i: number; pos: THREE.Vector3; chair: THREE.Vector3; approach: THREE.Vector3;
  state: TableState; customer: Customer | null;
  food: THREE.Group | null; dirty: THREE.Group | null;
  ring: THREE.Mesh; queued: boolean; beingServed: boolean;
}
type ActionKind = 'order' | 'serve' | 'collect' | 'clean';
interface Action { kind: ActionKind; table: TableData; }
interface Anim { k: 'pop' | 'hop' | 'bump' | 'punch' | 'fly'; t: number; o?: THREE.Object3D; s?: number; from?: THREE.Vector3; to?: THREE.Vector3; dur?: number; }

// ── Layout (portrait-first) ───────────────────────────────────────────────────
const TABLE_XZ: [number, number][] = [[-2.05, -2.55], [2.05, -2.55], [-2.05, 0.7], [2.05, 0.7], [-2.05, 3.95]];
const DOOR = new THREE.Vector3(0.4, 0, 11.5);
const MAT = new THREE.Vector3(0.4, 0, 6.9);
const WAITER_HOME = new THREE.Vector3(2.3, 0, 4.9);
const BIN = new THREE.Vector3(-3.4, 0, -4.7);
const LOOK = new THREE.Vector3(0, 0.8, -0.5);
// Gameplay-critical points the camera must keep on screen at any aspect ratio
const FIT_POINTS: [number, number, number][] = [
  [-2.9, 3.5, -2.55], [2.9, 3.5, -2.55],
  [-2.9, 3.5, 0.7], [2.9, 3.5, 0.7],
  [-2.9, 3.5, 3.95],
  [-3.9, 2.9, -5.85], [4.4, 1.3, -5.85],
  [-2.5, 3.1, -8.05], [0.3, 3.1, -8.05],
  [0.4, 0, 7.6],
];

const SKINS = [0xFAD2B0, 0xE9B891, 0xF3C19E, 0xEFCBA8, 0xF5C9A0, 0xF3C19E, 0xFAD2B0];

export class RestaurantGame {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private fitCam: THREE.PerspectiveCamera;
  private camBase = new THREE.Vector3();
  private camDir = new THREE.Vector3();
  private camDist = 20;
  private introT = 0;

  private fx: Effects;
  private kitchen: Kitchen;
  private tables: TableData[] = [];
  private hit: THREE.Mesh[] = [];
  private customers: Customer[] = [];
  private anims: Anim[] = [];

  private waiter: Chibi;
  private tray: THREE.Group;
  private carried: { table: TableData; plate: THREE.Group }[] = [];
  private wq: { v: THREE.Vector3; cb?: () => void }[] = [];
  private wTarget: THREE.Vector3 | null = null;
  private wCb: (() => void) | null = null;
  private wBusy = false;
  private actions: Action[] = [];
  private writeT = 0;

  private score = 0;
  private combo = 0;
  private comboMul = 1;
  private comboRecord = 0;
  private happy = 0;
  private angry = 0;
  private timeLeft = GAME_DURATION;
  private elapsed = 0;
  private nextSpawn = 1.4;
  private nextVariant = 0;
  private running = false;
  private over = false;
  private raf = 0;
  private last = 0;
  private rushOn = false;
  private warned15 = false;
  private warned5 = false;
  private criticSeen = false;

  private tutorial = false;
  private tutStep = -1;

  private ray = new THREE.Raycaster();
  private ptr = new THREE.Vector2();
  private tmp = new THREE.Vector3();
  private arrow!: THREE.Group;
  private arrowMat!: THREE.MeshBasicMaterial;

  constructor(private container: HTMLElement, private cbs: GameCallbacks, private level: number, private boosts: Boosts = { speed: 1, cook: 1, patience: 1 }) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:block;z-index:1;';
    container.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0xF6E3BC);
    this.scene.fog = new THREE.Fog(0xF6E3BC, 30, 62);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    this.fitCam = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

    this.fx = new Effects(this.scene);
    this.buildRoom();
    this.buildTables();
    this.buildArrow();
    this.kitchen = new Kitchen(this.scene, this.fx, this.boosts.cook);
    this.kitchen.onReady = (t) => this.foodReady(t);
    this.kitchen.onWasted = (t) => this.foodWasted(t);

    this.waiter = chibi({ skin: 0xFBD2AF, outfit: 0x28368A, hair: 0x4A2F1C, waiter: true });
    this.waiter.g.position.copy(WAITER_HOME);
    this.waiter.g.scale.setScalar(1.08);
    this.scene.add(this.waiter.g);
    this.tray = new THREE.Group();
    this.tray.position.set(0, 1.02, 0.44);
    this.tray.add(new THREE.Mesh(G('tray', () => new THREE.CylinderGeometry(0.45, 0.4, 0.06, 20)), M(0xC0884A)));
    this.tray.visible = false;
    this.waiter.g.add(this.tray);

    this.resize = this.resize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    addEventListener('resize', this.resize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointer);
    this.resize();
  }

  // ── world ────────────────────────────────────────────────────────────────
  private buildRoom() {
    this.scene.add(new THREE.AmbientLight(0xfff1da, 0.6));
    this.scene.add(new THREE.HemisphereLight(0xfff6e6, 0xE6A65A, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(6, 14, 8); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0005;
    Object.assign(key.shadow.camera, { near: 1, far: 55, left: -16, right: 16, top: 18, bottom: -18 });
    key.shadow.camera.updateProjectionMatrix();
    this.scene.add(key);
    const dine = new THREE.PointLight(0xFFD27A, 0.5, 26); dine.position.set(0, 7.5, 1); this.scene.add(dine);
    const pass = new THREE.PointLight(0xFFB347, 0.5, 16); pass.position.set(0, 4.5, -6.5); this.scene.add(pass);

    // wood floor — one textured plane instead of 30+ plank meshes
    const floor = new THREE.Mesh(G('floor', () => new THREE.PlaneGeometry(46, 46)), new THREE.MeshStandardMaterial({ map: woodFloorTexture(), roughness: 0.85 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; this.scene.add(floor);
    // dining rug
    const rug = new THREE.Mesh(G('rug', () => new THREE.CircleGeometry(6.4, 40)), M(0xD98A54, { roughness: 0.95 }));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.012, 0.6); rug.receiveShadow = true; this.scene.add(rug);
    const rugRim = new THREE.Mesh(G('rugRim', () => new THREE.RingGeometry(5.9, 6.4, 40)), M(0xB86A38, { roughness: 0.95 }));
    rugRim.rotation.x = -Math.PI / 2; rugRim.position.set(0, 0.013, 0.6); this.scene.add(rugRim);

    // back wall (kitchen wall) + wainscot
    const wall = new THREE.Mesh(G('wallB', () => new THREE.PlaneGeometry(46, 20)), M(0xF3DBBA, { roughness: 1 }));
    wall.position.set(0, 10, -9); wall.receiveShadow = true; this.scene.add(wall);
    const wains = new THREE.Mesh(G('wains', () => new THREE.BoxGeometry(46, 2.6, 0.25)), M(0xC98B4E));
    wains.position.set(0, 1.3, -8.9); this.scene.add(wains);
    // side walls with windows
    for (const sx of [-1, 1]) {
      const sw = new THREE.Mesh(G('wallS', () => new THREE.PlaneGeometry(40, 20)), M(0xEFD0A6, { roughness: 1 }));
      sw.position.set(sx * 11, 10, 3); sw.rotation.y = -sx * Math.PI / 2; this.scene.add(sw);
      for (const wz of [-3, 3.5]) {
        const fr = new THREE.Mesh(G('winF', () => new THREE.BoxGeometry(0.25, 3.4, 4.2)), M(0x9A6534));
        fr.position.set(sx * 10.9, 4.2, wz); this.scene.add(fr);
        const gl = new THREE.Mesh(G('winG', () => new THREE.PlaneGeometry(3.6, 2.9)), M(0xBFE6F4, { emissive: 0x9fd0e8, emissiveIntensity: 0.55, roughness: 0.3 }));
        gl.position.set(sx * 10.75, 4.2, wz); gl.rotation.y = -sx * Math.PI / 2; this.scene.add(gl);
      }
    }

    // header beam above the pass (anchors the hanging sign)
    const beam = new THREE.Mesh(G('beam', () => new THREE.BoxGeometry(22, 0.55, 0.8)), M(0x8A5A2A));
    beam.position.set(0, 6.2, -5.85); this.scene.add(beam);

    // string lights over the dining room — one instanced draw call
    const bulbGeo = G('bulb', () => new THREE.SphereGeometry(0.09, 8, 6));
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xFFE9A8, emissive: 0xFFC96B, emissiveIntensity: 1.2, roughness: 0.4 });
    const strands: [number, number][] = [[-1.2, 5.4], [2.6, 5.6]];
    const bulbs = new THREE.InstancedMesh(bulbGeo, bulbMat, strands.length * 15);
    let bi = 0; const im = new THREE.Matrix4();
    for (const [sz, sy] of strands) {
      for (let k = 0; k < 15; k++) {
        const fx2 = k / 14;
        const x = -9 + fx2 * 18;
        const sag = Math.sin(fx2 * Math.PI) * -1.1;
        im.setPosition(x, sy + 1.1 + sag, sz);
        bulbs.setMatrixAt(bi++, im);
      }
    }
    this.scene.add(bulbs);

    // entry: doormat + velvet ropes + WELCOME sign
    const mat = new THREE.Mesh(G('mat', () => new THREE.BoxGeometry(2.6, 0.05, 1.7)), M(0xB33A22, { roughness: 0.95 }));
    mat.position.set(MAT.x, 0.025, MAT.z); this.scene.add(mat);
    for (const rx of [-1.9, 1.9]) {
      const post = new THREE.Mesh(G('post', () => new THREE.CylinderGeometry(0.06, 0.09, 1.1, 10)), M(0xC9A227, { metalness: 0.6, roughness: 0.3 }));
      post.position.set(MAT.x + rx, 0.55, MAT.z); this.scene.add(shadows(post));
      const knob = new THREE.Mesh(G('knob', () => new THREE.SphereGeometry(0.11, 10, 8)), M(0xC9A227, { metalness: 0.6, roughness: 0.3 }));
      knob.position.set(MAT.x + rx, 1.15, MAT.z); this.scene.add(knob);
    }

    // potted plants in the corners
    for (const [px, pz] of [[-8.5, -7.5], [8.5, -7.5], [-8.5, 6], [8.5, 6]]) {
      const pot = new THREE.Mesh(G('pot', () => new THREE.CylinderGeometry(0.62, 0.5, 1, 16)), M(0xCC6B3A)); pot.position.set(px, 0.5, pz);
      const fol = new THREE.Mesh(G('fol', () => new THREE.IcosahedronGeometry(1.05, 1)), M(0x4FA63A)); fol.position.set(px, 1.7, pz);
      this.scene.add(shadows(pot), shadows(fol));
    }

    // bus bin at the left end of the pass (dirty dishes go here)
    const tub = new THREE.Mesh(G('tub', () => new THREE.BoxGeometry(1.2, 0.5, 0.9)), M(0x76808E, { roughness: 0.6 }));
    tub.position.set(BIN.x, 0.9, -5.4); this.scene.add(shadows(tub));
    const tubSign = new THREE.Mesh(G('tubSign', () => new THREE.PlaneGeometry(1.5, 0.55)), new THREE.MeshBasicMaterial({ map: signTexture('DISHES', { bg: '#4A5560' }), transparent: true }));
    tubSign.position.set(BIN.x, 1.85, -5.2); this.scene.add(tubSign);
  }

  private buildTables() {
    for (let i = 0; i < TABLE_XZ.length; i++) {
      const [tx, tz] = TABLE_XZ[i];
      const pos = new THREE.Vector3(tx, 0, tz);
      const g = new THREE.Group(); g.position.copy(pos);
      const topWood = new THREE.Mesh(G('tTop', () => new THREE.CylinderGeometry(1.0, 0.95, 0.16, 32)), M(0x9B5A2B)); topWood.position.y = 0.92; g.add(topWood);
      const cloth = new THREE.Mesh(G('tCloth', () => new THREE.CylinderGeometry(0.92, 0.86, 0.06, 32)), M(0xF7F0E2, { roughness: 0.8 })); cloth.position.y = 1.02; g.add(cloth);
      const post = new THREE.Mesh(G('tPost', () => new THREE.CylinderGeometry(0.12, 0.14, 0.85, 12)), M(0x6E3F1E)); post.position.y = 0.48; g.add(post);
      const base = new THREE.Mesh(G('tBase', () => new THREE.CylinderGeometry(0.5, 0.56, 0.1, 20)), M(0x5A3318)); base.position.y = 0.06; g.add(base);
      // one chair behind the table so the guest faces the camera
      const seat = new THREE.Mesh(G('tSeat', () => new THREE.CylinderGeometry(0.36, 0.36, 0.12, 18)), M(0xC9762F)); seat.position.set(0, 0.56, -1.35); g.add(seat);
      const back = new THREE.Mesh(G('tBack', () => new THREE.BoxGeometry(0.62, 0.62, 0.12)), M(0xB5651C)); back.position.set(0, 0.92, -1.68); g.add(back);
      // little centerpiece
      const vase = new THREE.Mesh(G('vase', () => new THREE.CylinderGeometry(0.06, 0.08, 0.18, 10)), M(0xE8E2D4)); vase.position.set(0.42, 1.14, -0.3); g.add(vase);
      const bloom = new THREE.Mesh(G('bloom', () => new THREE.SphereGeometry(0.09, 8, 6)), M(0xE86A8A)); bloom.position.set(0.42, 1.3, -0.3); g.add(bloom);
      this.scene.add(shadows(g));

      const hit = new THREE.Mesh(G('hitBox', () => new THREE.BoxGeometry(3.0, 3.6, 3.6)), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(pos.x, 1.6, pos.z - 0.35); hit.userData.table = i; this.scene.add(hit); this.hit.push(hit);
      const ring = new THREE.Mesh(G('ring', () => new THREE.RingGeometry(1.1, 1.4, 40)), new THREE.MeshBasicMaterial({ color: 0xFFD24A, transparent: true, opacity: 0, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(pos.x, 0.04, pos.z); this.scene.add(ring);

      this.tables.push({
        i, pos,
        chair: new THREE.Vector3(tx, 0, tz - 1.35),
        approach: new THREE.Vector3(tx, 0, tz + 1.6),
        state: 'empty', customer: null, food: null, dirty: null,
        ring, queued: false, beingServed: false,
      });
    }
  }

  private buildArrow() {
    this.arrow = new THREE.Group();
    this.arrowMat = new THREE.MeshBasicMaterial({ color: 0xFF8A3D, depthTest: false, transparent: true });
    const cone = new THREE.Mesh(G('arrowC', () => new THREE.ConeGeometry(0.42, 0.55, 4)), this.arrowMat); cone.rotation.x = Math.PI; cone.renderOrder = 998;
    const outline = new THREE.Mesh(G('arrowO', () => new THREE.ConeGeometry(0.52, 0.68, 4)), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true })); outline.rotation.x = Math.PI; outline.position.y = 0.02; outline.renderOrder = 997;
    this.arrow.add(outline, cone);
    this.arrow.visible = false; this.scene.add(this.arrow);
  }

  // ── camera: fit the play area at any aspect ratio ──────────────────────────
  private frameCamera() {
    const w = innerWidth, h = innerHeight;
    const aspect = w / h;
    this.camera.aspect = aspect; this.camera.updateProjectionMatrix();
    this.fitCam.aspect = aspect; this.fitCam.fov = this.camera.fov; this.fitCam.updateProjectionMatrix();
    // portrait looks down more steeply than landscape
    const t = THREE.MathUtils.clamp((aspect - 0.65) / (1.35 - 0.65), 0, 1);
    const elev = THREE.MathUtils.lerp(0.85, 0.60, t);
    this.camDir.set(0, Math.sin(elev), Math.cos(elev));
    let lo = 8, hi = 44;
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      if (this.fitsAt(mid)) hi = mid; else lo = mid;
    }
    this.camDist = hi;
    this.camBase.copy(LOOK).addScaledVector(this.camDir, this.camDist);
    // keep the kitchen out of the fog at any camera distance
    const fog = this.scene.fog as THREE.Fog;
    fog.near = this.camDist + 8;
    fog.far = this.camDist + 34;
  }

  private fitsAt(dist: number): boolean {
    this.fitCam.position.copy(LOOK).addScaledVector(this.camDir, dist);
    this.fitCam.lookAt(LOOK);
    this.fitCam.updateMatrixWorld(true);
    for (const [x, y, z] of FIT_POINTS) {
      this.tmp.set(x, y, z).project(this.fitCam);
      if (Math.abs(this.tmp.x) > 0.93 || this.tmp.y > 0.84 || this.tmp.y < -0.97) return false;
    }
    return true;
  }

  // ── lifecycle ──────────────────────────────────────────────────────────────
  start(tutorial: boolean) {
    this.tutorial = tutorial;
    this.tutStep = tutorial ? 0 : 99;
    this.timeLeft = GAME_DURATION;
    this.elapsed = 0;
    this.nextSpawn = tutorial ? 0.8 : 1.4;
    this.running = true; this.over = false;
    this.introT = 0;
    this.last = performance.now();
    this.emitHud();
    cancelAnimationFrame(this.raf);
    this.loop(this.last);
    try { SoundManager.startMusic(); } catch { /* audio optional */ }
  }

  pause() {
    if (!this.running || this.over) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
  resume() {
    if (this.running || this.over) return;
    this.running = true;
    this.last = performance.now();
    this.loop(this.last);
  }
  get paused() { return !this.running && !this.over; }

  private tierNow(): Tier {
    for (const t of DIFFICULTY_TIERS) if (this.elapsed <= t.until) return t;
    return DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1];
  }

  // ── guests ──────────────────────────────────────────────────────────────────
  private spawn() {
    const free = this.tables.filter(t => t.state === 'empty');
    if (!free.length) return;
    if (this.tutorial && this.tutStep < 7 && this.customers.length >= 1) return;
    const table = free[(Math.random() * free.length) | 0];
    const vi = this.nextVariant++ % CUSTOMER_VARIANTS.length;
    const variant = CUSTOMER_VARIANTS[vi];
    const tier = this.tierNow();
    const vip = !this.tutorial && this.level >= VIP_UNLOCK_LEVEL && Math.random() < VIP_CHANCE;
    const critic = !this.tutorial && !vip && !this.criticSeen
      && this.level >= CRITIC_UNLOCK_LEVEL && Math.random() < CRITIC_CHANCE;
    if (critic) this.criticSeen = true;
    let pat = tier.orderPatience * variant.patienceMul * this.boosts.patience * (0.92 + Math.random() * 0.16);
    if (vip) pat *= VIP_PATIENCE;
    if (this.tutorial && this.tutStep < 7) pat = 999; // no walkouts during the tutorial

    const ch = critic
      ? chibi({ skin: SKINS[vi], outfit: 0x2A2A33, hair: 0xB8B8B8, accessory: 'sunglasses' })
      : chibi({ skin: SKINS[vi], outfit: variant.outfit, hair: variant.hair, accessory: variant.accessory });
    if (vip) {
      const crown = new THREE.Mesh(G('crown', () => new THREE.CylinderGeometry(0.22, 0.26, 0.16, 5)), M(0xFFC21E, { metalness: 0.6, roughness: 0.3 }));
      crown.position.y = 0.48; ch.head.add(crown);
    }
    if (critic) { // notepad in the left hand
      const pad = new THREE.Mesh(G('notepad', () => new THREE.BoxGeometry(0.2, 0.26, 0.04)), M(0xFDFDF5, { roughness: 0.9 }));
      pad.position.set(0, -0.34, 0.14); pad.rotation.x = -0.5; ch.armL.add(pad);
    }
    ch.g.position.copy(DOOR);
    this.scene.add(ch.g);

    const menu = MENU_ITEMS.filter(mi => mi.unlockLevel <= this.level);
    const dish = this.tutorial && this.tutStep < 7 ? 0 : menu[(Math.random() * menu.length) | 0].id;
    // two-leg route: down the centre aisle, then across to the chair
    const path = [
      new THREE.Vector3(0.4, 0, table.chair.z),
      new THREE.Vector3(table.chair.x, 0, table.chair.z),
    ];

    const cust: Customer = {
      c: ch, table, dish, state: 'entering', variant, vip, critic,
      patience: pat, maxPat: pat, payPat: PAY_PATIENCE, eat: 0, eatTotal: tier.eatTime,
      speedMul: 1, speedLabel: '', happy: false,
      path, t: Math.random() * 6, bob: Math.random() * 6,
      bubble: null, bAcc: 0, lastBucket: -1,
    };
    table.state = 'seated'; // reserved
    table.customer = cust;
    this.customers.push(cust);
    if (vip) { this.cbs.onAnnounce('VIP GUEST!', 'vip'); this.fx.float('👑 VIP', table.pos.x, table.pos.z, '#FFE27A', 2.6); }
    if (critic) { this.cbs.onAnnounce('FOOD CRITIC! Serve them fast 🖋', 'vip'); this.fx.float('🖋 CRITIC', table.pos.x, table.pos.z, '#D8E4F0', 2.6); }
  }

  private seat(c: Customer) {
    const t = c.table;
    c.c.g.position.set(t.chair.x, 0.42, t.chair.z);
    c.c.g.rotation.y = 0; // face the camera
    poseSit(c.c);
    c.state = 'ordering';
    const b = makeBubble();
    b.spr.position.set(0, 1.85, 0);
    c.c.g.add(b.spr);
    c.bubble = b;
    b.draw(DISH_EMOJI[c.dish], 1, 1);
    this.setRing(t);
    try { SoundManager.seatCustomer(); } catch { /* */ }
    if (this.tutorial && this.tutStep === 0) { this.tutStep = 1; this.cbs.onAnnounce('Tap the table to take their order ✍️', 'tut'); }
  }

  private angryLeave(c: Customer) {
    const t = c.table;
    const ate = c.state === 'paying';
    this.kitchen.cancel(t.i);
    if (c.bubble) { c.bubble.draw('💢', 1, 0); }
    c.state = 'leaving'; c.happy = false;
    poseStand(c.c);
    c.c.g.position.set(t.chair.x, 0, t.chair.z);
    c.path = [new THREE.Vector3(0.4, 0, t.chair.z), DOOR.clone()];
    this.actions = this.actions.filter(a => a.table !== t || a.kind === 'clean');
    t.queued = this.actions.some(a => a.table === t);
    t.customer = null;
    if (ate) { this.makeDirty(t); } else {
      t.state = 'empty';
      if (t.food) { this.scene.remove(t.food); t.food = null; }
    }
    this.setRing(t);
    this.angry++;
    if (this.comboMul > 1) this.fx.float('COMBO LOST', t.pos.x, t.pos.z, '#FF6A5A');
    this.combo = 0; this.comboMul = 1;
    this.fx.sparkle(new THREE.Vector3(t.chair.x, 1.8, t.chair.z), 0xE8442C, 8);
    try { SoundManager.customerAngry(); SoundManager.comboLost(); } catch { /* */ }
    this.cbs.onFlash('red');
    this.emitHud();
  }

  private happyLeave(c: Customer) {
    const t = c.table;
    c.state = 'leaving'; c.happy = true;
    poseStand(c.c);
    c.c.g.position.set(t.chair.x, 0, t.chair.z);
    c.path = [new THREE.Vector3(0.4, 0, t.chair.z), DOOR.clone()];
    t.customer = null;
    this.makeDirty(t);
  }

  private despawn(c: Customer) {
    if (c.bubble) { c.c.g.remove(c.bubble.spr); c.bubble.dispose(); c.bubble = null; }
    this.scene.remove(c.c.g);
    this.customers = this.customers.filter(x => x !== c);
  }

  private makeDirty(t: TableData) {
    if (t.food) { this.scene.remove(t.food); t.food = null; }
    const stack = new THREE.Group();
    for (let i = 0; i < 2; i++) {
      const p = new THREE.Mesh(G('plate', () => new THREE.CylinderGeometry(0.62, 0.52, 0.07, 36)), M(0xEDE4D2, { roughness: 0.6 }));
      p.position.y = i * 0.09; p.rotation.y = i * 0.6; p.scale.setScalar(0.72 - i * 0.08); stack.add(p);
    }
    const smudge = new THREE.Mesh(G('smudge', () => new THREE.SphereGeometry(0.16, 10, 8)), M(0x8A6A3A, { roughness: 0.9 }));
    smudge.position.y = 0.16; smudge.scale.y = 0.4; stack.add(smudge);
    stack.position.set(t.pos.x - 0.1, 1.06, t.pos.z + 0.1);
    this.scene.add(stack);
    t.dirty = stack;
    t.state = 'dirty';
    this.setRing(t);
    if (this.tutorial && (this.tutStep === 4 || this.tutStep === 5)) { this.tutStep = 6; this.cbs.onAnnounce('They left dirty dishes — tap to clean ✨', 'tut'); }
  }

  // ── input & waiter actions ──────────────────────────────────────────────────
  private onPointer(e: PointerEvent) {
    if (!this.running) return;
    this.ptr.x = (e.clientX / innerWidth) * 2 - 1;
    this.ptr.y = -(e.clientY / innerHeight) * 2 + 1;
    this.ray.setFromCamera(this.ptr, this.camera);
    const h = this.ray.intersectObjects(this.hit, false)[0];
    if (!h) return;
    this.tap(this.tables[(h.object as THREE.Mesh).userData.table as number]);
  }

  private tap(t: TableData) {
    if (t.queued) { this.bump(); return; }
    let kind: ActionKind | null = null;
    if (t.state === 'seated' && t.customer?.state === 'ordering') kind = 'order';
    else if (t.state === 'ready') kind = 'serve';
    else if (t.state === 'paying') kind = 'collect';
    else if (t.state === 'dirty') kind = 'clean';
    if (!kind) { this.bump(); return; }
    if (this.actions.length >= 3) { this.bump(); return; }
    this.actions.push({ kind, table: t });
    t.queued = true;
    this.setRing(t);
    try { SoundManager.uiClick(); } catch { /* */ }
    if (!this.wBusy) this.nextAction();
  }

  private nextAction() {
    const a = this.actions.shift();
    if (!a) { this.wBusy = false; if (this.carried.length === 0) this.tray.visible = false; return; }
    this.wBusy = true;
    const t = a.table;
    t.queued = this.actions.some(x => x.table === t);
    if (a.kind === 'order') {
      this.go(t.approach, () => this.doTakeOrder(t));
    } else if (a.kind === 'serve') {
      // merge queued ready pickups up to tray capacity (the level-3/6 unlock)
      const group: TableData[] = [t];
      const cap = trayCapacity(this.level);
      const extras = this.actions.filter(n => n.kind === 'serve' && this.kitchen.hasReady(n.table.i)).slice(0, cap - 1);
      for (const n of extras) {
        group.push(n.table);
        this.actions = this.actions.filter(x => x !== n);
        n.table.queued = this.actions.some(x => x.table === n.table);
      }
      this.go(this.kitchen.pickupPoint(t.i), () => this.doPickup(group));
      for (const gT of group) {
        gT.beingServed = true;
        this.go(gT.approach, () => this.doDeliver(gT));
      }
    } else if (a.kind === 'collect') {
      this.go(t.approach, () => this.doCollect(t));
    } else {
      this.go(t.approach, () => this.doGrabDirty(t));
      this.go(BIN, () => this.doDump());
    }
    this.setRing(t);
    this.nextStep();
  }

  private go(v: THREE.Vector3, cb?: () => void) { this.wq.push({ v: v.clone(), cb }); }
  private nextStep() {
    const s = this.wq.shift();
    if (!s) { this.wTarget = null; this.nextAction(); return; }
    this.wTarget = s.v; this.wCb = s.cb ?? null;
  }

  private doTakeOrder(t: TableData) {
    const c = t.customer;
    if (!c || c.state !== 'ordering') return; // guest already stormed out
    this.writeT = 0.55; // notepad scribble beat
    c.state = 'waiting';
    t.state = 'waiting';
    c.maxPat = this.tierNow().orderPatience * WAIT_PATIENCE_MUL * c.variant.patienceMul * this.boosts.patience;
    c.patience = c.maxPat;
    this.setRing(t);
    // the order chit flies to the kitchen
    const from = new THREE.Vector3(t.pos.x, 1.9, t.pos.z);
    const to = new THREE.Vector3(-1.1, 2.4, -6.5);
    const spr = makeBubble(); spr.draw(DISH_EMOJI[c.dish], 1, 1); spr.spr.scale.set(0.9, 0.9, 1);
    spr.spr.position.copy(from); this.scene.add(spr.spr);
    this.anims.push({ k: 'fly', t: 0, dur: 0.65, o: spr.spr, from, to });
    const ticket: Ticket = { tableIndex: t.i, dish: c.dish, dead: false };
    (spr.spr.userData as { ticket?: Ticket; bubble?: Bubble }).ticket = ticket;
    (spr.spr.userData as { ticket?: Ticket; bubble?: Bubble }).bubble = spr;
    if (c.bubble) c.bubble.draw('🍳', 1, 1);
    try { SoundManager.orderTaken(); } catch { /* */ }
    if (this.tutorial && this.tutStep === 1) { this.tutStep = 2; this.cbs.onAnnounce('The chef is on it! Watch the pan 🍳', 'tut'); }
  }

  private foodReady(ticket: Ticket) {
    const t = this.tables[ticket.tableIndex];
    const c = t.customer;
    if (!c || c.state !== 'waiting') return;
    t.state = 'ready';
    this.setRing(t);
    if (c.bubble) c.bubble.draw('🛎️', 1, c.patience / c.maxPat);
    try { SoundManager.foodReady(); } catch { /* */ }
    if (this.tutorial && this.tutStep === 2) { this.tutStep = 3; this.cbs.onAnnounce('Order up! Tap the table to serve 🛎️', 'tut'); }
  }

  private foodWasted(_ticket: Ticket) {
    this.fx.float('WASTED', 2.4, -5.4, '#B9C0CC', 2.4);
  }

  private doPickup(group: TableData[]) {
    let picked = 0;
    for (const t of group) {
      const out = this.kitchen.takeReady(t.i);
      if (!out) { t.beingServed = false; continue; }
      out.plate.position.set(0, 0.08 + picked * 0.16, 0);
      out.plate.rotation.set(0, 0, 0);
      this.tray.add(out.plate);
      this.carried.push({ table: t, plate: out.plate });
      picked++;
    }
    if (picked > 0) {
      this.tray.visible = true;
      poseCarry(this.waiter);
      this.pop(this.tray, 1);
      try { SoundManager.uiClick(); } catch { /* */ }
    }
  }

  private doDeliver(t: TableData) {
    t.beingServed = false;
    const idx = this.carried.findIndex(cr => cr.table === t);
    if (idx < 0) return;
    const { plate: pl } = this.carried[idx];
    this.carried.splice(idx, 1);
    if (this.carried.length === 0) { this.tray.visible = false; poseStand(this.waiter); }
    const c = t.customer;
    this.tray.remove(pl);
    if (!c || c.state !== 'waiting') {
      // guest left while we walked — bin the food
      this.fx.steam(new THREE.Vector3(t.pos.x, 1.5, t.pos.z), true);
      this.fx.float('WASTED', t.pos.x, t.pos.z, '#B9C0CC');
      return;
    }
    pl.position.set(t.pos.x - 0.1, 1.06, t.pos.z + 0.15);
    this.scene.add(pl);
    this.pop(pl, 1);
    t.food = pl;
    const frac = c.patience / c.maxPat;
    for (const s of SPEED_MULTIPLIERS) if (frac >= s.minPct) { c.speedMul = s.multiplier; c.speedLabel = s.label; break; }
    c.state = 'eating'; t.state = 'eating';
    c.eat = c.eatTotal;
    if (c.bubble) c.bubble.draw('😋', 1, 1);
    this.hop(c.c.g);
    this.fx.sparkle(new THREE.Vector3(t.pos.x, 1.5, t.pos.z), 0xFFF0B0, 8);
    this.fx.steam(new THREE.Vector3(t.pos.x, 1.4, t.pos.z));
    this.fx.steam(new THREE.Vector3(t.pos.x + 0.15, 1.45, t.pos.z));
    this.setRing(t);
    try { SoundManager.deliverFood(); } catch { /* */ }
    if (c.speedLabel) this.cbs.onAnnounce(c.speedLabel + '!', 'speed');
    if (this.tutorial && this.tutStep === 3) { this.tutStep = 4; this.cbs.onAnnounce('Yum! Wait for the bill 💰', 'tut'); }
  }

  private doCollect(t: TableData) {
    const c = t.customer;
    if (!c || c.state !== 'paying') return;
    const item = MENU_ITEMS[c.dish];
    this.combo++;
    if (this.combo > this.comboRecord) this.comboRecord = this.combo;
    let mil = COMBO_MILESTONES[0];
    for (const m of COMBO_MILESTONES) if (this.combo >= m.min) mil = m;
    const prevMul = this.comboMul;
    this.comboMul = mil.multiplier;
    const vipMul = c.vip ? VIP_PAY : 1;
    const rushMul = this.rushOn ? FINAL_RUSH_MUL : 1;
    const rave = c.critic && c.speedMul >= 1.5;
    const criticMul = rave ? CRITIC_PAY : 1;
    const val = Math.round(item.price * 5 * c.speedMul * this.comboMul * vipMul * rushMul * criticMul);
    this.score += val;
    this.happy++;
    if (c.critic) {
      if (rave) {
        this.cbs.onAnnounce('RAVE REVIEW! ×' + CRITIC_PAY, 'combo');
        this.fx.sparkle(new THREE.Vector3(t.pos.x, 1.8, t.pos.z), 0xD8E4F0, 14);
        try { SoundManager.unlockEarned(); } catch { /* */ }
      } else {
        this.fx.float('"meh."', t.pos.x, t.pos.z + 0.5, '#B9C0CC', 2.7);
      }
    }
    // coins: 3D burst + DOM flight into the score pill
    this.fx.coinBurst(new THREE.Vector3(t.pos.x, 1.4, t.pos.z), 8);
    const scr = this.toScreen(new THREE.Vector3(t.pos.x, 1.5, t.pos.z));
    this.cbs.onCoinFly(scr.x, scr.y, Math.min(12, 4 + Math.round(val / 60)));
    this.fx.float('+$' + val, t.pos.x, t.pos.z);
    if (c.vip) this.fx.float('VIP ×' + VIP_PAY, t.pos.x, t.pos.z + 0.5, '#FFE27A', 2.7);
    this.hop(c.c.g); this.hop(this.waiter.g);
    const milestone = !!(mil.label && this.comboMul > prevMul);
    this.cbs.onFlash(milestone ? 'combo' : 'gold');
    if (milestone) {
      this.cbs.onAnnounce(mil.label + '  ×' + this.comboMul, 'combo');
      this.camPunch();
      this.fx.sparkle(new THREE.Vector3(t.pos.x, 1.7, t.pos.z), 0xFFB347, 14);
      try { SoundManager.comboUp(Math.min(4, this.comboMul)); } catch { /* */ }
    }
    try { SoundManager.paymentCollected(); } catch { /* */ }
    if (c.bubble) { c.c.g.remove(c.bubble.spr); c.bubble.dispose(); c.bubble = null; }
    if (this.tutorial && this.tutStep === 4) this.tutStep = 5; // dirty-table hint fires in makeDirty
    this.happyLeave(c);
    this.emitHud();
  }

  private doGrabDirty(t: TableData) {
    if (!t.dirty) return;
    this.scene.remove(t.dirty);
    t.dirty.position.set(0, 0.1, 0);
    this.tray.add(t.dirty);
    this.tray.visible = true;
    poseCarry(this.waiter);
    this.carriedDirty = t.dirty;
    t.dirty = null;
    t.state = 'empty';
    this.setRing(t);
    this.fx.sparkle(new THREE.Vector3(t.pos.x, 1.4, t.pos.z), 0xA8E4F0, 10);
    try { SoundManager.uiClick(); } catch { /* */ }
    if (this.tutorial && this.tutStep === 6) {
      this.tutStep = 7;
      this.tutorial = false;
      this.cbs.onAnnounce("You're a natural! Here comes the rush 🔥", 'tut');
    }
  }
  private carriedDirty: THREE.Group | null = null;

  private doDump() {
    if (this.carriedDirty) {
      this.tray.remove(this.carriedDirty);
      this.carriedDirty = null;
      this.fx.steam(new THREE.Vector3(BIN.x, 1.4, -5.3), true);
      try { SoundManager.dishwasher(); } catch { /* */ }
    }
    if (this.carried.length === 0) { this.tray.visible = false; poseStand(this.waiter); }
  }

  // ── fx helpers ──────────────────────────────────────────────────────────────
  private setRing(t: TableData) {
    const mat = t.ring.material as THREE.MeshBasicMaterial;
    let color = 0xFFD24A, op = 0;
    if (t.state === 'seated') { color = 0xFF8A3D; op = 0.7; }
    else if (t.state === 'ready') { color = 0xFF8A3D; op = 0.95; }
    else if (t.state === 'paying') { color = 0xFFC21E; op = 0.9; }
    else if (t.state === 'dirty') { color = 0x5FB8D8; op = 0.6; }
    if (t.queued || t.beingServed) op = Math.min(op, 0.22);
    mat.color.setHex(color);
    (t.ring.userData as { target?: number }).target = op;
  }
  private pop(o: THREE.Object3D, s = 1) { o.scale.setScalar(0.01); this.anims.push({ k: 'pop', o, t: 0, s }); }
  private hop(o: THREE.Object3D) { this.anims.push({ k: 'hop', o, t: 0, s: o.scale.x }); }
  private bump() { this.anims.push({ k: 'bump', t: 0 }); }
  private camPunch() { this.anims.push({ k: 'punch', t: 0 }); }
  private toScreen(v: THREE.Vector3): { x: number; y: number } {
    const p = this.tmp.copy(v).project(this.camera);
    return { x: (p.x * 0.5 + 0.5) * innerWidth, y: (-p.y * 0.5 + 0.5) * innerHeight };
  }
  // throttled bubble redraw — avoids a CanvasTexture upload per customer per frame
  private tickBubble(c: Customer, emoji: string, frac: number, dt: number) {
    if (!c.bubble) return;
    c.bAcc += dt;
    const bucket = Math.round(frac * 24);
    if (c.bAcc >= 0.12 || bucket !== c.lastBucket) {
      c.bubble.draw(emoji, Math.max(0, frac), frac);
      c.lastBucket = bucket; c.bAcc = 0;
    }
  }

  private emitHud() {
    let urgent = false;
    for (const c of this.customers) {
      if ((c.state === 'ordering' || c.state === 'waiting') && c.patience / c.maxPat < 0.22) urgent = true;
      if (c.state === 'paying' && c.payPat / PAY_PATIENCE < 0.22) urgent = true;
    }
    this.cbs.onHud({ score: this.score, timeLeft: this.timeLeft, combo: this.combo, multiplier: this.comboMul, urgent, rush: this.rushOn });
  }

  // ── main loop ───────────────────────────────────────────────────────────────
  // The simulation runs in fixed-size substeps so game time tracks real time
  // even when the device renders below 60fps.
  private loop(now: number) {
    if (!this.running) return;
    this.raf = requestAnimationFrame(t => this.loop(t));
    let frame = Math.min(0.25, (now - this.last) / 1000);
    this.last = now;
    while (frame > 0 && this.running) {
      const dt = Math.min(frame, 0.05);
      this.step(dt, now);
      frame -= dt;
    }
    if (!this.running) return;

    // camera: intro sweep + sway + punch
    const ease = 1 - Math.pow(1 - this.introT, 3);
    const punch = this.anims.find(a => a.k === 'punch');
    const pk = punch ? Math.sin(punch.t * 60) * 0.12 * Math.max(0, 1 - punch.t * 5) : 0;
    const extra = this.camDist * 0.35 * (1 - ease);
    this.camera.position.copy(LOOK).addScaledVector(this.camDir, this.camDist + extra);
    this.camera.position.x += Math.sin(now / 3200) * 0.4;
    this.camera.position.y += Math.sin(now / 2600) * 0.18 + pk + (1 - ease) * 1.2;
    this.camera.lookAt(LOOK);

    this.renderer.render(this.scene, this.camera);
  }

  private step(dt: number, now: number) {
    const tutorialActive = this.tutorial && this.tutStep < 7;

    if (!tutorialActive && this.timeLeft > 0) {
      this.timeLeft -= dt;
      this.elapsed += dt;
      if (this.timeLeft <= FINAL_RUSH_AT && !this.rushOn) {
        this.rushOn = true;
        this.cbs.onAnnounce('FINAL RUSH — TIPS ×2', 'rush');
        this.cbs.onFlash('gold');
        try { SoundManager.rushHour(); } catch { /* */ }
      }
      if (this.timeLeft <= 15 && !this.warned15) { this.warned15 = true; try { SoundManager.timerWarning(); } catch { /* */ } }
      if (this.timeLeft <= 5 && !this.warned5) { this.warned5 = true; try { SoundManager.timerWarning(); } catch { /* */ } }
      if (this.timeLeft <= 0) { this.timeLeft = 0; this.end(); return; }
    }
    this.emitHud();

    // spawning
    this.nextSpawn -= dt;
    if (this.nextSpawn <= 0 && this.timeLeft > 6) {
      this.spawn();
      const tier = this.tierNow();
      this.nextSpawn = tier.spawnMin + Math.random() * (tier.spawnMax - tier.spawnMin);
    }

    this.updateWaiter(dt, now);
    this.updateCustomers(dt, now);
    this.kitchen.update(dt, now);
    try { SoundManager.setSizzle(this.kitchen.activeBurners()); } catch { /* */ }
    this.updateArrow(now);

    // rings
    for (const t of this.tables) {
      const tgt = (t.ring.userData as { target?: number }).target ?? 0;
      const mat = t.ring.material as THREE.MeshBasicMaterial;
      mat.opacity += (tgt - mat.opacity) * Math.min(1, dt * 8);
      if (tgt > 0) t.ring.scale.setScalar(1 + Math.sin(now / (t.state === 'ready' ? 160 : 250)) * 0.05);
    }

    this.updateAnims(dt, now);
    this.fx.update(dt);
    this.introT = Math.min(1, this.introT + dt / 1.4);
  }

  private updateWaiter(dt: number, now: number) {
    const w = this.waiter;
    if (this.writeT > 0) { // scribbling the order
      this.writeT -= dt;
      w.armR.rotation.x = -1.1 + Math.sin(now / 60) * 0.25;
      if (this.writeT <= 0) { w.armR.rotation.x = 0; if (this.carried.length || this.carriedDirty) poseCarry(w); else poseStand(w); }
      return; // waiter pauses while writing
    }
    if (this.wTarget) {
      this.tmp.copy(this.wTarget).sub(w.g.position); this.tmp.y = 0;
      const d = this.tmp.length();
      if (d < 0.07) {
        w.g.position.copy(this.wTarget);
        const cb = this.wCb; this.wCb = null;
        cb?.();
        this.nextStep();
      } else {
        this.tmp.normalize();
        w.g.position.addScaledVector(this.tmp, Math.min(8.0 * this.boosts.speed * dt, d));
        let dr = Math.atan2(this.tmp.x, this.tmp.z) - w.g.rotation.y;
        dr = Math.atan2(Math.sin(dr), Math.cos(dr));
        w.g.rotation.y += dr * Math.min(1, dt * 16);
        w.g.position.y = Math.abs(Math.sin(now / 75)) * 0.14;
        w.g.rotation.z = Math.sin(now / 75) * 0.05;
        if (!this.carried.length && !this.carriedDirty) { // arm swing while unencumbered
          w.armL.rotation.x = Math.sin(now / 75) * 0.5;
          w.armR.rotation.x = -Math.sin(now / 75) * 0.5;
        }
      }
    } else {
      w.g.position.y = Math.sin(now / 600) * 0.04;
      w.g.rotation.z *= 0.85;
      w.armL.rotation.x *= 0.85; w.armR.rotation.x *= 0.85;
      // drift back to the home spot when idle
      if (!this.wBusy) {
        this.tmp.copy(WAITER_HOME).sub(w.g.position); this.tmp.y = 0;
        if (this.tmp.length() > 2.6) { this.go(WAITER_HOME); this.nextStep(); this.wBusy = false; }
      }
    }
  }

  private updateCustomers(dt: number, now: number) {
    for (let i = this.customers.length - 1; i >= 0; i--) {
      const c = this.customers[i];
      c.t += dt;
      const o = c.c.g;
      if (c.state === 'entering' || c.state === 'leaving') {
        const target = c.path[0];
        if (!target) {
          if (c.state === 'entering') this.seat(c);
          else this.despawn(c);
          continue;
        }
        this.tmp.copy(target).sub(o.position); this.tmp.y = 0;
        const d = this.tmp.length();
        const sp = 3.6 * c.variant.speed * (c.state === 'leaving' && !c.happy ? 1.5 : 1);
        if (d < 0.1) { c.path.shift(); continue; }
        this.tmp.normalize();
        o.position.addScaledVector(this.tmp, Math.min(sp * dt, d));
        o.rotation.y = Math.atan2(this.tmp.x, this.tmp.z);
        const stride = c.variant.speed > 1.15 ? 7 : c.variant.speed < 0.8 ? 4 : 5.5;
        o.position.y = Math.abs(Math.sin(c.t * stride * 1.6)) * (c.happy && c.state === 'leaving' ? 0.16 : 0.09);
        c.c.armL.rotation.x = Math.sin(c.t * stride * 1.6) * 0.45;
        c.c.armR.rotation.x = -Math.sin(c.t * stride * 1.6) * 0.45;
      } else if (c.state === 'ordering') {
        c.patience -= dt * (c.table.queued ? SERVING_DECAY : 1);
        o.position.y = 0.42 + Math.sin(c.t * 2 + c.bob) * 0.02;
        this.tickBubble(c, DISH_EMOJI[c.dish], c.patience / c.maxPat, dt);
        if (c.patience <= 0) this.angryLeave(c);
      } else if (c.state === 'waiting') {
        const cold = c.table.state === 'ready';
        c.patience -= dt * (c.table.beingServed ? SERVING_DECAY : cold ? COLD_DECAY : 1);
        o.position.y = 0.42 + Math.sin(c.t * 2 + c.bob) * 0.02;
        this.tickBubble(c, c.table.state === 'ready' ? '🛎️' : '🍳', c.patience / c.maxPat, dt);
        if (c.patience <= 0) this.angryLeave(c);
      } else if (c.state === 'eating') {
        c.eat -= dt;
        o.position.y = 0.42 + Math.abs(Math.sin(c.t * 6)) * 0.04;
        c.c.head.rotation.x = Math.abs(Math.sin(c.t * 6)) * 0.18;
        c.c.armR.rotation.x = -1.4 + Math.sin(c.t * 6) * 0.3; // fork to mouth
        if (c.table.food) {
          const f = Math.max(0.25, c.eat / c.eatTotal);
          c.table.food.scale.setScalar(f);
        }
        if (c.eat <= 0) {
          c.state = 'paying'; c.table.state = 'paying';
          c.c.head.rotation.x = 0;
          poseSit(c.c);
          if (c.bubble) c.bubble.draw('💰', 1, 1);
          this.setRing(c.table);
          if (this.tutorial && this.tutStep === 4) this.cbs.onAnnounce('Tap the table to collect 💰', 'tut');
        }
      } else if (c.state === 'paying') {
        c.payPat -= dt * (c.table.queued ? SERVING_DECAY : 1);
        o.position.y = 0.42 + Math.abs(Math.sin(c.t * 4.5)) * 0.04;
        this.tickBubble(c, '💰', c.payPat / PAY_PATIENCE, dt);
        if (c.payPat <= 0) this.angryLeave(c);
      }
    }
  }

  private updateAnims(dt: number, now: number) {
    for (let i = this.anims.length - 1; i >= 0; i--) {
      const a = this.anims[i];
      a.t += dt;
      if (a.k === 'pop') {
        const s = (a.s ?? 1) * Math.min(1, backOut(a.t / 0.32));
        a.o!.scale.setScalar(Math.max(0.001, s));
        if (a.t > 0.34) { a.o!.scale.setScalar(a.s ?? 1); this.anims.splice(i, 1); }
      } else if (a.k === 'hop') {
        const s = (a.s ?? 1) * (1 + Math.sin(Math.min(1, a.t / 0.34) * Math.PI) * 0.2);
        a.o!.scale.setScalar(s);
        if (a.t > 0.34) { a.o!.scale.setScalar(a.s ?? 1); this.anims.splice(i, 1); }
      } else if (a.k === 'bump') {
        this.waiter.g.scale.setScalar(1.08 * (1 + Math.sin(a.t * 30) * 0.05 * Math.max(0, 1 - a.t * 4)));
        if (a.t > 0.25) { this.waiter.g.scale.setScalar(1.08); this.anims.splice(i, 1); }
      } else if (a.k === 'fly') {
        const f = Math.min(1, a.t / (a.dur ?? 0.6));
        const e = 1 - Math.pow(1 - f, 2);
        a.o!.position.lerpVectors(a.from!, a.to!, e);
        a.o!.position.y += Math.sin(f * Math.PI) * 1.1;
        if (f >= 1) {
          const ud = a.o!.userData as { ticket?: Ticket; bubble?: Bubble };
          this.scene.remove(a.o!);
          ud.bubble?.dispose();
          if (ud.ticket) this.kitchen.submit(ud.ticket);
          this.anims.splice(i, 1);
        }
      } else if (a.k === 'punch') {
        if (a.t > 0.18) this.anims.splice(i, 1);
      }
    }
    void now;
  }

  // priority arrow over the single most urgent actionable table
  private updateArrow(now: number) {
    let best: TableData | null = null, bestFrac = 2;
    let color = 0xFF8A3D;
    for (const t of this.tables) {
      if (t.queued || t.beingServed) continue;
      const c = t.customer;
      let f = 2, col = 0xFF8A3D;
      if (t.state === 'seated' && c && c.state === 'ordering') { f = c.patience / c.maxPat; col = 0xFF8A3D; }
      else if (t.state === 'ready' && c) { f = c.patience / c.maxPat * 0.9; col = 0xFF8A3D; }
      else if (t.state === 'paying' && c) { f = c.payPat / PAY_PATIENCE; col = 0xFFC21E; }
      if (f < bestFrac) { bestFrac = f; best = t; color = col; }
    }
    if (best) {
      this.arrow.visible = true;
      this.arrow.position.set(best.chair.x, 3.2 + Math.sin(now / 220) * 0.13, best.chair.z);
      this.arrowMat.color.setHex(color);
      this.arrow.scale.setScalar(bestFrac < 0.3 ? 1 + Math.sin(now / 90) * 0.18 : 1);
    } else this.arrow.visible = false;
  }

  private end() {
    this.running = false; this.over = true;
    cancelAnimationFrame(this.raf);
    try { SoundManager.setSizzle(0); SoundManager.roundEnd(); } catch { /* */ }
    const stars = this.score >= STAR_3 ? 3 : this.score >= STAR_2 ? 2 : 1;
    this.cbs.onOver({ score: this.score, stars, happy: this.happy, angry: this.angry, comboRecord: this.comboRecord });
  }

  stop() { this.running = false; this.over = true; cancelAnimationFrame(this.raf); }
  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.frameCamera();
  }
  dispose() {
    this.stop();
    removeEventListener('resize', this.resize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointer);
    try { SoundManager.setSizzle(0); } catch { /* */ }
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  // ── QA hooks ────────────────────────────────────────────────────────────────
  metrics() {
    return {
      calls: this.renderer.info.render.calls,
      tris: this.renderer.info.render.triangles,
      geom: this.renderer.info.memory.geometries,
      score: this.score, combo: this.combo,
      customers: this.customers.length,
      debug: {
        wBusy: this.wBusy, actions: this.actions.map(a => a.kind + ':' + a.table.i),
        wq: this.wq.length, wTarget: this.wTarget ? [this.wTarget.x, this.wTarget.z] : null,
        writeT: this.writeT, wPos: [Math.round(this.waiter.g.position.x * 10) / 10, Math.round(this.waiter.g.position.z * 10) / 10],
        tables: this.tables.map(t => t.state + (t.queued ? '+q' : '')),
        custStates: this.customers.map(c => c.state + (c.vip ? '+vip' : '') + (c.critic ? '+critic' : '')),
        kitchen: this.kitchen.debug(),
        anims: this.anims.map(a => a.k),
      },
    };
  }
  /** Headless driver: perform the most valuable tap, like a decent player would. */
  autoStep() {
    if (this.actions.length >= 2) return;
    const pick = (st: TableState) => this.tables.find(t => t.state === st && !t.queued && !t.beingServed);
    const t = pick('paying') ?? pick('ready') ?? pick('seated') ?? pick('dirty');
    if (t) this.tap(t);
  }
  tapTable(i: number) { this.tap(this.tables[i]); }
  fastForward(seconds: number) { this.timeLeft = Math.max(0.5, this.timeLeft - seconds); }
}

function backOut(x: number) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
