import * as THREE from './vendor/three.module.js';

// ════════════════════════════════════════════════════════════════════════════
// TABLE RUSH — Three.js gameplay prototype
// Real loop: customers walk in → sit → order → you tap to deliver → they eat →
// pay → you tap to collect → coins burst → they leave. Warm low-poly, soft
// shadows, subtle camera sway. Built to answer: "is 3D clearly better?"
// ════════════════════════════════════════════════════════════════════════════

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xF4DEB6);
scene.fog = new THREE.Fog(0xF4DEB6, 22, 46);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
const CAM_BASE = new THREE.Vector3(0, 7.6, 12.8);
camera.position.copy(CAM_BASE);
const LOOK = new THREE.Vector3(0, 1.5, -0.5);
camera.lookAt(LOOK);

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

// ── materials / helpers ──────────────────────────────────────────────────────
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .72, metalness: .04, ...o });
const shadows = (m) => { m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };

// ── lighting (warm, cozy, soft) ──────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xfff1da, 0.62));
scene.add(new THREE.HemisphereLight(0xfff6e6, 0xE6A65A, 0.62));
const key = new THREE.DirectionalLight(0xffffff, 1.15);
key.position.set(6, 13, 7);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0005;
Object.assign(key.shadow.camera, { near: 1, far: 50, left: -16, right: 16, top: 16, bottom: -16 });
scene.add(key);
const warmFill = new THREE.PointLight(0xff9a3d, 0.5, 50);
warmFill.position.set(-6, 6, 6);
scene.add(warmFill);

// ── room ─────────────────────────────────────────────────────────────────────
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M(0xEAC487, { roughness: .9 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
for (let i = -14; i <= 14; i++) {
  const seam = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.05), M(0xCB9C5C));
  seam.rotation.x = -Math.PI / 2; seam.position.set(0, 0.011, i * 1.7); scene.add(seam);
}
// back wall + wainscot + windows
const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 22), M(0xF3DBBA, { roughness: 1 }));
wall.position.set(0, 11, -11); wall.receiveShadow = true; scene.add(wall);
const wains = new THREE.Mesh(new THREE.BoxGeometry(60, 3.4, .3), M(0xEFE4D2));
wains.position.set(0, 1.7, -10.85); scene.add(wains);
for (const wx of [-9, 9]) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(6.6, 5, .3), M(0x9A6534));
  frame.position.set(wx, 7.5, -10.8); frame.castShadow = true; scene.add(frame);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.2), M(0xBFE6F4, { emissive: 0x9fd0e8, emissiveIntensity: .55, roughness: .3 }));
  glass.position.set(wx, 7.5, -10.63); scene.add(glass);
}
// side walls
for (const sx of [-1, 1]) {
  const sw = new THREE.Mesh(new THREE.PlaneGeometry(30, 22), M(0xEFD0A6, { roughness: 1 }));
  sw.position.set(sx * 15, 11, 4); sw.rotation.y = -sx * Math.PI / 2; scene.add(sw);
}
// kitchen pass counter (back-center)
const kitchen = new THREE.Group();
const counter = new THREE.Mesh(new THREE.BoxGeometry(11, 1.7, 2.2), M(0xC9763A));
counter.position.set(0, .85, -9); shadows(counter); kitchen.add(counter);
const top = new THREE.Mesh(new THREE.BoxGeometry(11.3, .25, 2.5), M(0xF3E5CC));
top.position.set(0, 1.78, -9); kitchen.add(top);
// heat lamps over pass
for (const lx of [-3, 0, 3]) {
  const lamp = new THREE.Mesh(new THREE.ConeGeometry(.5, .5, 16, 1, true), M(0x3A3A40, { side: THREE.DoubleSide, metalness: .5, roughness: .4 }));
  lamp.position.set(lx, 4.6, -9); kitchen.add(lamp);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 10), M(0xFFCf66, { emissive: 0xFF9a3d, emissiveIntensity: 1.2 }));
  bulb.position.set(lx, 4.4, -9); kitchen.add(bulb);
}
const KITCHEN_PASS = new THREE.Vector3(0, 0, -7.3);
scene.add(kitchen);
// pendant lamps over dining
for (const lx of [-5.5, 5.5]) {
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 5, 8), M(0x4A3A22));
  cord.position.set(lx, 15.5, 1); scene.add(cord);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1, 22, 1, true), M(0xF2A93C, { side: THREE.DoubleSide }));
  shade.position.set(lx, 13, 1); shade.castShadow = true; scene.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.3, 16, 12), M(0xFFF1B0, { emissive: 0xFFE082, emissiveIntensity: 1 }));
  bulb.position.set(lx, 12.6, 1); scene.add(bulb);
  const pl = new THREE.PointLight(0xFFD27A, .45, 16); pl.position.set(lx, 12, 1); scene.add(pl);
}
// plants
for (const [px, pz] of [[-12.5, 5], [12.5, 5], [-12.5, -7], [12.5, -7]]) {
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(.62, .5, 1, 16), M(0xCC6B3A));
  pot.position.set(px, .5, pz);
  const fol = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), M(0x4FA63A));
  fol.position.set(px, 1.7, pz);
  scene.add(shadows(pot), shadows(fol));
}

// ── food models ──────────────────────────────────────────────────────────────
function plate() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.62, .52, .07, 36), M(0xFFFFFF, { roughness: .35 })));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.56, .045, 12, 36), M(0xF3D9A0)); rim.rotation.x = Math.PI / 2; rim.position.y = .04; g.add(rim);
  return g;
}
const DISHES = [
  { name: 'Salad', emoji: '🥗', build: () => { const g = new THREE.Group(); for (let i = 0; i < 12; i++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(.13 + Math.random() * .05, 0), M([0x4FA63A, 0x6FBF4A, 0x3E8E2E][i % 3])); l.position.set((Math.random() - .5) * .5, .08 + Math.random() * .1, (Math.random() - .5) * .5); g.add(l); } const t = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), M(0xE3403F)); t.position.set(.15, .12, -.08); g.add(t); return g; } },
  { name: 'Burger', emoji: '🍔', build: () => { const g = new THREE.Group(); const b0 = new THREE.Mesh(new THREE.CylinderGeometry(.36, .4, .15, 22), M(0xE3A24E)); const p = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .13, 22), M(0x6B3B22)); p.position.y = .13; const ch = new THREE.Mesh(new THREE.BoxGeometry(.66, .05, .66), M(0xFFC23D)); ch.position.y = .22; ch.rotation.y = .8; const bt = new THREE.Mesh(new THREE.SphereGeometry(.44, 22, 14, 0, 6.3, 0, Math.PI / 2), M(0xF0B45E)); bt.position.y = .27; bt.scale.y = .7; g.add(b0, p, ch, bt); return g; } },
  { name: 'Pasta', emoji: '🍝', build: () => { const g = new THREE.Group(); const bowl = new THREE.Mesh(new THREE.SphereGeometry(.46, 22, 12, 0, 6.3, Math.PI / 2, Math.PI / 2), M(0xE74C3C, { roughness: .35 })); bowl.scale.y = .6; bowl.position.y = .12; const n = new THREE.Mesh(new THREE.TorusKnotGeometry(.2, .06, 60, 8), M(0xF2CF6B)); n.position.y = .2; n.scale.set(1, .5, 1); const mb = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 10), M(0x7A3B1E)); mb.position.set(.13, .24, .06); g.add(bowl, n, mb); return g; } },
  { name: 'Sushi', emoji: '🍣', build: () => { const g = new THREE.Group(); const rice = new THREE.Mesh(new THREE.CapsuleGeometry(.22, .3, 6, 12), M(0xFBF6EC, { roughness: .5 })); rice.rotation.z = Math.PI / 2; rice.scale.y = .7; rice.position.y = .12; const fish = new THREE.Mesh(new THREE.BoxGeometry(.68, .11, .36), M(0xF2784B, { roughness: .4 })); fish.position.y = .28; const band = new THREE.Mesh(new THREE.BoxGeometry(.14, .3, .42), M(0x2E3A2A)); band.position.y = .14; g.add(rice, fish, band); return g; } },
  { name: 'Pizza', emoji: '🍕', build: () => { const g = new THREE.Group(); const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(.8, .42); s.lineTo(.8, -.42); s.lineTo(0, 0); const slice = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .1, bevelEnabled: false }), M(0xF2B33B)); slice.rotation.x = -Math.PI / 2; slice.position.y = .12; g.add(slice); for (const [x, z] of [[.35, .05], [.55, -.15], [.6, .18]]) { const pp = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), M(0xC0392B)); pp.position.set(x, .2, z); g.add(pp); } return g; } },
];

// ── chibi character ──────────────────────────────────────────────────────────
function chibi(skin, outfit, hair, isWaiter = false) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.32, .3, 6, 16), M(outfit)); body.position.y = .62; body.scale.y = .9; g.add(body);
  if (isWaiter) { const shirt = new THREE.Mesh(new THREE.BoxGeometry(.16, .42, .12), M(0xFDFDFD)); shirt.position.set(0, .66, .3); g.add(shirt); const bow = new THREE.Mesh(new THREE.BoxGeometry(.18, .08, .06), M(0xE23B3B)); bow.position.set(0, .82, .34); g.add(bow); }
  const head = new THREE.Mesh(new THREE.SphereGeometry(.44, 28, 20), M(skin, { roughness: .55 })); head.position.y = 1.3; g.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(.46, 24, 16, 0, 6.3, 0, Math.PI * 0.6), M(hair)); hairM.position.y = 1.34; g.add(hairM);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.075, 12, 10), M(0x241a12)); eye.position.set(sx * .16, 1.32, .4); g.add(eye);
    const w = new THREE.Mesh(new THREE.SphereGeometry(.028, 8, 6), M(0xffffff, { roughness: .3 })); w.position.set(sx * .16 + .03, 1.35, .45); g.add(w);
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), M(0xFF8A8A, { transparent: true, opacity: .5 })); cheek.position.set(sx * .24, 1.22, .37); g.add(cheek);
  }
  // little feet
  for (const sx of [-1, 1]) { const foot = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), M(0x3a3f4a)); foot.position.set(sx * .14, .12, .05); foot.scale.set(1, .7, 1.3); g.add(foot); }
  return shadows(g);
}

// billboard order/pay bubble (canvas sprite)
function makeBubble() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 160;
  const ctx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  spr.scale.set(1.5, 1.5, 1); spr.renderOrder = 999;
  function draw(emoji, frac, ring) {
    ctx.clearRect(0, 0, 160, 160);
    // bubble
    ctx.fillStyle = 'rgba(0,0,0,0.16)'; rrect(ctx, 24, 22, 112, 96, 26); ctx.fill();
    ctx.fillStyle = '#FFF8EE'; rrect(ctx, 20, 18, 112, 96, 26); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = ring < .3 ? '#E8442C' : ring < .6 ? '#FF9E1B' : '#5BBF4A'; ctx.stroke();
    // patience ring
    ctx.beginPath(); ctx.lineWidth = 9; ctx.strokeStyle = ctx.strokeStyle;
    ctx.arc(76, 66, 56, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
    // tail
    ctx.fillStyle = '#FFF8EE'; ctx.beginPath(); ctx.moveTo(60, 110); ctx.lineTo(92, 110); ctx.lineTo(76, 138); ctx.closePath(); ctx.fill();
    // content
    ctx.font = '54px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 76, 64);
    tex.needsUpdate = true;
  }
  return { spr, draw };
}
function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

// ── tables ───────────────────────────────────────────────────────────────────
const TABLE_POS = [
  new THREE.Vector3(-2.9, 0, -2.0), new THREE.Vector3(2.9, 0, -2.0),
  new THREE.Vector3(-2.9, 0, 2.8), new THREE.Vector3(2.9, 0, 2.8),
];
const tables = [];
const hitTargets = [];
for (let i = 0; i < TABLE_POS.length; i++) {
  const pos = TABLE_POS[i];
  const g = new THREE.Group(); g.position.copy(pos);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.0, .16, 32), M(0x9B5A2B)); top.position.y = .92;
  const cloth = new THREE.Mesh(new THREE.CylinderGeometry(.96, .9, .06, 32), M(0xF7F0E2, { roughness: .8 })); cloth.position.y = 1.02;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.12, .14, .85, 12), M(0x6E3F1E)); post.position.y = .48;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.5, .56, .1, 20), M(0x5A3318)); base.position.y = .06;
  g.add(top, cloth, post, base);
  // 2 chairs
  for (const cz of [1.35, -1.35]) {
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .12, 18), M(0xC9762F)); seat.position.set(0, .58, cz);
    const bk = new THREE.Mesh(new THREE.BoxGeometry(.66, .66, .12), M(0xB5651C)); bk.position.set(0, .95, cz + (cz > 0 ? .33 : -.33));
    g.add(seat, bk);
  }
  shadows(g); scene.add(g);
  // invisible tall hit box for easy tapping
  const hit = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3, 2.4), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(pos.x, 1.5, pos.z); hit.userData.table = i; scene.add(hit); hitTargets.push(hit);
  // glow ring (shows actionable)
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.45, 40), new THREE.MeshBasicMaterial({ color: 0xFFD24A, transparent: true, opacity: 0, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(pos.x, .05, pos.z); scene.add(ring);
  tables.push({ pos, state: 'empty', customer: null, food: null, bubble: null, ring, seatZ: pos.z + 1.35 });
}

// ── waiter ─────────────────────────────────────────────────────────────────────
const waiter = chibi(0xFBD2AF, 0x28368A, 0x4A2F1C, true);
waiter.position.set(0, 0, 6); waiter.scale.setScalar(1.08); scene.add(waiter);
const tray = new THREE.Group(); tray.position.set(.55, 1.05, .2); waiter.add(tray);
const trayPlate = new THREE.Mesh(new THREE.CylinderGeometry(.45, .4, .06, 20), M(0xC0884A)); tray.add(trayPlate);
let carried = null;            // food mesh on tray
const waiterState = { busy: false, queue: [], target: null, onArrive: null, t: 0 };

function waiterGoTo(v, onArrive) { waiterState.queue.push({ v: v.clone(), onArrive }); }
function nextWaiterStep() {
  if (waiterState.queue.length === 0) { waiterState.target = null; waiterState.busy = false; return; }
  const step = waiterState.queue.shift();
  waiterState.target = step.v; waiterState.onArrive = step.onArrive; waiterState.busy = true;
}

// ── customers ──────────────────────────────────────────────────────────────────
const SKINS = [0xFAD2B0, 0xE9B891, 0xF3C19E, 0xEFCBA8, 0xF5C9A0];
const OUTFITS = [0xE23B57, 0x2E6FB5, 0x3FB24B, 0xFF8A3D, 0x9B59C6, 0x39B7B0, 0xF2C53D];
const HAIRS = [0x3A2418, 0x7A4A28, 0xF2C53D, 0x2A2A2A, 0xC8C8C8, 0xD64A3A];
const DOOR = new THREE.Vector3(0, 0, 9.5);
let customers = [];
let nextSpawn = 1.0;

function spawnCustomer() {
  const free = tables.filter(t => t.state === 'empty');
  if (!free.length) return;
  const table = free[Math.floor(Math.random() * free.length)];
  table.state = 'incoming';
  const c = chibi(SKINS[(Math.random() * SKINS.length) | 0], OUTFITS[(Math.random() * OUTFITS.length) | 0], HAIRS[(Math.random() * HAIRS.length) | 0]);
  c.position.copy(DOOR); scene.add(c);
  const dish = (Math.random() * DISHES.length) | 0;
  const cust = { obj: c, table, state: 'incoming', dish, patience: 1, eat: 0, bob: Math.random() * 6, t: 0 };
  table.customer = cust;
  customers.push(cust);
}

// ── input ──────────────────────────────────────────────────────────────────────
const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();
function onTap(cx, cy) {
  ptr.x = (cx / innerWidth) * 2 - 1; ptr.y = -(cy / innerHeight) * 2 + 1;
  ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObjects(hitTargets, false)[0];
  if (!hit) return;
  handleTable(hit.object.userData.table);
}
canvas.addEventListener('pointerdown', e => onTap(e.clientX, e.clientY));

function approachOf(table) { return new THREE.Vector3(table.pos.x, 0, table.pos.z + 2.0); }

function handleTable(i) {
  const t = tables[i];
  if (waiterState.busy) { bump(); return; }
  if (t.state === 'ordered') {
    // deliver: go to kitchen, grab food, go to table, drop
    t.state = 'serving';
    setRing(t, 0);
    waiterGoTo(KITCHEN_PASS, () => { grabFood(t.customer.dish); });
    waiterGoTo(approachOf(t), () => { dropFood(t); });
  } else if (t.state === 'paying') {
    t.state = 'collecting';
    setRing(t, 0);
    waiterGoTo(approachOf(t), () => { collect(t); });
  } else { bump(); }
  if (!waiterState.target) nextWaiterStep();
}

function grabFood(dishIdx) {
  if (carried) tray.remove(carried);
  carried = DISHES[dishIdx].build(); carried.scale.setScalar(.7); carried.position.y = .1; tray.add(carried);
  pop(tray);
}
function dropFood(t) {
  const c = t.customer; if (!c) return;
  if (carried) { tray.remove(carried); carried = null; }
  const f = DISHES[c.dish].build(); f.scale.setScalar(.8);
  const pl = plate(); pl.add(f); pl.position.set(t.pos.x, 1.06, t.pos.z); pl.scale.set(0, 0, 0); scene.add(pl);
  pop(pl, .9); t.food = pl;
  c.state = 'eating'; c.eat = 3.0;
  if (c.bubble) c.bubble.draw('😋', 1, 1);
}
function collect(t) {
  const c = t.customer; if (!c) return;
  const val = 15 + ((Math.random() * 20) | 0);
  score += val; updateScore();
  coinBurst(new THREE.Vector3(t.pos.x, 1.4, t.pos.z));
  floatText('+$' + val, t.pos.x, t.pos.z);
  if (t.food) { scene.remove(t.food); t.food = null; }
  if (c.bubble) { c.obj.remove(c.bubble.spr); c.bubble = null; }
  c.state = 'leaving';
  setRing(t, 0);
}

// ── feedback fx ──────────────────────────────────────────────────────────────
const fx = [];
function pop(obj, s = 1) { obj.scale.setScalar(0.01); fx.push({ kind: 'pop', obj, t: 0, s }); }
function bump() { fx.push({ kind: 'bump', obj: waiter, t: 0 }); }
function coinBurst(pos) {
  for (let i = 0; i < 16; i++) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .04, 14), M(0xFFC21E, { metalness: .5, roughness: .35 }));
    coin.position.copy(pos); scene.add(coin);
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 3;
    fx.push({ kind: 'coin', obj: coin, t: 0, vx: Math.cos(a) * sp, vy: 4 + Math.random() * 3, vz: Math.sin(a) * sp, rot: Math.random() * 10 });
  }
}
const floats = [];
function floatText(txt, x, z) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 80; const ctx = cv.getContext('2d');
  ctx.font = '900 56px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 8; ctx.strokeStyle = '#7a3a0a'; ctx.strokeText(txt, 128, 42);
  ctx.fillStyle = '#FFE27A'; ctx.fillText(txt, 128, 42);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  spr.scale.set(2.2, .7, 1); spr.position.set(x, 2.2, z); spr.renderOrder = 1000; scene.add(spr);
  floats.push({ spr, t: 0 });
}

// ── HUD / state ───────────────────────────────────────────────────────────────
let score = 0, timeLeft = 120;
const scoreV = document.getElementById('score-v'), timerV = document.getElementById('timer-v'), fpsV = document.getElementById('fps-v');
function updateScore() { scoreV.textContent = score.toLocaleString(); scoreV.style.transform = 'scale(1.3)'; setTimeout(() => scoreV.style.transform = 'scale(1)', 110); }
scoreV.style.transition = 'transform .11s';
function setRing(t, op) { t.ring.userData.target = op; }

// ── main loop ──────────────────────────────────────────────────────────────────
let last = performance.now(), fpsAcc = 0, fpsFrames = 0, fpsTimer = 0;
const tmp = new THREE.Vector3();
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  // fps
  fpsFrames++; fpsTimer += dt;
  if (fpsTimer >= 0.5) { const f = Math.round(fpsFrames / fpsTimer); fpsV.textContent = f; window.__fps = f; fpsFrames = 0; fpsTimer = 0; }

  // timer
  if (timeLeft > 0) { timeLeft -= dt; const m = Math.max(0, timeLeft); timerV.textContent = `${Math.floor(m / 60)}:${String(Math.floor(m % 60)).padStart(2, '0')}`; }

  // spawn
  nextSpawn -= dt;
  if (nextSpawn <= 0 && customers.length < 4 && timeLeft > 0) { spawnCustomer(); nextSpawn = 2.4 + Math.random() * 2; }

  // waiter movement
  if (waiterState.target) {
    tmp.copy(waiterState.target).sub(waiter.position); tmp.y = 0;
    const d = tmp.length();
    if (d < 0.06) { waiter.position.copy(waiterState.target); const cb = waiterState.onArrive; waiterState.onArrive = null; if (cb) cb(); nextWaiterStep(); }
    else { tmp.normalize(); const sp = 6.5; waiter.position.addScaledVector(tmp, Math.min(sp * dt, d)); waiter.rotation.y = Math.atan2(tmp.x, tmp.z); waiter.position.y = Math.abs(Math.sin(now / 90)) * 0.12; }
  } else { waiter.position.y = Math.sin(now / 600) * 0.04; }

  // customers
  for (const c of customers) {
    c.t += dt;
    const o = c.obj;
    if (c.state === 'incoming') {
      const seat = new THREE.Vector3(c.table.pos.x, 0, c.table.seatZ);
      tmp.copy(seat).sub(o.position); tmp.y = 0; const d = tmp.length();
      if (d < 0.08) { o.position.copy(seat); o.rotation.y = Math.PI; c.state = 'ordered'; c.patience = 1; c.table.state = 'ordered'; const b = makeBubble(); b.spr.position.set(0, 2.05, 0); o.add(b.spr); c.bubble = b; b.draw(DISHES[c.dish].emoji, 1, 1); setRing(c.table, .7); }
      else { tmp.normalize(); o.position.addScaledVector(tmp, Math.min(4 * dt, d)); o.rotation.y = Math.atan2(tmp.x, tmp.z); o.position.y = Math.abs(Math.sin(c.t * 9)) * 0.1; }
    } else if (c.state === 'ordered') {
      c.patience -= dt / 12;
      o.position.y = Math.sin(c.t * 2 + c.bob) * 0.03;
      if (c.bubble) c.bubble.draw(DISHES[c.dish].emoji, Math.max(0, c.patience), c.patience);
      if (c.patience <= 0) { angryLeave(c); }
    } else if (c.state === 'serving') {
      o.position.y = Math.sin(c.t * 2 + c.bob) * 0.03;
    } else if (c.state === 'eating') {
      c.eat -= dt; o.position.y = Math.abs(Math.sin(c.t * 6)) * 0.06; // chewing bob
      if (c.eat <= 0) { c.state = 'paying'; c.table.state = 'paying'; if (c.bubble) c.bubble.draw('💰', 1, 1); setRing(c.table, .9); }
    } else if (c.state === 'leaving') {
      tmp.copy(DOOR).sub(o.position); tmp.y = 0; const d = tmp.length();
      if (d < 0.2) { despawn(c); } else { tmp.normalize(); o.position.addScaledVector(tmp, Math.min(5 * dt, d)); o.rotation.y = Math.atan2(tmp.x, tmp.z); o.position.y = Math.abs(Math.sin(c.t * 9)) * 0.1; }
    }
  }

  // table rings ease
  for (const t of tables) { const tgt = t.ring.userData.target || 0; t.ring.material.opacity += (tgt - t.ring.material.opacity) * Math.min(1, dt * 8); if (tgt > 0) t.ring.scale.setScalar(1 + Math.sin(now / 250) * 0.04); }

  // fx
  for (let i = fx.length - 1; i >= 0; i--) {
    const e = fx[i]; e.t += dt;
    if (e.kind === 'pop') { const s = e.s * THREE.MathUtils.clamp(backOut(e.t / 0.32), 0, 1.0); e.obj.scale.setScalar(s); if (e.t > .34) { e.obj.scale.setScalar(e.s); fx.splice(i, 1); } }
    else if (e.kind === 'bump') { waiter.scale.setScalar(1.08 * (1 + Math.sin(e.t * 30) * 0.05 * Math.max(0, 1 - e.t * 4))); if (e.t > .25) { waiter.scale.setScalar(1.08); fx.splice(i, 1); } }
    else if (e.kind === 'coin') { e.vy -= 14 * dt; e.obj.position.x += e.vx * dt; e.obj.position.y += e.vy * dt; e.obj.position.z += e.vz * dt; e.obj.rotation.x += e.rot * dt; e.obj.rotation.y += e.rot * dt; if (e.obj.position.y < 0.1) { scene.remove(e.obj); fx.splice(i, 1); } }
  }
  for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.t += dt; f.spr.position.y += dt * 1.4; f.spr.material.opacity = Math.max(0, 1 - f.t / 1.1); if (f.t > 1.1) { scene.remove(f.spr); floats.splice(i, 1); } }

  // subtle camera sway
  camera.position.x = CAM_BASE.x + Math.sin(now / 3200) * 0.45;
  camera.position.y = CAM_BASE.y + Math.sin(now / 2600) * 0.2;
  camera.lookAt(LOOK);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
function backOut(x) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
function angryLeave(c) { c.state = 'leaving'; c.table.state = 'empty'; c.table.customer = null; setRing(c.table, 0); if (c.bubble) c.bubble.draw('💢', 1, 0); }
function despawn(c) { scene.remove(c.obj); if (c.table.customer === c) { c.table.state = 'empty'; c.table.customer = null; c.table.food = null; } customers = customers.filter(x => x !== c); }

requestAnimationFrame(tick);

// ── debug / test hooks (drive deliveries headlessly for capture & metrics) ─────
window.PROTO = {
  tapTable: (i) => handleTable(i),
  autoplay: () => {
    setInterval(() => {
      if (waiterState.busy) return;
      const pay = tables.findIndex(t => t.state === 'paying'); if (pay >= 0) return handleTable(pay);
      const ord = tables.findIndex(t => t.state === 'ordered'); if (ord >= 0) return handleTable(ord);
    }, 350);
  },
  hero: () => {
    customers.forEach(c => scene.remove(c.obj)); customers = [];
    tables.forEach(t => { t.state = 'empty'; t.customer = null; if (t.food) { scene.remove(t.food); t.food = null; } setRing(t, 0); });
    const seat = (i, dish, state) => {
      const t = tables[i];
      const c = chibi(SKINS[i % SKINS.length], OUTFITS[(i * 2) % OUTFITS.length], HAIRS[i % HAIRS.length]);
      c.position.set(t.pos.x, 0, t.seatZ); c.rotation.y = Math.PI * (t.pos.x < 0 ? 0.8 : -0.8); scene.add(c);
      const b = makeBubble(); b.spr.position.set(0, 2.05, 0); c.add(b.spr);
      const cust = { obj: c, table: t, state, dish, patience: 0.7, eat: 2, bob: Math.random() * 6, t: 0, bubble: b };
      t.customer = cust; t.state = state; customers.push(cust);
      if (state === 'eating') { const pl = plate(); const f = DISHES[dish].build(); f.scale.setScalar(.8); pl.add(f); pl.position.set(t.pos.x, 1.06, t.pos.z); scene.add(pl); t.food = pl; b.draw('😋', 1, 1); }
      else if (state === 'paying') { b.draw('💰', 1, 1); setRing(t, .9); }
      else { b.draw(DISHES[dish].emoji, 0.7, 0.7); setRing(t, .7); }
    };
    seat(0, 4, 'eating'); seat(1, 2, 'ordered'); seat(3, 1, 'paying');
    score = 240; updateScore();
    coinBurst(new THREE.Vector3(tables[3].pos.x, 1.4, tables[3].pos.z));
    floatText('+$28', tables[3].pos.x, tables[3].pos.z);
    waiter.position.set(0.7, 0, 5.2); waiter.rotation.y = -0.5; grabFood(0);
  },
  metrics: () => ({ fps: window.__fps, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geom: renderer.info.memory.geometries, tex: renderer.info.memory.textures, jsHeapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null, score, custs: customers.length, states: customers.map(c => c.state), tstates: tables.map(t => t.state) }),
};
