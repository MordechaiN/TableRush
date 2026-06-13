import * as THREE from 'three';
import {
  MENU_ITEMS, DIFFICULTY_TIERS, COMBO_MILESTONES, SPEED_MULTIPLIERS,
  GAME_DURATION, MAX_TABLES, CUSTOMER_VARIANTS,
} from '../config/GameConfig';
import { M, shadows, plate, buildDish, DISH_EMOJI, chibi, makeBubble, floatSprite, Bubble } from './builders';
import { SoundManager } from '../systems/SoundManager';

export interface HudState { score: number; timeLeft: number; combo: number; multiplier: number; comboLabel: string; }
export interface GameResult { score: number; stars: number; happy: number; angry: number; comboRecord: number; }

type CState = 'incoming' | 'ordered' | 'serving' | 'eating' | 'paying' | 'leaving';
interface Customer {
  obj: THREE.Group; table: Table; dish: number; state: CState;
  patience: number; maxPat: number; eat: number; payPat: number; bob: number; t: number;
  bubble: Bubble | null; vip: boolean;
}
interface Table {
  i: number; pos: THREE.Vector3; seat: THREE.Vector3; state: 'empty' | CState;
  customer: Customer | null; food: THREE.Object3D | null; ring: THREE.Mesh;
}

const SKINS = [0xFAD2B0, 0xE9B891, 0xF3C19E, 0xEFCBA8, 0xF5C9A0];
// table layout (5): back row of 3, front row of 2
const LAYOUT = [
  new THREE.Vector3(-3.6, 0, -2.6), new THREE.Vector3(0, 0, -3.0), new THREE.Vector3(3.6, 0, -2.6),
  new THREE.Vector3(-2.3, 0, 1.8), new THREE.Vector3(2.3, 0, 1.8),
];
const DOOR = new THREE.Vector3(0, 0, 9.5);
const PASS = new THREE.Vector3(0, 0, -7.2);

export class RestaurantGame {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private readonly camBase = new THREE.Vector3(0, 8.4, 13.6);
  private readonly look = new THREE.Vector3(0, 1.4, -0.8);
  private tables: Table[] = [];
  private hit: THREE.Mesh[] = [];
  private waiter: THREE.Group;
  private tray: THREE.Group;
  private carried: THREE.Object3D | null = null;
  private wq: { v: THREE.Vector3; cb?: () => void }[] = [];
  private wTarget: THREE.Vector3 | null = null;
  private wCb: (() => void) | null = null;
  private wBusy = false;

  private customers: Customer[] = [];
  private nextSpawn = 1.2;
  private nextId = 0;

  private score = 0;
  private combo = 0;
  private comboMul = 1;
  private comboRecord = 0;
  private happy = 0;
  private angry = 0;
  private timeLeft = GAME_DURATION;
  private running = false;
  private raf = 0;
  private last = 0;
  private startMs = 0;

  private ray = new THREE.Raycaster();
  private ptr = new THREE.Vector2();
  private tmp = new THREE.Vector3();
  private fx: any[] = [];
  private floats: { spr: THREE.Sprite; t: number }[] = [];
  private onTutorialServe: (() => void) | null = null;
  private tutorialDone = true;

  constructor(
    private container: HTMLElement,
    private onHud: (h: HudState) => void,
    private onOver: (r: GameResult) => void,
    private onAnnounce: (text: string, kind: 'combo' | 'speed' | 'tut') => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:block;z-index:1;';
    container.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(0xF4DEB6);
    this.scene.fog = new THREE.Fog(0xF4DEB6, 24, 50);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    this.camera.position.copy(this.camBase);
    this.camera.lookAt(this.look);

    this.buildRoom();
    this.buildTables();
    this.waiter = chibi(0xFBD2AF, 0x28368A, 0x4A2F1C, true);
    this.waiter.position.set(0, 0, 6.5); this.waiter.scale.setScalar(1.1); this.scene.add(this.waiter);
    this.tray = new THREE.Group(); this.tray.position.set(0.55, 1.05, 0.2); this.waiter.add(this.tray);
    this.tray.add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 0.06, 20), M(0xC0884A)));

    this.resize = this.resize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    addEventListener('resize', this.resize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointer);
    this.resize();
  }

  // ── world ────────────────────────────────────────────────────────────────
  private buildRoom() {
    this.scene.add(new THREE.AmbientLight(0xfff1da, 0.62));
    this.scene.add(new THREE.HemisphereLight(0xfff6e6, 0xE6A65A, 0.62));
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(6, 14, 8); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005;
    Object.assign(key.shadow.camera, { near: 1, far: 55, left: -18, right: 18, top: 18, bottom: -18 });
    key.shadow.camera.updateProjectionMatrix();
    this.scene.add(key);
    const fill = new THREE.PointLight(0xff9a3d, 0.5, 55); fill.position.set(-6, 6, 6); this.scene.add(fill);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), M(0xEAC487, { roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; this.scene.add(floor);
    for (let i = -16; i <= 16; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(70, 0.05), M(0xCB9C5C)); s.rotation.x = -Math.PI / 2; s.position.set(0, 0.011, i * 1.7); this.scene.add(s); }

    const wall = new THREE.Mesh(new THREE.PlaneGeometry(70, 24), M(0xF3DBBA, { roughness: 1 })); wall.position.set(0, 12, -11.5); wall.receiveShadow = true; this.scene.add(wall);
    const wains = new THREE.Mesh(new THREE.BoxGeometry(70, 3.4, 0.3), M(0xEFE4D2)); wains.position.set(0, 1.7, -11.35); this.scene.add(wains);
    for (const wx of [-10, 10]) {
      const fr = new THREE.Mesh(new THREE.BoxGeometry(6.6, 5, 0.3), M(0x9A6534)); fr.position.set(wx, 7.8, -11.3); fr.castShadow = true; this.scene.add(fr);
      const g = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.2), M(0xBFE6F4, { emissive: 0x9fd0e8, emissiveIntensity: 0.55, roughness: 0.3 })); g.position.set(wx, 7.8, -11.13); this.scene.add(g);
    }
    for (const sx of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(34, 24), M(0xEFD0A6, { roughness: 1 })); sw.position.set(sx * 17, 12, 4); sw.rotation.y = -sx * Math.PI / 2; this.scene.add(sw); }

    // kitchen pass
    const counter = new THREE.Mesh(new THREE.BoxGeometry(12, 1.7, 2.2), M(0xC9763A)); counter.position.set(0, 0.85, -9.4); this.scene.add(shadows(counter));
    const top = new THREE.Mesh(new THREE.BoxGeometry(12.3, 0.25, 2.5), M(0xF3E5CC)); top.position.set(0, 1.78, -9.4); this.scene.add(top);
    for (const lx of [-3.5, 0, 3.5]) {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8), M(0x6E4A28)); cord.position.set(lx, 4.6, -9.4); this.scene.add(cord);
      const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.5, 18, 1, true), M(0xE8552E, { side: THREE.DoubleSide, roughness: 0.5 })); lamp.position.set(lx, 3.5, -9.4); lamp.castShadow = true; this.scene.add(lamp);
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), M(0xFFE39A, { emissive: 0xFFB347, emissiveIntensity: 1.4 })); b.position.set(lx, 3.34, -9.4); this.scene.add(b);
      const pl = new THREE.PointLight(0xFFB347, 0.35, 10); pl.position.set(lx, 3.1, -8.6); this.scene.add(pl);
    }
    // pendant lamps
    for (const lx of [-6, 6]) {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5, 8), M(0x4A3A22)); cord.position.set(lx, 16, 0.5); this.scene.add(cord);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1, 22, 1, true), M(0xF2A93C, { side: THREE.DoubleSide })); shade.position.set(lx, 13.5, 0.5); shade.castShadow = true; this.scene.add(shade);
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), M(0xFFF1B0, { emissive: 0xFFE082, emissiveIntensity: 1 })); b.position.set(lx, 13.1, 0.5); this.scene.add(b);
      const pl = new THREE.PointLight(0xFFD27A, 0.45, 18); pl.position.set(lx, 12.5, 0.5); this.scene.add(pl);
    }
    for (const [px, pz] of [[-14, 5], [14, 5], [-14, -7], [14, -7]]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 1, 16), M(0xCC6B3A)); pot.position.set(px, 0.5, pz);
      const fol = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), M(0x4FA63A)); fol.position.set(px, 1.7, pz);
      this.scene.add(shadows(pot), shadows(fol));
    }
  }

  private buildTables() {
    for (let i = 0; i < MAX_TABLES; i++) {
      const pos = LAYOUT[i];
      const g = new THREE.Group(); g.position.copy(pos);
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.95, 0.16, 32), M(0x9B5A2B)).translateY(0.92));
      const cloth = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.86, 0.06, 32), M(0xF7F0E2, { roughness: 0.8 })); cloth.position.y = 1.02; g.add(cloth);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.85, 12), M(0x6E3F1E)); post.position.y = 0.48; g.add(post);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.1, 20), M(0x5A3318)); base.position.y = 0.06; g.add(base);
      for (const cz of [1.3, -1.3]) {
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 18), M(0xC9762F)); seat.position.set(0, 0.56, cz); g.add(seat);
        const bk = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.12), M(0xB5651C)); bk.position.set(0, 0.92, cz + (cz > 0 ? 0.31 : -0.31)); g.add(bk);
      }
      this.scene.add(shadows(g));
      const hit = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 2.6), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(pos.x, 1.5, pos.z); hit.userData.table = i; this.scene.add(hit); this.hit.push(hit);
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.4, 40), new THREE.MeshBasicMaterial({ color: 0xFFD24A, transparent: true, opacity: 0, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(pos.x, 0.04, pos.z); this.scene.add(ring);
      this.tables.push({ i, pos, seat: new THREE.Vector3(pos.x, 0, pos.z + 1.3), state: 'empty', customer: null, food: null, ring });
    }
  }

  // ── lifecycle ──────────────────────────────────────────────────────────────
  start(tutorial: boolean) {
    this.tutorialDone = !tutorial;
    this.score = 0; this.combo = 0; this.comboMul = 1; this.comboRecord = 0; this.happy = 0; this.angry = 0;
    this.timeLeft = GAME_DURATION; this.nextSpawn = tutorial ? 0.6 : 1.2; this.customers = []; this.fx = []; this.floats = [];
    this.running = true; this.last = performance.now(); this.startMs = this.last;
    this.emitHud();
    if (tutorial) this.onAnnounce('Tap the glowing table to serve!', 'tut');
    cancelAnimationFrame(this.raf);
    this.loop(this.last);
    try { SoundManager.startMusic(); } catch { /* */ }
  }

  private tierFor(elapsed: number) { for (const t of DIFFICULTY_TIERS) if (elapsed <= t.maxTime) return t; return DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1]; }

  private spawn() {
    const free = this.tables.filter(t => t.state === 'empty'); if (!free.length) return;
    if (!this.tutorialDone && this.customers.length >= 1) return;
    const table = free[(Math.random() * free.length) | 0];
    const elapsed = (performance.now() - this.startMs) / 1000;
    const tier = this.tierFor(elapsed);
    let pat = (tier.patienceMin + Math.random() * (tier.patienceMax - tier.patienceMin)) / 1000;
    const variant = (this.nextId++) % CUSTOMER_VARIANTS.length;
    const cv = CUSTOMER_VARIANTS[variant];
    const vip = this.tutorialDone && Math.random() < 0.12;
    if (vip) pat *= 0.7;
    const c = chibi(SKINS[variant % SKINS.length], cv.outfit, cv.hair);
    if (vip) { const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.16, 5), M(0xFFC21E, { metalness: 0.6, roughness: 0.3 })); crown.position.y = 1.78; c.add(crown); }
    c.position.copy(DOOR); this.scene.add(c);
    const dish = (Math.random() * MENU_ITEMS.length) | 0;
    table.state = 'incoming';
    const cust: Customer = { obj: c, table, dish, state: 'incoming', patience: pat, maxPat: pat, eat: 2.8, payPat: 12, bob: Math.random() * 6, t: 0, bubble: null, vip };
    table.customer = cust; this.customers.push(cust);
  }

  // ── input ────────────────────────────────────────────────────────────────
  private onPointer(e: PointerEvent) {
    this.ptr.x = (e.clientX / innerWidth) * 2 - 1; this.ptr.y = -(e.clientY / innerHeight) * 2 + 1;
    this.ray.setFromCamera(this.ptr, this.camera);
    const h = this.ray.intersectObjects(this.hit, false)[0]; if (!h) return;
    this.handle((h.object as THREE.Mesh).userData.table as number);
  }
  private approach(t: Table) { return new THREE.Vector3(t.pos.x, 0, t.pos.z + 2.0); }
  private handle(i: number) {
    const t = this.tables[i]; if (this.wBusy) { this.bump(); return; }
    if (t.state === 'ordered') {
      t.state = 'serving'; this.ring(t, 0);
      this.go(PASS, () => this.grab(t.customer!.dish));
      this.go(this.approach(t), () => this.drop(t));
    } else if (t.state === 'paying') {
      t.state = 'collecting' as any; this.ring(t, 0);
      this.go(this.approach(t), () => this.collect(t));
    } else this.bump();
    if (!this.wTarget) this.nextStep();
  }
  private go(v: THREE.Vector3, cb?: () => void) { this.wq.push({ v: v.clone(), cb }); }
  private nextStep() { if (!this.wq.length) { this.wTarget = null; this.wBusy = false; return; } const s = this.wq.shift()!; this.wTarget = s.v; this.wCb = s.cb || null; this.wBusy = true; }

  private grab(dish: number) { if (this.carried) this.tray.remove(this.carried); this.carried = buildDish(dish); this.carried.scale.setScalar(0.7); this.carried.position.y = 0.1; this.tray.add(this.carried); this.pop(this.tray); try { SoundManager.uiClick(); } catch { /* */ } }
  private drop(t: Table) {
    const c = t.customer; if (!c) return;
    if (this.carried) { this.tray.remove(this.carried); this.carried = null; }
    const pl = plate(); const f = buildDish(c.dish); f.scale.setScalar(0.8); pl.add(f); pl.position.set(t.pos.x, 1.06, t.pos.z); pl.scale.setScalar(0.01); this.scene.add(pl); this.pop(pl, 0.9); t.food = pl;
    c.state = 'eating'; t.state = 'eating'; c.eat = 2.8; if (c.bubble) c.bubble.draw('😋', 1, 1);
    if (c.bubble) { /* keep until paying */ }
    try { SoundManager.paymentCollected(); } catch { /* */ }
    if (!this.tutorialDone) { this.tutorialDone = true; this.onAnnounce('Nice! Now let them eat, then collect 💰', 'tut'); this.onTutorialServe?.(); }
  }
  private collect(t: Table) {
    const c = t.customer; if (!c) return;
    const item = MENU_ITEMS[c.dish];
    const patFrac = c.patience / c.maxPat;
    let speed = 1; let speedLabel = '';
    for (const s of SPEED_MULTIPLIERS) { if (patFrac >= s.minPct) { speed = s.multiplier; speedLabel = s.label; break; } }
    const vipMul = c.vip ? 2.5 : 1;
    const val = Math.round(item.price * 5 * speed * this.comboMul * vipMul);
    this.score += val; this.happy++;
    this.combo++; if (this.combo > this.comboRecord) this.comboRecord = this.combo;
    const ms = COMBO_MILESTONES; let mil = ms[0]; for (const m of ms) if (this.combo >= m.min) mil = m;
    const prevMul = this.comboMul; this.comboMul = mil.multiplier;
    this.coinBurst(new THREE.Vector3(t.pos.x, 1.4, t.pos.z));
    this.addFloat(floatSprite('+$' + val), t.pos.x, t.pos.z);
    if (c.vip) this.addFloat(floatSprite('VIP! ×2.5', '#FFE27A'), t.pos.x, t.pos.z + 0.4);
    if (speedLabel && speed > 1) this.onAnnounce(speedLabel + '!', 'speed');
    if (mil.label && this.comboMul > prevMul) { this.onAnnounce(mil.label + '  ×' + this.comboMul, 'combo'); try { SoundManager.comboUp(Math.min(4, this.comboMul)); } catch { /* */ } this.camPunch(); }
    try { SoundManager.paymentCollected(); } catch { /* */ }
    if (t.food) { this.scene.remove(t.food); t.food = null; }
    if (c.bubble) { c.obj.remove(c.bubble.spr); c.bubble = null; }
    c.state = 'leaving'; this.ring(t, 0); this.emitHud();
  }

  private angryLeave(c: Customer) {
    c.state = 'leaving'; c.table.state = 'empty'; c.table.customer = null; this.ring(c.table, 0);
    if (c.bubble) c.bubble.draw('💢', 1, 0);
    this.combo = 0; this.comboMul = 1; this.angry++; this.emitHud();
  }
  private despawn(c: Customer) { this.scene.remove(c.obj); if (c.table.customer === c) { c.table.state = 'empty'; c.table.customer = null; c.table.food = null; } this.customers = this.customers.filter(x => x !== c); }

  // ── fx ───────────────────────────────────────────────────────────────────
  private ring(t: Table, op: number) { (t.ring.userData as any).target = op; }
  private pop(o: THREE.Object3D, s = 1) { o.scale.setScalar(0.01); this.fx.push({ k: 'pop', o, t: 0, s }); }
  private bump() { this.fx.push({ k: 'bump', t: 0 }); }
  private camPunch() { this.fx.push({ k: 'punch', t: 0 }); }
  private coinBurst(pos: THREE.Vector3) {
    for (let i = 0; i < 14; i++) {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 14), M(0xFFC21E, { metalness: 0.5, roughness: 0.35 }));
      coin.position.copy(pos); this.scene.add(coin);
      const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 3;
      this.fx.push({ k: 'coin', o: coin, t: 0, vx: Math.cos(a) * sp, vy: 4 + Math.random() * 3, vz: Math.sin(a) * sp, rot: Math.random() * 10 });
    }
  }
  private addFloat(spr: THREE.Sprite, x: number, z: number) { spr.position.set(x, 2.2, z); this.scene.add(spr); this.floats.push({ spr, t: 0 }); }

  // ── loop ─────────────────────────────────────────────────────────────────
  private emitHud() { this.onHud({ score: this.score, timeLeft: this.timeLeft, combo: this.combo, multiplier: this.comboMul, comboLabel: '' }); }

  private loop(now: number) {
    if (!this.running) return;
    this.raf = requestAnimationFrame(t => this.loop(t));
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;

    if (this.timeLeft > 0) { this.timeLeft -= dt; if (this.timeLeft <= 0) { this.timeLeft = 0; this.end(); } }
    this.onHud({ score: this.score, timeLeft: this.timeLeft, combo: this.combo, multiplier: this.comboMul, comboLabel: '' });

    this.nextSpawn -= dt;
    if (this.nextSpawn <= 0 && this.customers.length < MAX_TABLES && this.timeLeft > 0) {
      this.spawn();
      const elapsed = (now - this.startMs) / 1000; const tier = this.tierFor(elapsed);
      const prog = Math.min(1, elapsed / tier.maxTime);
      this.nextSpawn = (tier.spawnStart + (tier.spawnEnd - tier.spawnStart) * prog) / 1000;
    }

    // waiter
    if (this.wTarget) {
      this.tmp.copy(this.wTarget).sub(this.waiter.position); this.tmp.y = 0; const d = this.tmp.length();
      if (d < 0.06) { this.waiter.position.copy(this.wTarget); const cb = this.wCb; this.wCb = null; cb?.(); this.nextStep(); }
      else { this.tmp.normalize(); this.waiter.position.addScaledVector(this.tmp, Math.min(7 * dt, d)); this.waiter.rotation.y = Math.atan2(this.tmp.x, this.tmp.z); this.waiter.position.y = Math.abs(Math.sin(now / 80)) * 0.13; }
    } else this.waiter.position.y = Math.sin(now / 600) * 0.04;

    // customers
    for (const c of this.customers) {
      c.t += dt; const o = c.obj;
      if (c.state === 'incoming') {
        this.tmp.copy(c.table.seat).sub(o.position); this.tmp.y = 0; const d = this.tmp.length();
        if (d < 0.08) { o.position.copy(c.table.seat); o.rotation.y = Math.PI * (c.table.pos.x <= 0 ? 0.82 : -0.82); c.state = 'ordered'; c.table.state = 'ordered'; const b = makeBubble(); b.spr.position.set(0, 2.05, 0); o.add(b.spr); c.bubble = b; b.draw(DISH_EMOJI[c.dish], 1, 1); this.ring(c.table, 0.7); }
        else { this.tmp.normalize(); o.position.addScaledVector(this.tmp, Math.min(4.5 * dt, d)); o.rotation.y = Math.atan2(this.tmp.x, this.tmp.z); o.position.y = Math.abs(Math.sin(c.t * 9)) * 0.1; }
      } else if (c.state === 'ordered') {
        c.patience -= dt; o.position.y = Math.sin(c.t * 2 + c.bob) * 0.03;
        if (c.bubble) c.bubble.draw(DISH_EMOJI[c.dish], Math.max(0, c.patience / c.maxPat), c.patience / c.maxPat);
        if (c.patience <= 0) this.angryLeave(c);
      } else if (c.state === 'serving') {
        c.patience -= dt * 0.5; o.position.y = Math.sin(c.t * 2 + c.bob) * 0.03;
        if (c.bubble) c.bubble.draw(DISH_EMOJI[c.dish], Math.max(0, c.patience / c.maxPat), c.patience / c.maxPat);
      } else if (c.state === 'eating') {
        c.eat -= dt; o.position.y = Math.abs(Math.sin(c.t * 6)) * 0.06;
        if (c.eat <= 0) { c.state = 'paying'; c.table.state = 'paying'; if (c.bubble) c.bubble.draw('💰', 1, 1); this.ring(c.table, 0.9); }
      } else if (c.state === 'paying') {
        c.payPat -= dt; o.position.y = Math.sin(c.t * 3 + c.bob) * 0.04;
        if (c.bubble) c.bubble.draw('💰', Math.max(0, c.payPat / 12), c.payPat / 12);
        if (c.payPat <= 0) { if (c.bubble) { c.obj.remove(c.bubble.spr); c.bubble = null; } this.angryLeave(c); }
      } else if (c.state === 'leaving') {
        this.tmp.copy(DOOR).sub(o.position); this.tmp.y = 0; const d = this.tmp.length();
        if (d < 0.2) this.despawn(c); else { this.tmp.normalize(); o.position.addScaledVector(this.tmp, Math.min(5.5 * dt, d)); o.rotation.y = Math.atan2(this.tmp.x, this.tmp.z); o.position.y = Math.abs(Math.sin(c.t * 9)) * 0.1; }
      }
    }

    // rings
    for (const t of this.tables) { const tgt = (t.ring.userData as any).target || 0; const mat = t.ring.material as THREE.MeshBasicMaterial; mat.opacity += (tgt - mat.opacity) * Math.min(1, dt * 8); if (tgt > 0) t.ring.scale.setScalar(1 + Math.sin(now / 250) * 0.05); }

    // fx
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const e = this.fx[i]; e.t += dt;
      if (e.k === 'pop') { const s = e.s * Math.min(1, backOut(e.t / 0.32)); e.o.scale.setScalar(Math.max(0.001, s)); if (e.t > 0.34) { e.o.scale.setScalar(e.s); this.fx.splice(i, 1); } }
      else if (e.k === 'bump') { this.waiter.scale.setScalar(1.1 * (1 + Math.sin(e.t * 30) * 0.05 * Math.max(0, 1 - e.t * 4))); if (e.t > 0.25) { this.waiter.scale.setScalar(1.1); this.fx.splice(i, 1); } }
      else if (e.k === 'coin') { e.vy -= 14 * dt; e.o.position.x += e.vx * dt; e.o.position.y += e.vy * dt; e.o.position.z += e.vz * dt; e.o.rotation.x += e.rot * dt; e.o.rotation.y += e.rot * dt; if (e.o.position.y < 0.12) { this.scene.remove(e.o); this.fx.splice(i, 1); } }
      else if (e.k === 'punch') { if (e.t > 0.18) this.fx.splice(i, 1); }
    }
    for (let i = this.floats.length - 1; i >= 0; i--) { const f = this.floats[i]; f.t += dt; f.spr.position.y += dt * 1.5; (f.spr.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - f.t / 1.1); if (f.t > 1.1) { this.scene.remove(f.spr); this.floats.splice(i, 1); } }

    // camera sway + punch
    const punch = this.fx.find(e => e.k === 'punch');
    const pk = punch ? Math.sin(punch.t * 60) * 0.12 * Math.max(0, 1 - punch.t * 5) : 0;
    this.camera.position.x = this.camBase.x + Math.sin(now / 3200) * 0.45;
    this.camera.position.y = this.camBase.y + Math.sin(now / 2600) * 0.2 + pk;
    this.camera.lookAt(this.look);

    this.renderer.render(this.scene, this.camera);
  }

  private end() { this.running = false; cancelAnimationFrame(this.raf); const stars = this.score >= 3500 ? 3 : this.score >= 1500 ? 2 : 1; this.onOver({ score: this.score, stars, happy: this.happy, angry: this.angry, comboRecord: this.comboRecord }); }

  stop() { this.running = false; cancelAnimationFrame(this.raf); }
  resize() { const w = innerWidth, h = innerHeight; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
  dispose() {
    this.stop(); removeEventListener('resize', this.resize); this.renderer.domElement.removeEventListener('pointerdown', this.onPointer);
    this.renderer.dispose(); this.renderer.domElement.remove();
  }
  metrics() { return { calls: this.renderer.info.render.calls, tris: this.renderer.info.render.triangles, geom: this.renderer.info.memory.geometries, score: this.score, combo: this.combo }; }
  // headless test driver (find the most valuable tap)
  autoStep() { if (this.wBusy) return; const pay = this.tables.findIndex(t => t.state === 'paying'); if (pay >= 0) return this.handle(pay); const ord = this.tables.findIndex(t => t.state === 'ordered'); if (ord >= 0) return this.handle(ord); }
  tapTable(i: number) { this.handle(i); }
  // staged marketing frame: one customer per state + the reward fx
  debugHero() {
    this.customers.forEach(c => this.scene.remove(c.obj)); this.customers = [];
    this.tables.forEach(t => { t.state = 'empty'; t.customer = null; if (t.food) { this.scene.remove(t.food); t.food = null; } this.ring(t, 0); });
    const seat = (ti: number, dish: number, st: CState) => {
      const t = this.tables[ti];
      const cv = CUSTOMER_VARIANTS[ti % CUSTOMER_VARIANTS.length];
      const c = chibi(SKINS[ti % SKINS.length], cv.outfit, cv.hair);
      c.position.copy(t.seat); c.rotation.y = Math.PI * (t.pos.x <= 0 ? 0.82 : -0.82); this.scene.add(c);
      const b = makeBubble(); b.spr.position.set(0, 2.05, 0); c.add(b.spr);
      const cust: Customer = { obj: c, table: t, dish, state: st, patience: 8, maxPat: 12, eat: 2, payPat: 12, bob: 0, t: 0, bubble: b, vip: false };
      t.customer = cust; t.state = st; this.customers.push(cust);
      if (st === 'eating') { const pl = plate(); const f = buildDish(dish); f.scale.setScalar(0.8); pl.add(f); pl.position.set(t.pos.x, 1.06, t.pos.z); this.scene.add(pl); t.food = pl; b.draw('😋', 1, 1); }
      else if (st === 'paying') { b.draw('💰', 1, 1); this.ring(t, 0.9); }
      else { b.draw(DISH_EMOJI[dish], 0.7, 0.7); this.ring(t, 0.7); }
    };
    seat(3, 4, 'eating'); seat(1, 2, 'ordered'); seat(4, 1, 'paying');
    this.score = 240; this.combo = 4; this.comboMul = 2; this.emitHud();
    this.coinBurst(new THREE.Vector3(this.tables[4].pos.x, 1.4, this.tables[4].pos.z));
    this.addFloat(floatSprite('+$28'), this.tables[4].pos.x, this.tables[4].pos.z);
    this.waiter.position.set(0.7, 0, 5.2); this.waiter.rotation.y = -0.5; this.grab(0);
  }
}

function backOut(x: number) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
