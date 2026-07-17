import * as THREE from 'three';
import {
  MENU_ITEMS, CUSTOMER_VARIANTS, Archetype, LevelDef,
  QUEUE_SLOTS, HANDS_CAPACITY,
  DECAY_QUEUE, DECAY_HANDUP, DECAY_COOKING, DECAY_COLD, DECAY_CHECK, DECIDE_SECONDS,
  POINTS, DOUBLE_HANDS_BONUS, CHAIN_BONUS, MIN_TIP_FRAC,
  VIP_CHANCE, VIP_PAY, VIP_PATIENCE, CRITIC_CHANCE, CRITIC_PAY, CRITIC_RAVE_HEARTS,
} from '../config/GameConfig';
import {
  M, G, shadows, DISH_EMOJI, chibi, Chibi, tickBlink,
  poseSit, poseStand, poseCarry, makeBubble, Bubble, numberSprite,
  woodFloorTexture, signTexture, ginghamTexture,
  checkerTexture, pathTexture, awningTexture, skyTexture, cloudTexture, birdTexture,
} from './builders';
import { Effects } from './effects';
import { Kitchen, Ticket } from './kitchen';
import { SoundManager } from '../systems/SoundManager';
import { Prefs } from '../systems/Prefs';
import { P } from '../config/Palette';

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
  /** Tap feedback ripple at screen coords; hit = the tap did something. */
  onTap: (x: number, y: number, hit: boolean) => void;
  /** Tutorial pointer hand — screen coords of the suggested tap, or null to hide. */
  onHint: (x: number, y: number, visible: boolean) => void;
}
/** Multipliers from purchased upgrades (ProgressionSystem.getBoosts). */
export interface Boosts { speed: number; cook: number; patience: number; tip: number; }

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
interface Anim { k: 'pop' | 'hop' | 'bump' | 'fly'; t: number; o?: THREE.Object3D; s?: number; from?: THREE.Vector3; to?: THREE.Vector3; dur?: number; }
export interface Hotspot { kind: 'guest' | 'plate' | 'table'; idx: number; x: number; y: number; action: string; }

// ── Layout (portrait-first) ───────────────────────────────────────────────────
const TABLE_XZ: [number, number][] = [[-2.05, -2.55], [2.05, -2.55], [-2.05, 0.7], [2.05, 0.7], [-2.05, 3.95]];
const DOOR = new THREE.Vector3(0.4, 0, 9.9);
const MAT = new THREE.Vector3(0.4, 0, 6.4);
const QUEUE_X = [-1.35, -0.2, 0.95, 2.1];
const QUEUE_Z = 6.0;
const WAITER_HOME = new THREE.Vector3(2.4, 0, 4.6);
const BIN = new THREE.Vector3(-3.4, 0, -4.7);
const LOOK = new THREE.Vector3(0, 0.8, -0.2);
const CAM_DIST = 46; // fixed orbit radius; the ortho frustum does the framing
// Gameplay-critical points the camera must keep on screen at any aspect ratio.
// The diorama platform is allowed to bleed off-screen horizontally in
// portrait — but its front lip and the back wall crown stay in frame so the
// floating-island silhouette always reads.
const FIT_POINTS: [number, number, number][] = [
  [-2.9, 3.5, -2.55], [2.9, 3.5, -2.55],
  [-2.9, 3.5, 0.7], [2.9, 3.5, 0.7],
  [-2.9, 3.5, 3.95],
  [-3.9, 2.9, -5.85], [4.4, 1.3, -5.85],
  [-2.5, 3.1, -8.05], [0.3, 3.1, -8.05],
  [-2.3, 3.0, 6.0], [3.1, 3.0, 6.0],   // the waiting line + its bubbles
  [0.4, 4.5, 9.9],                      // the entrance awning
  [0.4, -1.2, 11.3],                    // the platform's front lip
  [0, 6.4, -9.5],                       // the back wall crown
];

const SKINS = P.skinTones;

export class RestaurantGame {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private fitCam: THREE.OrthographicCamera;
  private camDir = new THREE.Vector3();
  private camHalfH = 10; // ortho frustum half-height chosen by the fit search
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
  private nextSpawn = 0.5; // the first guest is at the door as the shift opens
  private nextVariant = 0;
  private chainKind: TaskKind | '' = '';
  private chainN = 0;
  private criticPlanned = false;
  private criticArrived = false;

  private running = false;
  private over = false;
  private endT = -1;  // ≥0 while the end-of-shift beat plays before the card
  private raf = 0;
  private last = 0;

  private tutorial = false;
  private tutSeen = new Set<string>();

  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private arrow!: THREE.Group;
  private arrowMat!: THREE.MeshBasicMaterial;

  // living-restaurant set pieces
  private stoveLight!: THREE.PointLight;
  private clockHand!: THREE.Mesh;
  private washer!: Chibi;
  private washT = 0;          // >0 while the dish washer is scrubbing
  private doorL!: THREE.Mesh;
  private doorR!: THREE.Mesh;
  private doorOpen = 0;       // 0 closed … 1 swung open
  private clouds: { spr: THREE.Sprite; speed: number }[] = [];
  private birds: { spr: THREE.Sprite; speed: number; baseY: number; ph: number }[] = [];
  private hudAcc = 0;         // HUD refresh throttle
  private dustAcc = 0;        // distance since the waiter's last footstep puff
  private hintAcc = 0;        // tutorial hand refresh throttle
  private hintShown = false;
  private reduceMotion = !Prefs.motion;

  constructor(
    private container: HTMLElement,
    private cbs: GameCallbacks,
    private level: LevelDef,
    private boosts: Boosts = { speed: 1, cook: 1, patience: 1, tip: 1 },
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:block;z-index:1;';
    container.appendChild(this.renderer.domElement);

    // A floating diorama on a soft sky — no fog, no infinite floor.
    this.scene.background = skyTexture();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    this.fitCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);

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

  // ── world: the Candy Diner diorama ─────────────────────────────────────────
  private buildRoom() {
    // high-key lighting — flatness is banished by color, not by contrast
    this.scene.add(new THREE.AmbientLight(0xFFF4E2, 0.92));
    this.scene.add(new THREE.HemisphereLight(0xFFFDF2, 0xFFC98A, 0.5));
    const key = new THREE.DirectionalLight(0xFFF2DC, 0.72);
    key.position.set(7, 16, 9); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004;
    Object.assign(key.shadow.camera, { near: 1, far: 60, left: -14, right: 14, top: 16, bottom: -16 });
    key.shadow.camera.updateProjectionMatrix();
    this.scene.add(key);
    const dine = new THREE.PointLight(0xFFD27A, 0.35, 26); dine.position.set(0, 7.5, 1); this.scene.add(dine);
    const kitchenL = new THREE.PointLight(0xFFB35C, 0.5, 18); kitchenL.position.set(-1, 5, -6.5); this.scene.add(kitchenL);
    // stove glow — brightens with every pan that's actively cooking
    this.stoveLight = new THREE.PointLight(0xFF8A3D, 0, 10);
    this.stoveLight.position.set(-1.1, 2.6, -7.6); this.scene.add(this.stoveLight);

    // the floating island: a rounded slab with a soft caramel edge
    const platGeo = G('platform', () => {
      const w = 8.4, zNear = 11.4, zFar = -9.8, r = 2.2;
      const s = new THREE.Shape();
      s.moveTo(-w + r, zFar);
      s.lineTo(w - r, zFar); s.quadraticCurveTo(w, zFar, w, zFar + r);
      s.lineTo(w, zNear - r); s.quadraticCurveTo(w, zNear, w - r, zNear);
      s.lineTo(-w + r, zNear); s.quadraticCurveTo(-w, zNear, -w, zNear - r);
      s.lineTo(-w, zFar + r); s.quadraticCurveTo(-w, zFar, -w + r, zFar);
      const g = new THREE.ExtrudeGeometry(s, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 3 });
      g.rotateX(Math.PI / 2);
      g.translate(0, -0.3, 0); // bevel crest sits at y = 0
      return g;
    });
    const platform = new THREE.Mesh(platGeo, [M(P.platformRim, { roughness: 0.8 }), M(P.platformSide, { roughness: 0.7 })]);
    platform.receiveShadow = true;
    this.scene.add(platform);
    // soft "cloud shadow" far beneath the island sells the float
    const under = new THREE.Mesh(G('underShadow', () => new THREE.CircleGeometry(9.5, 36)),
      new THREE.MeshBasicMaterial({ color: P.ink, transparent: true, opacity: 0.12 }));
    under.rotation.x = -Math.PI / 2; under.position.set(0.4, -4.2, 0.8); under.scale.set(1, 0.9, 1);
    this.scene.add(under);

    // color-blocked floor zones: tile = kitchen, wood = dining, pavers = entry
    const woodF = new THREE.Mesh(G('floorWood', () => new THREE.PlaneGeometry(16.8, 11.2)),
      new THREE.MeshStandardMaterial({ map: woodFloorTexture(), roughness: 0.85 }));
    woodF.rotation.x = -Math.PI / 2; woodF.position.set(0, 0.02, 1.3); woodF.receiveShadow = true; this.scene.add(woodF);
    const tileF = new THREE.Mesh(G('floorTile', () => new THREE.PlaneGeometry(16.8, 5.6)),
      new THREE.MeshStandardMaterial({ map: checkerTexture(), roughness: 0.9 }));
    (tileF.material as THREE.MeshStandardMaterial).map!.repeat.set(6, 2);
    tileF.rotation.x = -Math.PI / 2; tileF.position.set(0, 0.025, -7.1); tileF.receiveShadow = true; this.scene.add(tileF);
    const pathF = new THREE.Mesh(G('floorPath', () => new THREE.PlaneGeometry(5.2, 4.6)),
      new THREE.MeshStandardMaterial({ map: pathTexture(), roughness: 0.9 }));
    pathF.rotation.x = -Math.PI / 2; pathF.position.set(0.4, 0.025, 9.1); pathF.receiveShadow = true; this.scene.add(pathF);

    // back wall with coral crown + base, two sky windows, the wall clock
    const wall = new THREE.Mesh(G('wallB', () => new THREE.BoxGeometry(16.8, 6.4, 0.5)), M(P.wallCream, { roughness: 1 }));
    wall.position.set(0, 3.2, -9.55); wall.receiveShadow = true; this.scene.add(wall);
    const crown = new THREE.Mesh(G('wallCrown', () => new THREE.BoxGeometry(17.2, 0.4, 0.7)), M(P.wallCoral, { roughness: 0.9 }));
    crown.position.set(0, 6.4, -9.55); this.scene.add(crown);
    const baseBand = new THREE.Mesh(G('wallBase', () => new THREE.BoxGeometry(16.8, 1.1, 0.55)), M(P.wallCoral, { roughness: 0.9 }));
    baseBand.position.set(0, 0.55, -9.53); this.scene.add(baseBand);
    for (const wx of [-6.9, 6.6]) {
      const frame = new THREE.Mesh(G('winFrame', () => new THREE.BoxGeometry(2.5, 2.5, 0.2)), M(0xFFFFFF, { roughness: 0.7 }));
      frame.position.set(wx, 3.7, -9.34); this.scene.add(frame);
      const glass = new THREE.Mesh(G('winSky', () => new THREE.PlaneGeometry(2.05, 2.05)),
        new THREE.MeshBasicMaterial({ color: P.skyTop }));
      glass.position.set(wx, 3.7, -9.22); this.scene.add(glass);
      const bar = new THREE.Mesh(G('winBar', () => new THREE.BoxGeometry(2.3, 0.1, 0.05)), M(0xFFFFFF, { roughness: 0.7 }));
      bar.position.set(wx, 3.7, -9.2); this.scene.add(bar);
    }
    const clockG = new THREE.Group();
    const clockFace = new THREE.Mesh(G('clockF', () => new THREE.CylinderGeometry(0.6, 0.6, 0.08, 28)), M(0xFFFFFF, { roughness: 0.5 }));
    clockFace.rotation.x = Math.PI / 2; clockG.add(clockFace);
    const clockRim = new THREE.Mesh(G('clockR', () => new THREE.TorusGeometry(0.6, 0.08, 10, 28)), M(P.wallCoral));
    clockG.add(clockRim);
    this.clockHand = new THREE.Mesh(G('clockH', () => {
      const g = new THREE.BoxGeometry(0.05, 0.46, 0.04);
      g.translate(0, 0.2, 0); // rotate about the base of the hand
      return g;
    }), M(P.danger));
    this.clockHand.position.z = 0.07; clockG.add(this.clockHand);
    const clockHr = new THREE.Mesh(G('clockH2', () => new THREE.BoxGeometry(0.06, 0.3, 0.04)), M(P.ink));
    clockHr.position.z = 0.06; clockHr.rotation.z = -2.1; clockG.add(clockHr);
    clockG.position.set(1.6, 5.3, -9.28);
    this.scene.add(clockG);

    // low side rails with planters — the diorama stays open and readable
    const railGeo = G('rail', () => new THREE.BoxGeometry(0.5, 1.0, 16.2));
    const lipGeo = G('railLip', () => new THREE.BoxGeometry(0.66, 0.2, 16.4));
    for (const sx of [-1, 1]) {
      const rail = new THREE.Mesh(railGeo, M(P.wallCream, { roughness: 0.95 }));
      rail.position.set(sx * 8.15, 0.5, -1.7); this.scene.add(shadows(rail));
      const lip = new THREE.Mesh(lipGeo, M(P.wallCoral, { roughness: 0.9 }));
      lip.position.set(sx * 8.15, 1.06, -1.7); this.scene.add(lip);
      for (const pz of [-7.2, -1.7, 3.8]) {
        const pot = new THREE.Mesh(G('railPot', () => new THREE.BoxGeometry(0.85, 0.62, 0.85)), M(P.wallCoral, { roughness: 0.8 }));
        pot.position.set(sx * 8.15, 1.45, pz); this.scene.add(shadows(pot));
        const bush = new THREE.Mesh(G('railBush', () => new THREE.IcosahedronGeometry(0.55, 1)), M(0x58C96B, { roughness: 0.9 }));
        bush.position.set(sx * 8.15, 2.1, pz); this.scene.add(shadows(bush));
      }
    }

    // string lights strung between poles on the rails, high above the tables
    const poleGeo = G('lightPole', () => new THREE.CylinderGeometry(0.07, 0.09, 6.4, 8));
    const strands: [number, number][] = [[-4.6, 6.15], [5.3, 6.15]];
    for (const [pz] of strands) {
      for (const sx of [-1, 1]) {
        const pole = new THREE.Mesh(poleGeo, M(P.woodDark, { roughness: 0.8 }));
        pole.position.set(sx * 8.15, 4.2, pz); this.scene.add(pole);
      }
    }
    const bulbGeo = G('bulb', () => new THREE.SphereGeometry(0.11, 8, 6));
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xFFE9A8, emissive: 0xFFC96B, emissiveIntensity: 1.35, roughness: 0.4 });
    const bulbs = new THREE.InstancedMesh(bulbGeo, bulbMat, strands.length * 13);
    let bi = 0; const im = new THREE.Matrix4();
    for (const [sz, sy] of strands) {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 28; k++) {
        const f = k / 28;
        pts.push(new THREE.Vector3(-8.15 + f * 16.3, sy + 1.25 - Math.sin(f * Math.PI) * 1.15, sz));
      }
      const cord = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.022, 5),
        M(P.ink, { roughness: 0.9 }),
      );
      this.scene.add(cord);
      for (let k = 0; k < 13; k++) {
        const f = (k + 0.5) / 13;
        im.setPosition(-8.15 + f * 16.3, sy + 1.17 - Math.sin(f * Math.PI) * 1.15, sz);
        bulbs.setMatrixAt(bi++, im);
      }
    }
    this.scene.add(bulbs);

    // entrance façade: awning, swing doors, welcome sign, waiting-line rope
    this.buildDoor();
    for (const rx of [-2.6, 3.4]) {
      const post = new THREE.Mesh(G('post', () => new THREE.CylinderGeometry(0.06, 0.09, 1.1, 10)), M(0xC9A227, { metalness: 0.6, roughness: 0.3 }));
      post.position.set(MAT.x + rx, 0.55, QUEUE_Z + 0.9); this.scene.add(shadows(post));
      const knob = new THREE.Mesh(G('knob', () => new THREE.SphereGeometry(0.11, 10, 8)), M(0xC9A227, { metalness: 0.6, roughness: 0.3 }));
      knob.position.set(MAT.x + rx, 1.15, QUEUE_Z + 0.9); this.scene.add(knob);
    }
    // queue spots: four friendly wait-here rings instead of a doormat
    const spotGeo = G('queueSpot', () => new THREE.RingGeometry(0.34, 0.46, 22));
    for (const qx of QUEUE_X) {
      const spot = new THREE.Mesh(spotGeo, new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 }));
      spot.rotation.x = -Math.PI / 2; spot.position.set(qx, 0.04, QUEUE_Z);
      this.scene.add(spot);
    }
    const wait = new THREE.Mesh(G('waitSign', () => new THREE.PlaneGeometry(2.2, 0.8)), new THREE.MeshBasicMaterial({ map: signTexture('WELCOME', { bg: P.inkCss }), transparent: true }));
    wait.position.set(MAT.x + 0.4, 2.4, QUEUE_Z + 1.2); this.scene.add(wait);

    for (const [px, pz] of [[-7.3, -7.4], [7.3, -7.4], [-7.3, 5.9], [7.3, 5.9]]) {
      const pot = new THREE.Mesh(G('pot', () => new THREE.CylinderGeometry(0.62, 0.5, 1, 16)), M(P.wallCoral, { roughness: 0.8 })); pot.position.set(px, 0.5, pz);
      const fol = new THREE.Mesh(G('fol', () => new THREE.IcosahedronGeometry(1.05, 1)), M(0x58C96B, { roughness: 0.9 })); fol.position.set(px, 1.7, pz);
      this.scene.add(shadows(pot), shadows(fol));
    }

    const tub = new THREE.Mesh(G('tub', () => new THREE.BoxGeometry(1.2, 0.5, 0.9)), M(0x9FD8CC, { roughness: 0.6 }));
    tub.position.set(BIN.x, 0.9, -5.4); this.scene.add(shadows(tub));
    const tubSign = new THREE.Mesh(G('tubSign', () => new THREE.PlaneGeometry(1.5, 0.55)), new THREE.MeshBasicMaterial({ map: signTexture('DISHES', { bg: '#4A5560' }), transparent: true }));
    tubSign.position.set(BIN.x, 1.85, -5.2); this.scene.add(tubSign);

    // the dish washer — scrubs whenever the waiter dumps a tub of dishes
    this.washer = chibi({ skin: 0xE9B891, outfit: 0x4A6FA5, hair: 0x2C1810 });
    this.washer.g.position.set(BIN.x - 0.9, 0, -5.35);
    this.washer.g.rotation.y = Math.PI / 2.4;
    this.washer.g.scale.setScalar(0.94);
    this.scene.add(this.washer.g);

    // drifting clouds around the island — the world breathes
    const cloudMat = new THREE.SpriteMaterial({ map: cloudTexture(), transparent: true, opacity: 0.9, depthWrite: false });
    const cloudDefs: [number, number, number, number, number][] = [
      // x, y, z, scale, speed
      [-15, 6.0, -13, 6.0, 0.24],
      [13, 7.5, -14, 7.5, -0.18],
      [-13, 1.6, 5, 5.2, 0.2],
      [15, 2.6, 8, 6.4, -0.26],
      [0, -3.0, 14, 7.0, 0.15],
    ];
    for (const [cx, cy, cz, cs, sp] of cloudDefs) {
      const spr = new THREE.Sprite(cloudMat);
      spr.position.set(cx, cy, cz);
      spr.scale.set(cs, cs * 0.5, 1);
      this.scene.add(spr);
      this.clouds.push({ spr, speed: sp });
    }
    // a couple of birds gliding past, high above the wall
    const birdMat = new THREE.SpriteMaterial({ map: birdTexture(), transparent: true, opacity: 0.85, depthWrite: false });
    for (const [bx, by, bz, sp] of [[-10, 8.6, -12, 1.1], [6, 7.6, -12.5, 0.8]] as const) {
      const spr = new THREE.Sprite(birdMat);
      spr.position.set(bx, by, bz);
      spr.scale.set(0.9, 0.45, 1);
      this.scene.add(spr);
      this.birds.push({ spr, speed: sp, baseY: by, ph: Math.random() * 6 });
    }
  }

  /** Entrance façade: striped awning over swinging doors. */
  private buildDoor() {
    const frameMat = M(P.woodDark, { roughness: 0.7 });
    for (const sx of [-1.35, 1.35]) {
      const post = new THREE.Mesh(G('doorPost', () => new THREE.BoxGeometry(0.24, 3.4, 0.24)), frameMat);
      post.position.set(DOOR.x + sx, 1.7, DOOR.z); this.scene.add(shadows(post));
    }
    const lintel = new THREE.Mesh(G('doorTop', () => new THREE.BoxGeometry(3.0, 0.3, 0.3)), frameMat);
    lintel.position.set(DOOR.x, 3.35, DOOR.z); this.scene.add(shadows(lintel));
    // scalloped awning sloping toward the guests
    const awning = new THREE.Mesh(G('awning', () => new THREE.PlaneGeometry(4.4, 1.7)),
      new THREE.MeshStandardMaterial({ map: awningTexture(), roughness: 0.9, side: THREE.DoubleSide }));
    awning.position.set(DOOR.x, 4.0, DOOR.z + 0.55); awning.rotation.x = -0.5;
    this.scene.add(awning);
    const sign = new THREE.Mesh(G('openSign', () => new THREE.PlaneGeometry(1.5, 0.55)), new THREE.MeshBasicMaterial({ map: signTexture('OPEN', { bg: P.dangerCss }), transparent: true, depthWrite: false }));
    sign.position.set(DOOR.x, 2.7, DOOR.z + 0.75); sign.renderOrder = 5; this.scene.add(sign);
    const panelGeo = G('doorPanel', () => {
      const g = new THREE.BoxGeometry(1.16, 2.0, 0.09);
      g.translate(0.58, 0, 0); // hinge on the left edge
      return g;
    });
    const panelMat = M(0xC9762F, { roughness: 0.6 });
    this.doorL = new THREE.Mesh(panelGeo, panelMat);
    this.doorL.position.set(DOOR.x - 1.22, 1.35, DOOR.z);
    this.doorR = new THREE.Mesh(panelGeo, panelMat);
    this.doorR.position.set(DOOR.x + 1.22, 1.35, DOOR.z);
    this.doorR.rotation.y = Math.PI; // mirrored: hinge on the right
    // porthole windows on the swing doors
    const holeGeo = G('doorHole', () => new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16));
    for (const panel of [this.doorL, this.doorR]) {
      const hole = new THREE.Mesh(holeGeo, M(P.awningCream, { roughness: 0.5 }));
      hole.rotation.x = Math.PI / 2; hole.position.set(0.58, 0.45, 0);
      panel.add(hole);
    }
    this.scene.add(shadows(this.doorL), shadows(this.doorR));
  }

  private buildTables() {
    const clothMat = new THREE.MeshStandardMaterial({ map: ginghamTexture(), roughness: 0.8 });
    for (let i = 0; i < TABLE_XZ.length; i++) {
      const [tx, tz] = TABLE_XZ[i];
      const pos = new THREE.Vector3(tx, 0, tz);
      const g = new THREE.Group(); g.position.copy(pos);
      const topWood = new THREE.Mesh(G('tTop', () => new THREE.CylinderGeometry(1.02, 0.97, 0.16, 32)), M(0x9B5A2B)); topWood.position.y = 0.92; g.add(topWood);
      const cloth = new THREE.Mesh(G('tCloth', () => new THREE.CylinderGeometry(0.94, 0.88, 0.06, 32)), clothMat); cloth.position.y = 1.02; g.add(cloth);
      const post = new THREE.Mesh(G('tPost', () => new THREE.CylinderGeometry(0.12, 0.14, 0.85, 12)), M(0x6E3F1E)); post.position.y = 0.48; g.add(post);
      const base = new THREE.Mesh(G('tBase', () => new THREE.CylinderGeometry(0.5, 0.56, 0.1, 20)), M(0x5A3318)); base.position.y = 0.06; g.add(base);
      const seat = new THREE.Mesh(G('tSeat', () => new THREE.CylinderGeometry(0.38, 0.38, 0.14, 18)), M(0xD8804A)); seat.position.set(0, 0.56, -1.42); g.add(seat);
      const back = new THREE.Mesh(G('tBack', () => new THREE.BoxGeometry(0.7, 0.78, 0.12)), M(0xC06A3A)); back.position.set(0, 1.0, -1.76); g.add(back);
      for (const lx of [-0.26, 0.26]) {
        const leg = new THREE.Mesh(G('tLeg', () => new THREE.CylinderGeometry(0.045, 0.055, 0.52, 8)), M(0x6E3F1E));
        leg.position.set(lx, 0.26, -1.42); g.add(leg);
      }
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
        chair: new THREE.Vector3(tx, 0, tz - 1.42),
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

  // ── camera: orthographic diorama framing at any aspect ratio ───────────────
  // A fixed-orbit ortho camera reads like a board game: no perspective wonk at
  // the edges, rows never overlap, and the island silhouette stays crisp. A
  // small yaw gives the furniture two visible faces without hurting picking.
  private frameCamera() {
    const w = innerWidth, h = innerHeight;
    const aspect = w / h;
    const t = THREE.MathUtils.clamp((aspect - 0.65) / (1.35 - 0.65), 0, 1);
    const elev = THREE.MathUtils.lerp(0.92, 0.68, t);
    // straight-on framing: the symmetric island reads intentional and calm
    this.camDir.set(0, Math.sin(elev), Math.cos(elev));
    let lo = 5, hi = 24;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (this.fitsAt(mid, aspect)) hi = mid; else lo = mid;
    }
    this.camHalfH = hi;
    this.setFrustum(this.camera, this.camHalfH, aspect);
  }

  private setFrustum(cam: THREE.OrthographicCamera, halfH: number, aspect: number) {
    cam.left = -halfH * aspect; cam.right = halfH * aspect;
    cam.top = halfH; cam.bottom = -halfH;
    cam.updateProjectionMatrix();
  }

  private fitsAt(halfH: number, aspect: number): boolean {
    this.setFrustum(this.fitCam, halfH, aspect);
    this.fitCam.position.copy(LOOK).addScaledVector(this.camDir, CAM_DIST);
    this.fitCam.lookAt(LOOK);
    this.fitCam.updateMatrixWorld(true);
    for (const [x, y, z] of FIT_POINTS) {
      this.tmp.set(x, y, z).project(this.fitCam);
      if (Math.abs(this.tmp.x) > 0.96 || this.tmp.y > 0.9 || this.tmp.y < -0.94) return false;
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
    try { SoundManager.startMusic(); SoundManager.startAmbience(); SoundManager.shiftBell(); } catch { /* audio optional */ }
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

    const skin = SKINS[vi % SKINS.length];
    const ch = critic
      ? chibi({ skin, outfit: 0x2A2A33, hair: 0xB8B8B8, accessory: 'sunglasses' })
      : chibi({ skin, outfit: variant.outfit, hair: variant.hair, accessory: variant.accessory });
    if (!critic) ch.g.scale.setScalar(variant.scaleMul);
    if (variant.name === 'Elder' && !critic) ch.head.rotation.x = 0.14; // a gentle stoop
    if (vip) {
      const crown = new THREE.Mesh(G('crown', () => new THREE.CylinderGeometry(0.24, 0.28, 0.18, 5)), M(0xFFC21E, { metalness: 0.6, roughness: 0.3 }));
      crown.position.y = 0.52; ch.head.add(crown);
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
    try { SoundManager.doorChime(); } catch { /* */ }
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
    // the loss is legible: show the money that just walked out the door
    this.fx.float(`-$${MENU_ITEMS[g.dish].price * 5}`, g.c.g.position.x, g.c.g.position.z, '#FF8A8A', 2.6);
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
    if (!this.running || this.endT >= 0) return;
    const spots = this.hotspots();
    let best: Hotspot | null = null, bestD = Infinity;
    for (const s of spots) {
      const d = Math.hypot(s.x - px, s.y - py);
      if (d < bestD) { bestD = d; best = s; }
    }
    const lim = Math.min(innerWidth, innerHeight) * 0.34;
    if (!best || bestD > lim) {
      this.cbs.onTap(px, py, false);
      if (this.selected) this.select(null); // tap elsewhere = cancel selection
      else this.bump();
      return;
    }
    this.cbs.onTap(px, py, true);
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
      * (rave ? CRITIC_PAY : 1)
      * this.boosts.tip,
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
    if (heartsFrac >= 0.98) { // flawless service deserves a flourish
      this.fx.float('PERFECT! ⭐', t.pos.x, t.pos.z + 0.6, '#FFE27A', 2.8);
      this.fx.sparkle(new THREE.Vector3(t.pos.x, 1.9, t.pos.z), 0xFFE27A, 12);
      try { SoundManager.starReveal(1); } catch { /* */ }
    } else if (heartsFrac < 0.25) { // rescued at the last moment
      this.fx.float('PHEW!', t.pos.x, t.pos.z + 0.6, '#9BE3FF', 2.8);
      try { SoundManager.nearMiss(); } catch { /* */ }
    }
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
      this.washT = 2.4; // the dish washer gets to work
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
    this.camera.position.copy(LOOK).addScaledVector(this.camDir, CAM_DIST);
    if (!this.reduceMotion) {
      this.camera.position.x += Math.sin(now / 3400) * 0.22;
      this.camera.position.y += Math.sin(now / 2700) * 0.1;
    }
    this.camera.lookAt(LOOK);
    // intro: a gentle ortho zoom-in as the shift starts
    const zoom = 1 / (1 + 0.3 * (1 - ease));
    if (this.camera.zoom !== zoom) { this.camera.zoom = zoom; this.camera.updateProjectionMatrix(); }

    this.renderer.render(this.scene, this.camera);
  }

  private step(dt: number, now: number) {
    // HUD refresh is throttled; score/guest changes emit immediately anyway
    this.hudAcc += dt;
    if (this.hudAcc >= 0.2) { this.hudAcc = 0; this.emitHud(); }

    // spawning into the waiting line — the second guest follows quickly so the
    // opening minute never goes quiet
    if (this.spawned < this.level.customers) {
      this.nextSpawn -= dt;
      if (this.nextSpawn <= 0) {
        this.spawn();
        this.nextSpawn = this.level.spawnMin + Math.random() * (this.level.spawnMax - this.level.spawnMin);
        if (this.spawned === 1) this.nextSpawn *= 0.55;
      }
    }

    this.updateWaiter(dt, now);
    this.updateGuests(dt, now);
    this.kitchen.update(dt, now);
    try { SoundManager.setSizzle(this.kitchen.activeBurners()); } catch { /* */ }
    this.updateArrow(now);
    this.updateSetPieces(dt, now);
    this.updateHint(dt);

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

    // level end: every guest resolved → a short celebration beat, then the card
    if (this.endT >= 0) {
      this.endT += dt;
      if (this.endT > 0.85) this.end();
    } else if (this.spawned >= this.level.customers && this.guests.length === 0 && !this.current && this.tasks.length === 0) {
      this.endT = 0;
      const won = this.score >= this.level.goal;
      this.hop(this.waiter.g);
      if (won) {
        this.fx.coinBurst(this.waiter.g.position.clone().setY(1.6), 14);
        this.fx.sparkle(this.waiter.g.position.clone().setY(2), 0xFFE27A, 14);
      }
      try { if (won) SoundManager.roundEnd(); else SoundManager.comboLost(); } catch { /* */ }
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
        const stepLen = Math.min(8.0 * this.boosts.speed * dt, d);
        w.g.position.addScaledVector(this.tmp, stepLen);
        this.dustAcc += stepLen;
        if (this.dustAcc > 1.2) { this.dustAcc = 0; this.fx.dust(w.g.position); }
        let dr = Math.atan2(this.tmp.x, this.tmp.z) - w.g.rotation.y;
        dr = Math.atan2(Math.sin(dr), Math.cos(dr));
        w.g.rotation.y += dr * Math.min(1, dt * 16);
        w.g.position.y = Math.abs(Math.sin(now / 75)) * 0.14;
        w.g.rotation.z = Math.sin(now / 75) * 0.05;
        w.g.rotation.x += (0.1 - w.g.rotation.x) * Math.min(1, dt * 8); // lean into the run
        if (!this.carried.length && !this.carriedDirty) {
          w.armL.rotation.x = Math.sin(now / 75) * 0.5;
          w.armR.rotation.x = -Math.sin(now / 75) * 0.5;
        }
      }
    } else {
      w.g.position.y = Math.sin(now / 600) * 0.04;
      w.g.rotation.z *= 0.85;
      w.g.rotation.x *= 0.82; // settle out of the lean
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
      tickBlink(g.c, now);
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
          if (g.table?.food) {
            g.table.food.scale.setScalar(Math.max(0.25, g.eatT / this.level.eatTime));
            if (Math.random() < dt * 1.2) this.fx.steam(this.tmp.set(g.table.pos.x, 1.4, g.table.pos.z));
          }
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

  // door swing, dish washer, wall clock, stove glow — the restaurant breathes
  private updateSetPieces(dt: number, now: number) {
    let near = false;
    for (const g of this.guests) {
      const p = g.c.g.position;
      if (Math.abs(p.x - DOOR.x) < 1.7 && Math.abs(p.z - DOOR.z) < 1.5) { near = true; break; }
    }
    const target = near ? 1 : 0;
    this.doorOpen += (target - this.doorOpen) * Math.min(1, dt * (near ? 10 : 4));
    const swing = this.doorOpen * 1.25;
    this.doorL.rotation.y = swing;
    this.doorR.rotation.y = Math.PI - swing;

    if (this.washT > 0) {
      this.washT -= dt;
      this.washer.armR.rotation.x = -1.2 + Math.sin(now / 90) * 0.4;
      this.washer.armL.rotation.x = -1.2 - Math.sin(now / 90) * 0.4;
      this.washer.g.position.y = Math.abs(Math.sin(now / 180)) * 0.05;
      if (Math.random() < dt * 3) this.fx.steam(this.tmp.set(BIN.x, 1.5, -5.35), false);
      if (this.washT <= 0) { poseStand(this.washer); this.washer.g.position.y = 0; }
    } else {
      this.washer.g.position.y = Math.sin(now / 700) * 0.03;
      this.washer.armR.rotation.x = Math.sin(now / 900) * 0.12 - 0.2;
    }

    this.clockHand.rotation.z = -(now / 60000) * Math.PI * 2;

    // clouds drift past the island and wrap around
    for (const c of this.clouds) {
      c.spr.position.x += c.speed * dt;
      if (c.spr.position.x > 20) c.spr.position.x = -20;
      if (c.spr.position.x < -20) c.spr.position.x = 20;
    }
    // birds glide by with a gentle wing-beat bob
    for (const b of this.birds) {
      b.spr.position.x += b.speed * dt;
      b.spr.position.y = b.baseY + Math.sin(now / 260 + b.ph) * 0.25;
      if (b.spr.position.x > 18) b.spr.position.x = -18;
    }
    tickBlink(this.waiter, now);
    tickBlink(this.washer, now);

    const active = this.kitchen.activeBurners();
    const glowTarget = active > 0 ? 0.35 + active * 0.18 + Math.sin(now / 70) * 0.08 : 0;
    this.stoveLight.intensity += (glowTarget - this.stoveLight.intensity) * Math.min(1, dt * 6);
  }

  // tutorial pointer hand: hovers over the tap a new player should make next
  private updateHint(dt: number) {
    if (!this.tutorial) {
      if (this.hintShown) { this.hintShown = false; this.cbs.onHint(0, 0, false); }
      return;
    }
    this.hintAcc += dt;
    if (this.hintAcc < 0.4) return;
    this.hintAcc = 0;
    const spots = this.hotspots();
    const pri = ['collect', 'deliver', 'pickup', 'order', 'seat', 'clean', 'select'];
    let best: Hotspot | null = null, bestP = 99;
    for (const s of spots) {
      const p = pri.indexOf(s.action);
      if (p >= 0 && p < bestP) { bestP = p; best = s; }
    }
    if (best) { this.hintShown = true; this.cbs.onHint(best.x, best.y, true); }
    else if (this.hintShown) { this.hintShown = false; this.cbs.onHint(0, 0, false); }
  }

  private end() {
    this.running = false; this.over = true;
    cancelAnimationFrame(this.raf);
    try { SoundManager.setSizzle(0); SoundManager.stopAmbience(); } catch { /* */ }
    const mid = Math.round((this.level.goal + this.level.expert) / 2);
    const stars = this.score >= this.level.expert ? 3 : this.score >= mid ? 2 : this.score >= this.level.goal ? 1 : 0;
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
    try { SoundManager.setSizzle(0); SoundManager.stopAmbience(); } catch { /* */ }
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
