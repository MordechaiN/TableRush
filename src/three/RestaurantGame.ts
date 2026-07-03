import * as THREE from 'three';
import {
  MENU_ITEMS, CUSTOMER_VARIANTS, Archetype, LevelDef,
  QUEUE_SLOTS, HANDS_CAPACITY,
  DECAY_QUEUE, DECAY_HANDUP, DECAY_COOKING, DECAY_COLD, DECAY_CHECK, DECIDE_SECONDS,
  POINTS, DOUBLE_HANDS_BONUS, CHAIN_BONUS, MIN_TIP_FRAC,
  VIP_CHANCE, VIP_PAY, VIP_PATIENCE, CRITIC_CHANCE, CRITIC_PAY, CRITIC_RAVE_HEARTS,
} from '../config/GameConfig';
import {
  M, G, shadows, DISH_EMOJI, chibi, Chibi,
  poseSit, poseStand, poseCarry, makeBubble, Bubble, numberSprite,
  woodFloorTexture, signTexture,
} from './builders';
import { Effects } from './effects';
import { Kitchen, Ticket } from './kitchen';
import { SoundManager } from '../systems/SoundManager';

// ── Types shared with the UI layer ────────────────────────────────────────────
export type AnnounceKind = 'chain' | 'tut' | 'vip' | 'level';
export interface HudState {
  score: number; level: number; goal: number; expert: number;
  guestsLeft: number;       // guests still to be fully served (or lost)
  chain: number; chainKind: string;
  urgent: boolean;
}
export interface LevelResult {
  levelId: number; score: number; stars: number; won: boolean;
  served: number; walkouts: number; goal: number; expert: number;
}
export interface GameCallbacks {
  onHud: (h: HudState) => void;
  onOver: (r: LevelResult) => void;
  onAnnounce: (text: string, kind: AnnounceKind) => void;
  onFlash: (kind: 'gold' | 'chain' | 'red') => void;
  onCoinFly: (x: number, y: number, n: number) => void;
}
/** Multipliers from purchased upgrades (ProgressionSystem.getBoosts). */
export interface Boosts { speed: number; cook: number; patience: number; }

// ── Simulation types ──────────────────────────────────────────────────────────
type Phase =
  | 'entering'   // walking to a queue slot
  | 'queued'     // waiting in line (hearts drain)
  | 'following'  // escorted by the waiter to a table
  | 'sitting'    // walking the last step to the chair
  | 'deciding'   // reading the menu (hearts frozen)
  | 'handup'     // hand raised: take my order! (drain)
  | 'waiting'    // order in the kitchen (slow drain; fast once plate is ready)
  | 'eating'     // (frozen)
  | 'check'      // waiting to pay (drain)
  | 'leaving';

interface Guest {
  c: Chibi; variant: Archetype; vip: boolean; critic: boolean;
  phase: Phase; hearts: number; // 0..5
  queueIdx: number; table: TableD | null; dish: number;
  path: THREE.Vector3[]; t: number; happy: boolean;
  decideT: number; eatT: number;
  bubble: Bubble | null; bAcc: number; lastBucket: number;
}
type TableState = 'clean' | 'taken' | 'dirty';
interface TableD {
  i: number; pos: THREE.Vector3; chair: THREE.Vector3; approach: THREE.Vector3;
  state: TableState; guest: Guest | null;
  food: THREE.Group | null; dirty: THREE.Group | null;
  ring: THREE.Mesh;
}
type TaskKind = 'seat' | 'order' | 'pickup' | 'deliver' | 'collect' | 'clean';
interface Task { kind: TaskKind; table: TableD; guest?: Guest; }
interface Anim { k: 'pop' | 'hop' | 'bump' | 'punch' | 'fly'; t: number; o?: THREE.Object3D; s?: number; from?: THREE.Vector3; to?: THREE.Vector3; dur?: number; }
export interface Hotspot { kind: 'guest' | 'plate' | 'table'; idx: number; x: number; y: number; action: string; }

// ── Layout (portrait-first) ───────────────────────────────────────────────────
const TABLE_XZ: [number, number][] = [[-2.05, -2.55], [2.05, -2.55], [-2.05, 0.7], [2.05, 0.7], [-2.05, 3.95]];
const DOOR = new THREE.Vector3(0.4, 0, 11.5);
const MAT = new THREE.Vector3(0.4, 0, 6.9);
const QUEUE_X = [-1.35, -0.2, 0.95, 2.1];
const QUEUE_Z = 6.55;
const WAITER_HOME = new THREE.Vector3(2.4, 0, 4.6);
const BIN = new THREE.Vector3(-3.4, 0, -4.7);
const LOOK = new THREE.Vector3(0, 0.8, 0.2);
// Gameplay-critical points the camera must keep on screen at any aspect ratio
const FIT_POINTS: [number, number, number][] = [
  [-2.9, 3.5, -2.55], [2.9, 3.5, -2.55],
  [-2.9, 3.5, 0.7], [2.9, 3.5, 0.7],
  [-2.9, 3.5, 3.95],
  [-3.9, 2.9, -5.85], [4.4, 1.3, -5.85],
  [-2.5, 3.1, -8.05], [0.3, 3.1, -8.05],
  [-2.3, 3.1, 6.55], [3.1, 3.1, 6.55],   // the waiting line + its bubbles
];

const SKINS = [0xFAD2B0, 0xE9B891, 0xF3C19E, 0xEFCBA8, 0xF5C9A0, 0xF3C19E, 0xFAD2B0];

export class RestaurantGame {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private fitCam: THREE.PerspectiveCamera;
  private camDir = new THREE.Vector3();
  private camDist = 20;
  private introT = 0;

  private fx: Effects;
  private kitchen: Kitchen;
  private tables: TableD[] = [];
  private guests: Guest[] = [];
  private anims: Anim[] = [];

  private waiter: Chibi;
  private handL: THREE.Group; // plates ride in the waiter's hands
  private handR: THREE.Group;
  private carried: { table: TableD; plate: THREE.Group }[] = [];
  private carriedDirty: THREE.Group | null = null;
  private escorting: Guest | null = null;

  private tasks: Task[] = [];
  private current: Task | null = null;
  private wq: { v: THREE.Vector3; cb?: () => void }[] = [];
  private wTarget: THREE.Vector3 | null = null;
  private wCb: (() => void) | null = null;
  private writeT = 0;

  private selected: Guest | null = null;
  private selRing: THREE.Mesh;

  private score = 0;
  private served = 0;
  private walkouts = 0;
  private spawned = 0;
  private nextSpawn = 1.5;
  private nextVariant = 0;
  private chainKind: TaskKind | '' = '';
  private chainN = 0;
  private criticPlanned = false;
  private criticArrived = false;

  private running = false;
  private over = false;
  private raf = 0;
  private last = 0;

  private tutorial = false;
  private tutSeen = new Set<string>();

  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private arrow!: THREE.Group;
  private arrowMat!: THREE.MeshBasicMaterial;

  constructor(
    private container: HTMLElement,
    private cbs: GameCallbacks,
    private level: LevelDef,
    private boosts: Boosts = { speed: 1, cook: 1, patience: 1 },
  ) {
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
    this.kitchen.onReady = (t) => this.plateReady(t);
    this.kitchen.onWasted = () => this.fx.float('WASTED', 2.4, -5.4, '#B9C0CC', 2.4);

    this.waiter = chibi({ skin: 0xFBD2AF, outfit: 0x28368A, hair: 0x4A2F1C, waiter: true });
    this.waiter.g.position.copy(WAITER_HOME);
    this.waiter.g.scale.setScalar(1.08);
    this.scene.add(this.waiter.g);
    this.handL = new THREE.Group(); this.handL.position.set(-0.42, 1.02, 0.34); this.waiter.g.add(this.handL);
    this.handR = new THREE.Group(); this.handR.position.set(0.42, 1.02, 0.34); this.waiter.g.add(this.handR);

    this.selRing = new THREE.Mesh(
      G('selRing', () => new THREE.RingGeometry(0.5, 0.68, 28)),
      new THREE.MeshBasicMaterial({ color: 0xFFC21E, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthTest: false }),
    );
    this.selRing.rotation.x = -Math.PI / 2; this.selRing.renderOrder = 997; this.selRing.visible = false;
    this.scene.add(this.selRing);

    this.criticPlanned = level.critic && Math.random() < CRITIC_CHANCE;

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

    const floor = new THREE.Mesh(G('floor', () => new THREE.PlaneGeometry(46, 46)), new THREE.MeshStandardMaterial({ map: woodFloorTexture(), roughness: 0.85 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; this.scene.add(floor);
    const rug = new THREE.Mesh(G('rug', () => new THREE.CircleGeometry(6.4, 40)), M(0xD98A54, { roughness: 0.95 }));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.012, 0.6); rug.receiveShadow = true; this.scene.add(rug);
    const rugRim = new THREE.Mesh(G('rugRim', () => new THREE.RingGeometry(5.9, 6.4, 40)), M(0xB86A38, { roughness: 0.95 }));
    rugRim.rotation.x = -Math.PI / 2; rugRim.position.set(0, 0.013, 0.6); this.scene.add(rugRim);

    const wall = new THREE.Mesh(G('wallB', () => new THREE.PlaneGeometry(46, 20)), M(0xF3DBBA, { roughness: 1 }));
    wall.position.set(0, 10, -9); wall.receiveShadow = true; this.scene.add(wall);
    const wains = new THREE.Mesh(G('wains', () => new THREE.BoxGeometry(46, 2.6, 0.25)), M(0xC98B4E));
    wains.position.set(0, 1.3, -8.9); this.scene.add(wains);
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

    const beam = new THREE.Mesh(G('beam', () => new THREE.BoxGeometry(22, 0.55, 0.8)), M(0x8A5A2A));
    beam.position.set(0, 6.2, -5.85); this.scene.add(beam);

    const bulbGeo = G('bulb', () => new THREE.SphereGeometry(0.09, 8, 6));
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xFFE9A8, emissive: 0xFFC96B, emissiveIntensity: 1.2, roughness: 0.4 });
    const strands: [number, number][] = [[-1.2, 5.4], [2.6, 5.6]];
    const bulbs = new THREE.InstancedMesh(bulbGeo, bulbMat, strands.length * 15);
    let bi = 0; const im = new THREE.Matrix4();
    for (const [sz, sy] of strands) {
      for (let k = 0; k < 15; k++) {
        const f = k / 14;
        im.setPosition(-9 + f * 18, sy + 1.1 - Math.sin(f * Math.PI) * 1.1, sz);
        bulbs.setMatrixAt(bi++, im);
      }
    }
    this.scene.add(bulbs);

    // entrance: doormat, velvet-rope waiting line
    const mat = new THREE.Mesh(G('mat', () => new THREE.BoxGeometry(4.6, 0.05, 1.9)), M(0xB33A22, { roughness: 0.95 }));
    mat.position.set(MAT.x, 0.025, MAT.z); this.scene.add(mat);
    for (const rx of [-2.6, 3.4]) {
      const post = new THREE.Mesh(G('post', () => new THREE.CylinderGeometry(0.06, 0.09, 1.1, 10)), M(0xC9A227, { metalness: 0.6, roughness: 0.3 }));
      post.position.set(MAT.x + rx, 0.55, QUEUE_Z + 0.9); this.scene.add(shadows(post));
      const knob = new THREE.Mesh(G('knob', () => new THREE.SphereGeometry(0.11, 10, 8)), M(0xC9A227, { metalness: 0.6, roughness: 0.3 }));
      knob.position.set(MAT.x + rx, 1.15, QUEUE_Z + 0.9); this.scene.add(knob);
    }
    const wait = new THREE.Mesh(G('waitSign', () => new THREE.PlaneGeometry(2.2, 0.8)), new THREE.MeshBasicMaterial({ map: signTexture('WELCOME', { bg: '#5A3318' }), transparent: true }));
    wait.position.set(MAT.x + 0.4, 2.4, QUEUE_Z + 1.2); this.scene.add(wait);

    for (const [px, pz] of [[-8.5, -7.5], [8.5, -7.5], [-8.5, 6], [8.5, 6]]) {
      const pot = new THREE.Mesh(G('pot', () => new THREE.CylinderGeometry(0.62, 0.5, 1, 16)), M(0xCC6B3A)); pot.position.set(px, 0.5, pz);
      const fol = new THREE.Mesh(G('fol', () => new THREE.IcosahedronGeometry(1.05, 1)), M(0x4FA63A)); fol.position.set(px, 1.7, pz);
      this.scene.add(shadows(pot), shadows(fol));
    }

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
      const seat = new THREE.Mesh(G('tSeat', () => new THREE.CylinderGeometry(0.36, 0.36, 0.12, 18)), M(0xC9762F)); seat.position.set(0, 0.56, -1.35); g.add(seat);
      const back = new THREE.Mesh(G('tBack', () => new THREE.BoxGeometry(0.62, 0.62, 0.12)), M(0xB5651C)); back.position.set(0, 0.92, -1.68); g.add(back);
      const vase = new THREE.Mesh(G('vase', () => new THREE.CylinderGeometry(0.06, 0.08, 0.18, 10)), M(0xE8E2D4)); vase.position.set(0.42, 1.14, -0.3); g.add(vase);
      const bloom = new THREE.Mesh(G('bloom', () => new THREE.SphereGeometry(0.09, 8, 6)), M(0xE86A8A)); bloom.position.set(0.42, 1.3, -0.3); g.add(bloom);
      this.scene.add(shadows(g));

      // table number badge — matches the flag on ready plates
      const num = numberSprite(i + 1, '#8A5A2A');
      num.scale.set(0.42, 0.42, 1);
      num.position.set(pos.x + 0.75, 1.45, pos.z + 0.55);
      this.scene.add(num);

      const ring = new THREE.Mesh(G('ring', () => new THREE.RingGeometry(1.1, 1.4, 40)), new THREE.MeshBasicMaterial({ color: 0xFFD24A, transparent: true, opacity: 0, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(pos.x, 0.04, pos.z); this.scene.add(ring);

      this.tables.push({
        i, pos,
        chair: new THREE.Vector3(tx, 0, tz - 1.35),
        approach: new THREE.Vector3(tx, 0, tz + 1.6),
        state: 'clean', guest: null, food: null, dirty: null, ring,
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
    const t = THREE.MathUtils.clamp((aspect - 0.65) / (1.35 - 0.65), 0, 1);
    const elev = THREE.MathUtils.lerp(0.85, 0.60, t);
    this.camDir.set(0, Math.sin(elev), Math.cos(elev));
    let lo = 8, hi = 46;
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      if (this.fitsAt(mid)) hi = mid; else lo = mid;
    }
    this.camDist = hi;
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
    this.tutorial = tutorial && this.level.id === 1;
    this.running = true; this.over = false;
    this.introT = 0;
    this.last = performance.now();
    this.emitHud();
    this.cbs.onAnnounce(`LEVEL ${this.level.id} — GOAL $${this.level.goal}`, 'level');
    cancelAnimationFrame(this.raf);
    this.loop(this.last);
    try { SoundManager.startMusic(); } catch { /* audio optional */ }
  }

  pause() { if (!this.running || this.over) return; this.running = false; cancelAnimationFrame(this.raf); }
  resume() { if (this.running || this.over) return; this.running = true; this.last = performance.now(); this.loop(this.last); }
  get paused() { return !this.running && !this.over; }

  // ── guests ──────────────────────────────────────────────────────────────────
  private freeQueueSlot(): number {
    for (let i = 0; i < QUEUE_SLOTS; i++) {
      if (!this.guests.some(g => g.queueIdx === i && (g.phase === 'queued' || g.phase === 'entering'))) return i;
    }
    return -1;
  }

  private spawn() {
    const slot = this.freeQueueSlot();
    if (slot < 0) return;
    const vi = this.nextVariant++ % CUSTOMER_VARIANTS.length;
    const variant = CUSTOMER_VARIANTS[vi];
    const vip = this.level.vip && Math.random() < VIP_CHANCE;
    const critic = this.criticPlanned && !this.criticArrived && this.spawned >= Math.floor(this.level.customers / 2);
    if (critic) this.criticArrived = true;

    const ch = critic
      ? chibi({ skin: SKINS[vi], outfit: 0x2A2A33, hair: 0xB8B8B8, accessory: 'sunglasses' })
      : chibi({ skin: SKINS[vi], outfit: variant.outfit, hair: variant.hair, accessory: variant.accessory });
    if (vip) {
      const crown = new THREE.Mesh(G('crown', () => new THREE.CylinderGeometry(0.22, 0.26, 0.16, 5)), M(0xFFC21E, { metalness: 0.6, roughness: 0.3 }));
      crown.position.y = 0.48; ch.head.add(crown);
    }
    if (critic) {
      const pad = new THREE.Mesh(G('notepad', () => new THREE.BoxGeometry(0.2, 0.26, 0.04)), M(0xFDFDF5, { roughness: 0.9 }));
      pad.position.set(0, -0.34, 0.14); pad.rotation.x = -0.5; ch.armL.add(pad);
    }
    ch.g.position.copy(DOOR);
    this.scene.add(ch.g);

    const dishes = this.level.dishes;
    const guest: Guest = {
      c: ch, variant, vip, critic,
      phase: 'entering', hearts: 5,
      queueIdx: slot, table: null,
      dish: dishes[(Math.random() * dishes.length) | 0],
      path: [new THREE.Vector3(QUEUE_X[slot], 0, QUEUE_Z)],
      t: Math.random() * 6, happy: false,
      decideT: 0, eatT: 0,
      bubble: null, bAcc: 0, lastBucket: -1,
    };
    this.guests.push(guest);
    this.spawned++;
    if (vip) { this.cbs.onAnnounce('VIP GUEST!', 'vip'); }
    if (critic) { this.cbs.onAnnounce('FOOD CRITIC! Keep them happy 🖋', 'vip'); }
    if (this.spawned === this.level.customers) this.cbs.onAnnounce('LAST GUESTS!', 'level');
  }

  private joinQueue(g: Guest) {
    g.phase = 'queued';
    g.c.g.rotation.y = 0; // face the player, asking to be seated
    const b = makeBubble();
    b.spr.position.set(0, 2.15, 0);
    g.c.g.add(b.spr);
    g.bubble = b;
    b.drawHearts('🪑', g.hearts / 5);
    try { SoundManager.customerArrival(); } catch { /* */ }
    this.tut('seat', 'Tap the guest, then tap a table to seat them 🪑');
  }

  private heartsRate(g: Guest, phaseMul: number): number {
    const vipMul = g.vip ? 1 / VIP_PATIENCE : 1;
    return (5 / (this.level.heartsSeconds * g.variant.patienceMul * this.boosts.patience)) * phaseMul * vipMul;
  }

  private walkoutGuest(g: Guest) {
    this.walkouts++;
    if (this.selected === g) this.select(null);
    const t = g.table;
    // drop tasks that no longer make sense; KEEP deliver tasks — they dispose
    // of the now-orphaned plate in the waiter's hands
    this.tasks = this.tasks.filter(tk => {
      if (tk.guest === g) return false;
      if (t && tk.table === t && (tk.kind === 'order' || tk.kind === 'collect')) return false;
      return true;
    });
    if (t) {
      this.kitchen.cancel(t.i);
      const ate = g.phase === 'check';
      t.guest = null;
      if (ate) this.makeDirty(t);
      else { t.state = 'clean'; if (t.food) { this.scene.remove(t.food); t.food = null; } }
      this.setRing(t);
    }
    if (g.bubble) g.bubble.draw('💢', 1, 0);
    g.phase = 'leaving'; g.happy = false;
    poseStand(g.c);
    g.c.g.position.y = 0;
    g.path = g.table ? [new THREE.Vector3(0.4, 0, g.table.chair.z), DOOR.clone()] : [DOOR.clone()];
    g.table = null;
    this.fx.sparkle(g.c.g.position.clone().setY(1.8), 0xE8442C, 8);
    try { SoundManager.customerAngry(); } catch { /* */ }
    this.cbs.onFlash('red');
    this.emitHud();
  }

  private despawn(g: Guest) {
    if (g.bubble) { g.c.g.remove(g.bubble.spr); g.bubble.dispose(); g.bubble = null; }
    this.scene.remove(g.c.g);
    this.guests = this.guests.filter(x => x !== g);
  }

  private makeDirty(t: TableD) {
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
    this.tut('clean', 'Dirty table! Tap it to bus the dishes ✨');
  }

  // ── input: every tap is an explicit command ─────────────────────────────────
  private toScreen(v: THREE.Vector3): { x: number; y: number } {
    const p = this.tmp.copy(v).project(this.camera);
    return { x: (p.x * 0.5 + 0.5) * innerWidth, y: (-p.y * 0.5 + 0.5) * innerHeight };
  }

  private tasked(table: TableD, kind?: TaskKind): boolean {
    const match = (tk: Task | null) => !!tk && tk.table === table && (!kind || tk.kind === kind);
    return match(this.current) || this.tasks.some(tk => match(tk));
  }
  private guestTasked(g: Guest): boolean {
    const match = (tk: Task | null) => !!tk && tk.guest === g;
    return match(this.current) || this.tasks.some(tk => match(tk));
  }
  private handsPlanned(): number {
    let n = this.carried.length;
    if (this.current?.kind === 'pickup') n++;
    n += this.tasks.filter(tk => tk.kind === 'pickup').length;
    return n;
  }
  private dirtyPlanned(): boolean {
    return !!this.carriedDirty || this.current?.kind === 'clean' || this.tasks.some(tk => tk.kind === 'clean');
  }
  private holdsOrWillHoldPlate(t: TableD): boolean {
    return this.carried.some(cr => cr.table === t)
      || (this.current?.kind === 'pickup' && this.current.table === t)
      || this.tasks.some(tk => tk.kind === 'pickup' && tk.table === t);
  }

  /** Everything the player could tap right now, with screen coordinates. */
  hotspots(): Hotspot[] {
    const out: Hotspot[] = [];
    for (const g of this.guests) {
      if (g.phase !== 'queued' || this.guestTasked(g)) continue;
      const p = this.toScreen(this.tmp2.copy(g.c.g.position).setY(1.2));
      out.push({ kind: 'guest', idx: this.guests.indexOf(g), x: p.x, y: p.y, action: this.selected === g ? 'deselect' : 'select' });
    }
    if (!this.dirtyPlanned() && this.handsPlanned() < HANDS_CAPACITY) {
      for (const rp of this.kitchen.readyPlates()) {
        const t = this.tables[rp.tableIndex];
        if (this.holdsOrWillHoldPlate(t)) continue;
        if (!t.guest || t.guest.phase !== 'waiting') continue;
        const p = this.toScreen(this.tmp2.copy(rp.pos).setY(rp.pos.y + 0.4));
        out.push({ kind: 'plate', idx: rp.tableIndex, x: p.x, y: p.y, action: 'pickup' });
      }
    }
    for (const t of this.tables) {
      const action = this.tableAction(t);
      if (!action) continue;
      const p = this.toScreen(this.tmp2.set(t.pos.x, 1.1, t.pos.z - 0.55));
      out.push({ kind: 'table', idx: t.i, x: p.x, y: p.y, action });
    }
    return out;
  }

  private tableAction(t: TableD): string {
    if (this.selected && t.state === 'clean' && !this.tasked(t)) return 'seat';
    if (this.selected) return '';
    const g = t.guest;
    if (g?.phase === 'handup' && !this.tasked(t, 'order')) return 'order';
    if (g?.phase === 'waiting' && this.holdsOrWillHoldPlate(t) && !this.tasked(t, 'deliver')) return 'deliver';
    if (g?.phase === 'check' && !this.tasked(t, 'collect')) return 'collect';
    if (t.state === 'dirty' && !this.tasked(t, 'clean') && this.carried.length === 0 && this.handsPlanned() === 0 && !this.carriedDirty) return 'clean';
    return '';
  }

  private onPointer(e: PointerEvent) {
    if (!this.running) return;
    this.pointerTap(e.clientX, e.clientY);
  }

  pointerTap(px: number, py: number) {
    if (!this.running) return;
    const spots = this.hotspots();
    let best: Hotspot | null = null, bestD = Infinity;
    for (const s of spots) {
      const d = Math.hypot(s.x - px, s.y - py);
      if (d < bestD) { bestD = d; best = s; }
    }
    const lim = Math.min(innerWidth, innerHeight) * 0.34;
    if (!best || bestD > lim) {
      if (this.selected) this.select(null); // tap elsewhere = cancel selection
      else this.bump();
      return;
    }
    this.execute(best);
  }

  private execute(s: Hotspot) {
    if (s.kind === 'guest') {
      const g = this.guests[s.idx];
      this.select(this.selected === g ? null : g);
      try { SoundManager.uiClick(); } catch { /* */ }
      return;
    }
    if (this.tasks.length >= 5) { this.bump(); return; }
    if (s.kind === 'plate') {
      this.push({ kind: 'pickup', table: this.tables[s.idx] });
      return;
    }
    const t = this.tables[s.idx];
    const action = this.tableAction(t) as TaskKind | '';
    if (!action) { this.bump(); return; }
    if (action === 'seat') {
      const g = this.selected!;
      this.select(null);
      this.push({ kind: 'seat', table: t, guest: g });
      t.state = 'taken'; t.guest = g; g.table = t; // reserve immediately
      this.setRing(t);
      return;
    }
    this.push({ kind: action, table: t });
  }

  private select(g: Guest | null) {
    this.selected = g;
    this.selRing.visible = !!g;
    if (g) this.tut('table', 'Now tap a clean table 🪑✨');
  }

  private push(task: Task) {
    this.tasks.push(task);
    this.setRing(task.table);
    try { SoundManager.uiClick(); } catch { /* */ }
    if (!this.current) this.nextTask();
  }

  // ── waiter task engine ──────────────────────────────────────────────────────
  private nextTask() {
    this.current = this.tasks.shift() ?? null;
    if (!this.current) return;
    const tk = this.current;
    const t = tk.table;
    switch (tk.kind) {
      case 'seat': {
        const g = tk.guest!;
        this.go(new THREE.Vector3(g.c.g.position.x, 0, QUEUE_Z - 1.1), () => {
          if (g.phase !== 'queued') return; // stormed off meanwhile
          g.phase = 'following';
          this.escorting = g;
          if (g.bubble) { g.c.g.remove(g.bubble.spr); g.bubble.dispose(); g.bubble = null; }
        });
        this.go(t.approach, () => this.doSeat(tk));
        break;
      }
      case 'order':
        this.go(t.approach, () => this.doOrder(t));
        break;
      case 'pickup':
        this.go(this.kitchen.pickupPoint(t.i), () => this.doPickup(t));
        break;
      case 'deliver':
        this.go(t.approach, () => this.doDeliver(t));
        break;
      case 'collect':
        this.go(t.approach, () => this.doCollect(t));
        break;
      case 'clean':
        this.go(t.approach, () => this.doGrabDirty(t));
        this.go(BIN, () => this.doDump());
        break;
    }
    this.nextStep();
  }

  private go(v: THREE.Vector3, cb?: () => void) { this.wq.push({ v: v.clone(), cb }); }
  private nextStep() {
    const s = this.wq.shift();
    if (!s) { this.wTarget = null; this.nextTask(); return; }
    this.wTarget = s.v; this.wCb = s.cb ?? null;
  }

  private chain(kind: TaskKind, atX: number, atZ: number) {
    if (this.chainKind === kind) this.chainN++;
    else { this.chainKind = kind; this.chainN = 1; }
    if (this.chainN >= 2) {
      const bonus = CHAIN_BONUS * (this.chainN - 1);
      this.score += bonus;
      this.fx.float(`CHAIN ×${this.chainN} +${bonus}`, atX, atZ, '#8AE07A', 2.7);
      if (this.chainN === 3 || this.chainN === 5 || this.chainN === 8) {
        this.cbs.onAnnounce(`CHAIN ×${this.chainN}!`, 'chain');
        this.cbs.onFlash('chain');
        try { SoundManager.comboUp(Math.min(4, this.chainN - 1)); } catch { /* */ }
      }
    }
    this.emitHud();
  }

  private doSeat(tk: Task) {
    const g = tk.guest!;
    const t = tk.table;
    if (g.phase !== 'following') { // guest left mid-escort
      if (t.guest === g) { t.guest = null; t.state = 'clean'; this.setRing(t); }
      this.escorting = null;
      return;
    }
    this.escorting = null;
    g.phase = 'sitting';
    g.path = [t.chair.clone()];
    this.score += POINTS.seat;
    this.fx.float('+' + POINTS.seat, t.pos.x, t.pos.z);
    this.chain('seat', t.pos.x, t.pos.z);
    this.setRing(t);
    try { SoundManager.seatCustomer(); } catch { /* */ }
  }

  private sitDown(g: Guest) {
    const t = g.table!;
    g.c.g.position.set(t.chair.x, 0.42, t.chair.z);
    g.c.g.rotation.y = 0;
    poseSit(g.c);
    g.phase = 'deciding';
    g.decideT = DECIDE_SECONDS * (0.8 + Math.random() * 0.5);
  }

  private raiseHand(g: Guest) {
    g.phase = 'handup';
    const b = makeBubble();
    b.spr.position.set(0, 1.85, 0);
    g.c.g.add(b.spr);
    g.bubble = b;
    b.drawHearts(DISH_EMOJI[g.dish], g.hearts / 5);
    g.c.armR.rotation.set(-2.6, 0, 0.3); // hand up!
    this.setRing(g.table!);
    try { SoundManager.customerArrival(); } catch { /* */ }
    this.tut('order', 'Hand up! Tap the table to take the order ✍️');
  }

  private doOrder(t: TableD) {
    const g = t.guest;
    if (!g || g.phase !== 'handup') return;
    this.writeT = 0.5;
    g.phase = 'waiting';
    g.c.armR.rotation.set(-0.9, 0, 0.2);
    if (g.bubble) g.bubble.drawHearts('🍳', g.hearts / 5);
    const from = new THREE.Vector3(t.pos.x, 1.9, t.pos.z);
    const to = new THREE.Vector3(-1.1, 2.4, -6.5);
    const spr = makeBubble(); spr.draw(DISH_EMOJI[g.dish], 1, 1); spr.spr.scale.set(0.9, 0.9, 1);
    spr.spr.position.copy(from); this.scene.add(spr.spr);
    const ticket: Ticket = { tableIndex: t.i, dish: g.dish, dead: false };
    (spr.spr.userData as { ticket?: Ticket; bubble?: Bubble }).ticket = ticket;
    (spr.spr.userData as { ticket?: Ticket; bubble?: Bubble }).bubble = spr;
    this.anims.push({ k: 'fly', t: 0, dur: 0.65, o: spr.spr, from, to });
    this.score += POINTS.order;
    this.fx.float('+' + POINTS.order, t.pos.x, t.pos.z);
    this.chain('order', t.pos.x, t.pos.z);
    this.setRing(t);
    try { SoundManager.orderTaken(); } catch { /* */ }
    this.tut('cook', 'The chef is cooking — watch the pan 🍳');
  }

  private plateReady(ticket: Ticket) {
    const t = this.tables[ticket.tableIndex];
    if (!t.guest || t.guest.phase !== 'waiting') return;
    try { SoundManager.foodReady(); } catch { /* */ }
    this.tut('pickup', `Order up! Tap the plate on the counter, then table ${t.i + 1} 🛎️`);
  }

  private doPickup(t: TableD) {
    const out = this.kitchen.takeReady(t.i);
    if (!out) return; // plate got binned meanwhile
    const hand = this.handL.children.length === 0 ? this.handL : this.handR;
    out.plate.position.set(0, 0, 0);
    out.plate.rotation.set(0, 0, 0);
    out.plate.scale.setScalar(0.85);
    hand.add(out.plate);
    this.carried.push({ table: t, plate: out.plate });
    poseCarry(this.waiter);
    this.pop(hand, 1);
    this.chain('pickup', BIN.x + 4, -4.2);
    try { SoundManager.uiClick(); } catch { /* */ }
  }

  private doDeliver(t: TableD) {
    const idx = this.carried.findIndex(cr => cr.table === t);
    if (idx < 0) return;
    const { plate: pl } = this.carried[idx];
    this.carried.splice(idx, 1);
    (pl.parent as THREE.Object3D)?.remove(pl);
    if (this.carried.length === 0) poseStand(this.waiter);
    const g = t.guest;
    if (!g || g.phase !== 'waiting') {
      this.fx.steam(new THREE.Vector3(t.pos.x, 1.5, t.pos.z), true);
      this.fx.float('WASTED', t.pos.x, t.pos.z, '#B9C0CC');
      return;
    }
    pl.scale.setScalar(1);
    pl.position.set(t.pos.x - 0.1, 1.06, t.pos.z + 0.15);
    this.scene.add(pl);
    this.pop(pl, 1);
    t.food = pl;
    g.phase = 'eating';
    g.eatT = this.level.eatTime;
    if (g.bubble) g.bubble.draw('😋', 1, 1);
    this.hop(g.c.g);
    this.fx.sparkle(new THREE.Vector3(t.pos.x, 1.5, t.pos.z), 0xFFF0B0, 8);
    this.fx.steam(new THREE.Vector3(t.pos.x, 1.4, t.pos.z));
    let pts = POINTS.deliver;
    if (this.carried.length >= 1) pts += DOUBLE_HANDS_BONUS; // both hands were full
    this.score += pts;
    this.fx.float('+' + pts, t.pos.x, t.pos.z);
    this.chain('deliver', t.pos.x, t.pos.z);
    this.setRing(t);
    try { SoundManager.deliverFood(); } catch { /* */ }
    this.tut('eat', 'Bon appétit! Collect the bill when they finish 💵');
  }

  private doCollect(t: TableD) {
    const g = t.guest;
    if (!g || g.phase !== 'check') return;
    const heartsFrac = g.hearts / 5;
    const rave = g.critic && heartsFrac >= CRITIC_RAVE_HEARTS;
    const tip = Math.round(
      MENU_ITEMS[g.dish].price * 5
      * Math.max(MIN_TIP_FRAC, heartsFrac)
      * (g.vip ? VIP_PAY : 1)
      * (rave ? CRITIC_PAY : 1),
    );
    this.score += tip;
    this.served++;
    this.fx.coinBurst(new THREE.Vector3(t.pos.x, 1.4, t.pos.z), 8);
    const scr = this.toScreen(this.tmp2.set(t.pos.x, 1.5, t.pos.z));
    this.cbs.onCoinFly(scr.x, scr.y, Math.min(12, 4 + Math.round(tip / 60)));
    this.fx.float('+$' + tip, t.pos.x, t.pos.z);
    if (g.vip) this.fx.float('VIP ×' + VIP_PAY, t.pos.x, t.pos.z + 0.5, '#FFE27A', 2.7);
    if (g.critic) {
      if (rave) {
        this.cbs.onAnnounce('RAVE REVIEW! ×' + CRITIC_PAY, 'chain');
        this.fx.sparkle(new THREE.Vector3(t.pos.x, 1.8, t.pos.z), 0xD8E4F0, 14);
        try { SoundManager.unlockEarned(); } catch { /* */ }
      } else this.fx.float('"meh."', t.pos.x, t.pos.z + 0.5, '#B9C0CC', 2.7);
    }
    this.hop(g.c.g); this.hop(this.waiter.g);
    this.cbs.onFlash('gold');
    this.chain('collect', t.pos.x, t.pos.z);
    try { SoundManager.paymentCollected(); } catch { /* */ }
    if (g.bubble) { g.c.g.remove(g.bubble.spr); g.bubble.dispose(); g.bubble = null; }
    g.phase = 'leaving'; g.happy = true;
    poseStand(g.c);
    g.c.g.position.set(t.chair.x, 0, t.chair.z);
    g.path = [new THREE.Vector3(0.4, 0, t.chair.z), DOOR.clone()];
    g.table = null;
    t.guest = null;
    this.makeDirty(t);
    this.emitHud();
  }

  private doGrabDirty(t: TableD) {
    if (!t.dirty) return;
    this.scene.remove(t.dirty);
    t.dirty.position.set(0, 0.1, 0);
    t.dirty.scale.setScalar(0.9);
    this.handL.add(t.dirty);
    this.carriedDirty = t.dirty;
    t.dirty = null;
    t.state = 'clean';
    poseCarry(this.waiter);
    this.setRing(t);
    this.fx.sparkle(new THREE.Vector3(t.pos.x, 1.4, t.pos.z), 0xA8E4F0, 10);
    this.score += POINTS.clean;
    this.fx.float('+' + POINTS.clean, t.pos.x, t.pos.z);
    this.chain('clean', t.pos.x, t.pos.z);
    try { SoundManager.uiClick(); } catch { /* */ }
  }

  private doDump() {
    if (this.carriedDirty) {
      this.handL.remove(this.carriedDirty);
      this.carriedDirty = null;
      this.fx.steam(new THREE.Vector3(BIN.x, 1.4, -5.3), true);
      try { SoundManager.dishwasher(); } catch { /* */ }
    }
    if (this.carried.length === 0) poseStand(this.waiter);
  }

  // ── fx helpers ──────────────────────────────────────────────────────────────
  private setRing(t: TableD) {
    const mat = t.ring.material as THREE.MeshBasicMaterial;
    let color = 0xFFD24A, op = 0;
    const g = t.guest;
    if (this.selected && t.state === 'clean' && !this.tasked(t)) { color = 0x8AE07A; op = 0.9; } // seat here!
    else if (g?.phase === 'handup') { color = 0xFF8A3D; op = 0.8; }
    else if (g?.phase === 'waiting' && this.holdsOrWillHoldPlate(t)) { color = 0xFF8A3D; op = 0.9; }
    else if (g?.phase === 'check') { color = 0xFFC21E; op = 0.9; }
    else if (t.state === 'dirty') { color = 0x5FB8D8; op = 0.6; }
    if (this.tasked(t)) op = Math.min(op, 0.25);
    mat.color.setHex(color);
    (t.ring.userData as { target?: number }).target = op;
  }
  private refreshRings() { for (const t of this.tables) this.setRing(t); }
  private pop(o: THREE.Object3D, s = 1) { o.scale.setScalar(0.01); this.anims.push({ k: 'pop', o, t: 0, s }); }
  private hop(o: THREE.Object3D) { this.anims.push({ k: 'hop', o, t: 0, s: o.scale.x }); }
  private bump() { this.anims.push({ k: 'bump', t: 0 }); }
  // throttled bubble redraw — avoids a CanvasTexture upload per guest per frame
  private tickBubble(g: Guest, emoji: string, dt: number) {
    if (!g.bubble) return;
    g.bAcc += dt;
    const bucket = Math.round((g.hearts / 5) * 24);
    if (g.bAcc >= 0.15 || bucket !== g.lastBucket) {
      g.bubble.drawHearts(emoji, g.hearts / 5);
      g.lastBucket = bucket; g.bAcc = 0;
    }
  }

  private emitHud() {
    let urgent = false;
    for (const g of this.guests) {
      if ((g.phase === 'queued' || g.phase === 'handup' || g.phase === 'waiting' || g.phase === 'check') && g.hearts < 1.2) urgent = true;
    }
    const guestsLeft = (this.level.customers - this.spawned) + this.guests.filter(g => g.phase !== 'leaving').length;
    this.cbs.onHud({
      score: this.score, level: this.level.id, goal: this.level.goal, expert: this.level.expert,
      guestsLeft, chain: this.chainN, chainKind: this.chainKind, urgent,
    });
  }

  private tut(key: string, text: string) {
    if (!this.tutorial || this.tutSeen.has(key)) return;
    this.tutSeen.add(key);
    this.cbs.onAnnounce(text, 'tut');
  }

  // ── main loop ───────────────────────────────────────────────────────────────
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
    this.emitHud();

    // spawning into the waiting line
    if (this.spawned < this.level.customers) {
      this.nextSpawn -= dt;
      if (this.nextSpawn <= 0) {
        this.spawn();
        this.nextSpawn = this.level.spawnMin + Math.random() * (this.level.spawnMax - this.level.spawnMin);
      }
    }

    this.updateWaiter(dt, now);
    this.updateGuests(dt, now);
    this.kitchen.update(dt, now);
    try { SoundManager.setSizzle(this.kitchen.activeBurners()); } catch { /* */ }
    this.updateArrow(now);

    // selection marker follows its guest
    if (this.selected) {
      this.selRing.position.copy(this.selected.c.g.position).setY(0.05);
      this.selRing.scale.setScalar(1 + Math.sin(now / 200) * 0.08);
      this.refreshRings(); // clean tables glow green while choosing
    }

    for (const t of this.tables) {
      const tgt = (t.ring.userData as { target?: number }).target ?? 0;
      const mat = t.ring.material as THREE.MeshBasicMaterial;
      mat.opacity += (tgt - mat.opacity) * Math.min(1, dt * 8);
      if (tgt > 0) t.ring.scale.setScalar(1 + Math.sin(now / 250) * 0.05);
    }

    this.updateAnims(dt);
    this.fx.update(dt);
    this.introT = Math.min(1, this.introT + dt / 1.4);

    // level end: every guest of the level has been resolved
    if (this.spawned >= this.level.customers && this.guests.length === 0 && !this.current && this.tasks.length === 0) {
      this.end();
    }
  }

  private updateWaiter(dt: number, now: number) {
    const w = this.waiter;
    if (this.writeT > 0) {
      this.writeT -= dt;
      w.armR.rotation.x = -1.1 + Math.sin(now / 60) * 0.25;
      if (this.writeT <= 0) { w.armR.rotation.x = 0; if (this.carried.length || this.carriedDirty) poseCarry(w); else poseStand(w); }
      return;
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
        if (!this.carried.length && !this.carriedDirty) {
          w.armL.rotation.x = Math.sin(now / 75) * 0.5;
          w.armR.rotation.x = -Math.sin(now / 75) * 0.5;
        }
      }
    } else {
      w.g.position.y = Math.sin(now / 600) * 0.04;
      w.g.rotation.z *= 0.85;
      w.armL.rotation.x *= 0.85; w.armR.rotation.x *= 0.85;
    }
    // escorted guest trails the waiter
    if (this.escorting) {
      const g = this.escorting;
      this.tmp2.copy(w.g.position).addScaledVector(this.tmp.set(Math.sin(w.g.rotation.y), 0, Math.cos(w.g.rotation.y)).normalize(), -0.95);
      this.tmp2.y = 0;
      const d = this.tmp2.distanceTo(g.c.g.position);
      if (d > 0.05) {
        const dir = this.tmp2.clone().sub(g.c.g.position).normalize();
        g.c.g.position.addScaledVector(dir, Math.min(d, 8.5 * dt));
        g.c.g.rotation.y = Math.atan2(dir.x, dir.z);
        g.c.g.position.y = Math.abs(Math.sin(g.t * 9)) * 0.09;
        g.t += dt;
      }
    }
  }

  private updateGuests(dt: number, now: number) {
    void now;
    // queue compaction: guests step forward into freed slots
    const queued = this.guests.filter(g => g.phase === 'queued' || g.phase === 'entering');
    queued.sort((a, b) => a.queueIdx - b.queueIdx);
    queued.forEach((g, i) => {
      if (g.queueIdx !== i && g.phase === 'queued') {
        g.queueIdx = i;
        g.path = [new THREE.Vector3(QUEUE_X[i], 0, QUEUE_Z)];
      }
    });

    for (let i = this.guests.length - 1; i >= 0; i--) {
      const g = this.guests[i];
      g.t += dt;
      const o = g.c.g;
      const walk = (speedMul = 1): boolean => {
        const target = g.path[0];
        if (!target) return true;
        this.tmp.copy(target).sub(o.position); this.tmp.y = 0;
        const d = this.tmp.length();
        if (d < 0.09) { g.path.shift(); return g.path.length === 0; }
        this.tmp.normalize();
        o.position.addScaledVector(this.tmp, Math.min(3.6 * g.variant.speed * speedMul * dt, d));
        o.rotation.y = Math.atan2(this.tmp.x, this.tmp.z);
        const stride = g.variant.speed > 1.15 ? 11 : g.variant.speed < 0.8 ? 6.5 : 9;
        o.position.y = Math.abs(Math.sin(g.t * stride)) * (g.happy && g.phase === 'leaving' ? 0.16 : 0.09);
        g.c.armL.rotation.x = Math.sin(g.t * stride) * 0.45;
        g.c.armR.rotation.x = -Math.sin(g.t * stride) * 0.45;
        return false;
      };

      switch (g.phase) {
        case 'entering':
          if (walk()) this.joinQueue(g);
          break;
        case 'queued':
          walk(); // stepping forward in the line
          g.hearts -= this.heartsRate(g, DECAY_QUEUE) * dt;
          o.position.y = Math.sin(g.t * 2) * 0.02;
          this.tickBubble(g, '🪑', dt);
          if (g.hearts <= 0) this.walkoutGuest(g);
          break;
        case 'following':
          break; // driven by updateWaiter
        case 'sitting':
          if (walk()) this.sitDown(g);
          break;
        case 'deciding':
          g.decideT -= dt;
          o.position.y = 0.42 + Math.sin(g.t * 2) * 0.02;
          if (g.decideT <= 0) this.raiseHand(g);
          break;
        case 'handup':
          g.hearts -= this.heartsRate(g, DECAY_HANDUP) * dt;
          o.position.y = 0.42 + Math.sin(g.t * 5) * 0.03;
          g.c.armR.rotation.x = -2.6 + Math.sin(g.t * 5) * 0.15;
          this.tickBubble(g, DISH_EMOJI[g.dish], dt);
          if (g.hearts <= 0) this.walkoutGuest(g);
          break;
        case 'waiting': {
          const cold = this.kitchen.hasReady(g.table!.i);
          g.hearts -= this.heartsRate(g, cold ? DECAY_COLD : DECAY_COOKING) * dt;
          o.position.y = 0.42 + Math.sin(g.t * 2) * 0.02;
          this.tickBubble(g, cold ? '🛎️' : '🍳', dt);
          if (g.hearts <= 0) this.walkoutGuest(g);
          break;
        }
        case 'eating':
          g.eatT -= dt;
          o.position.y = 0.42 + Math.abs(Math.sin(g.t * 6)) * 0.04;
          g.c.head.rotation.x = Math.abs(Math.sin(g.t * 6)) * 0.18;
          g.c.armR.rotation.x = -1.4 + Math.sin(g.t * 6) * 0.3;
          if (g.table?.food) g.table.food.scale.setScalar(Math.max(0.25, g.eatT / this.level.eatTime));
          if (g.eatT <= 0) {
            g.phase = 'check';
            g.c.head.rotation.x = 0;
            poseSit(g.c);
            if (g.bubble) g.bubble.drawHearts('💵', g.hearts / 5);
            else {
              const b = makeBubble(); b.spr.position.set(0, 1.85, 0); g.c.g.add(b.spr); g.bubble = b;
              b.drawHearts('💵', g.hearts / 5);
            }
            this.setRing(g.table!);
            this.tut('collect', 'Tap the table to collect 💵');
          }
          break;
        case 'check':
          g.hearts -= this.heartsRate(g, DECAY_CHECK) * dt;
          o.position.y = 0.42 + Math.abs(Math.sin(g.t * 4.5)) * 0.04;
          this.tickBubble(g, '💵', dt);
          if (g.hearts <= 0) this.walkoutGuest(g);
          break;
        case 'leaving':
          if (walk(g.happy ? 1 : 1.5)) this.despawn(g);
          break;
      }
    }
  }

  private updateAnims(dt: number) {
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
  }

  // priority arrow over the single most urgent guest
  private updateArrow(now: number) {
    let best: Guest | null = null, bestH = 9;
    for (const g of this.guests) {
      if (g.phase === 'queued' || g.phase === 'handup' || g.phase === 'check'
        || (g.phase === 'waiting' && g.table && this.kitchen.hasReady(g.table.i))) {
        if (g.hearts < bestH) { bestH = g.hearts; best = g; }
      }
    }
    if (best && bestH < 3.5) {
      this.arrow.visible = true;
      const p = best.c.g.position;
      this.arrow.position.set(p.x, (best.phase === 'queued' ? 2.9 : 3.2) + Math.sin(now / 220) * 0.13, p.z);
      this.arrowMat.color.setHex(best.phase === 'check' ? 0xFFC21E : 0xFF8A3D);
      this.arrow.scale.setScalar(bestH < 1.2 ? 1 + Math.sin(now / 90) * 0.18 : 1);
    } else this.arrow.visible = false;
  }

  private end() {
    this.running = false; this.over = true;
    cancelAnimationFrame(this.raf);
    try { SoundManager.setSizzle(0); } catch { /* */ }
    const mid = Math.round((this.level.goal + this.level.expert) / 2);
    const stars = this.score >= this.level.expert ? 3 : this.score >= mid ? 2 : this.score >= this.level.goal ? 1 : 0;
    try { if (stars >= 1) SoundManager.roundEnd(); else SoundManager.comboLost(); } catch { /* */ }
    this.cbs.onOver({
      levelId: this.level.id, score: this.score, stars, won: stars >= 1,
      served: this.served, walkouts: this.walkouts,
      goal: this.level.goal, expert: this.level.expert,
    });
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
      score: this.score, served: this.served, walkouts: this.walkouts,
      spawned: this.spawned, guests: this.guests.length,
      debug: {
        tasks: (this.current ? [this.current] : []).concat(this.tasks).map(tk => tk.kind + ':' + tk.table.i),
        hands: this.carried.length, dirtyCarried: !!this.carriedDirty,
        phases: this.guests.map(g => g.phase + '@' + (g.table ? 't' + g.table.i : 'q' + g.queueIdx)),
        tables: this.tables.map(t => t.state),
        selected: this.selected ? this.guests.indexOf(this.selected) : -1,
        kitchen: this.kitchen.debug(),
        chain: this.chainKind + 'x' + this.chainN,
      },
    };
  }
  /** Headless driver: performs the tap a decent player would make, via the
   * real pointer pipeline. Returns what it did. */
  autoStep(): string {
    const spots = this.hotspots();
    const pri = ['collect', 'deliver', 'pickup', 'order', 'seat', 'clean', 'deselect', 'select'];
    let best: Hotspot | null = null, bestP = 99;
    for (const s of spots) {
      const p = pri.indexOf(s.action);
      if (p >= 0 && p < bestP) { bestP = p; best = s; }
    }
    if (!best) return '';
    this.pointerTap(best.x, best.y);
    return best.action + ':' + best.kind + best.idx;
  }
  levelState() {
    return { spawned: this.spawned, customers: this.level.customers, guests: this.guests.length, score: this.score, over: this.over };
  }
}

function backOut(x: number) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
