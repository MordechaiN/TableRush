import * as THREE from 'three';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { SoundManager } from '../systems/SoundManager';
import { fmtScore, LEVELS } from '../config/GameConfig';
import { M, chibi, Chibi } from './builders';

// 3D animated title / menu. Pure presentation; calls back to the orchestrator.
// The hero is the game's mascot: the waiter, waving on a little podium while
// the menu's dishes orbit him.
let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera;
let mascot: Chibi, podium: THREE.Group;
let orbiters: { m: THREE.Object3D; r: number; sp: number; ph: number; y: number }[] = [];
let raf = 0, overlay: HTMLDivElement, visible = false;
let onPlayCb: (levelId?: number) => void = () => { /* set in init */ };

export function initTitle(handlers: { onPlay: (levelId?: number) => void; onShop: () => void; onSettings: () => void; onCredits: () => void }) {
  onPlayCb = handlers.onPlay;
  overlay = document.createElement('div'); overlay.id = 'tr-title';
  overlay.innerHTML = `
    <div class="tt-rays"></div>
    <div class="tt-cloud c1"></div><div class="tt-cloud c2"></div><div class="tt-cloud c3"></div>
    <canvas id="tr-title-c"></canvas>
    <div class="tt-ui">
      <div class="tt-logo"><span class="t">TABLE</span><span class="r">RUSH</span></div>
      <div class="tt-tag">Seat · Serve · Sparkle ✨</div>
      <div class="tt-chips">
        <div class="tt-best">🏆 BEST <span id="tt-best">0</span></div>
        <div class="tt-best">⭐ <span id="tt-stars">0</span></div>
        <div class="tt-best">💰 <span id="tt-coins">$0</span></div>
        <div class="tt-best" id="tt-daily" style="display:none">🎯 <span id="tt-daily-v"></span></div>
      </div>
      <div class="tt-levels" id="tt-levels"></div>
      <button class="tt-play" id="tt-play"><span>▶</span> <span id="tt-play-lbl">PLAY</span></button>
      <div class="tt-row"><button class="tt-ghost" id="tt-shop">🛒 Upgrades</button><button class="tt-ghost" id="tt-settings">⚙ Settings</button><button class="tt-ghost" id="tt-credits">♥ Credits</button></div>
      <div class="tt-ver">V1.1</div>
    </div>`;
  document.body.appendChild(overlay); injectCss();

  const canvas = overlay.querySelector('#tr-title-c') as HTMLCanvasElement;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100); camera.position.set(0, 1.7, 6.4); camera.lookAt(0, 0.3, 0);

  scene.add(new THREE.AmbientLight(0xfff0d8, 0.85));
  scene.add(new THREE.HemisphereLight(0xfff6e6, 0xE89B50, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(3.5, 6, 4); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { near: 1, far: 20, left: -6, right: 6, top: 6, bottom: -6 }); scene.add(key);
  scene.add(new THREE.PointLight(0xff9a3d, 0.7, 30).translateX(-3).translateY(2).translateZ(3));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.22 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -1.5; ground.receiveShadow = true; scene.add(ground);

  // the mascot on his podium
  podium = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.5, 0.35, 40), M(0xE2725B, { roughness: 0.6 }));
  disc.position.y = -1.35; disc.castShadow = disc.receiveShadow = true;
  const discTop = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.32, 0.1, 40), M(0xF6E3C2, { roughness: 0.7 }));
  discTop.position.y = -1.14;
  podium.add(disc, discTop);
  mascot = chibi({ skin: 0xFBD2AF, outfit: 0x28368A, hair: 0x4A2F1C, waiter: true });
  mascot.g.position.y = -1.1;
  mascot.g.scale.setScalar(1.15);
  podium.add(mascot.g);
  scene.add(podium);

  const burger = mkBurger(), donut = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.18, 16, 32), M(0xF58FB6)), cherry = mkCherry(), pizza = mkPizza();
  [burger, donut, cherry, pizza].forEach((f, i) => { scene.add(f); orbiters.push({ m: f, r: [2.7, 2.4, 2.9, 2.5][i], sp: [0.5, -0.62, 0.43, -0.55][i], ph: (i / 4) * 6.28, y: 0.4 + i * 0.12 }); });

  resize(); addEventListener('resize', resize);
  const play = (id?: number) => { try { SoundManager.uiClick(); } catch { /* */ } onPlayCb(id); };
  (overlay.querySelector('#tt-play') as HTMLButtonElement).onclick = () => play();
  (overlay.querySelector('#tt-shop') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } handlers.onShop(); };
  (overlay.querySelector('#tt-settings') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } handlers.onSettings(); };
  (overlay.querySelector('#tt-credits') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } handlers.onCredits(); };
  showTitle();
}

function mkBurger() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.18, 24), M(0xE3A24E)); b.position.y = -0.18; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.16, 24), M(0x6B3B22)); const c = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.06, 0.78), M(0xFFC23D)); c.position.y = 0.1; c.rotation.y = 0.78; const t = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16, 0, 6.3, 0, Math.PI / 2), M(0xF0B45E)); t.position.y = 0.16; t.scale.y = 0.7; g.add(b, p, c, t); g.traverse(o => (o as THREE.Mesh).castShadow = true); return g; }
function mkCherry() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16), M(0xE3403F, { roughness: 0.35 })); b.castShadow = true; const s = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), M(0x4E7A36)); s.position.y = 0.34; s.rotation.z = 0.3; g.add(b, s); return g; }
function mkPizza() { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.85, 0.42); s.lineTo(0.85, -0.42); s.lineTo(0, 0); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }), M(0xF2B33B)); m.castShadow = true; return m; }

function refresh() {
  try {
    const data = ProgressionSystem.getData();
    const bestEl = overlay.querySelector('#tt-best');
    if (bestEl) bestEl.textContent = fmtScore(data.highScore || 0);
    const starsEl = overlay.querySelector('#tt-stars');
    if (starsEl) starsEl.textContent = `${ProgressionSystem.totalStars()}/${LEVELS.length * 3}`;
    const coinEl = overlay.querySelector('#tt-coins');
    if (coinEl) coinEl.textContent = '$' + fmtScore(data.coins || 0);
    const playLbl = overlay.querySelector('#tt-play-lbl');
    if (playLbl) playLbl.textContent = `LEVEL ${data.levelReached}`;
    const daily = ProgressionSystem.getDailyGoal();
    const dEl = overlay.querySelector('#tt-daily') as HTMLElement | null;
    const dV = overlay.querySelector('#tt-daily-v');
    if (dEl && dV && daily.target > 0) {
      dEl.style.display = '';
      dV.textContent = daily.done ? 'Daily ✓' : '$' + fmtScore(daily.target);
    }
    renderLevels(data.levelReached, data.levelStars);
  } catch { /* */ }
}

/** Level-select row: every unlocked shift is replayable for more stars. */
function renderLevels(reached: number, stars: number[]) {
  const wrap = overlay.querySelector('#tt-levels') as HTMLElement;
  wrap.innerHTML = LEVELS.map(l => {
    const locked = l.id > reached;
    const st = stars[l.id - 1] ?? 0;
    const starTxt = locked ? '' : `<i>${'★'.repeat(st)}${'☆'.repeat(Math.max(0, 3 - st))}</i>`;
    return `<button class="tt-lvl ${locked ? 'lock' : ''} ${l.id === reached ? 'cur' : ''}" data-lvl="${l.id}" ${locked ? 'disabled' : ''} aria-label="Level ${l.id}${locked ? ' locked' : ''}">
      ${locked ? '🔒' : l.id}${starTxt}</button>`;
  }).join('');
  wrap.querySelectorAll('[data-lvl]:not([disabled])').forEach(b => {
    (b as HTMLButtonElement).onclick = () => {
      try { SoundManager.uiClick(); } catch { /* */ }
      onPlayCb(Number((b as HTMLElement).dataset.lvl));
    };
  });
}

export function showTitle() {
  refresh();
  overlay.style.display = 'block';
  requestAnimationFrame(() => overlay.classList.remove('hide'));
  if (!visible) { visible = true; animate(); }
}
export function hideTitle() {
  overlay.classList.add('hide');
  visible = false;
  cancelAnimationFrame(raf);
  setTimeout(() => { if (!visible) overlay.style.display = 'none'; }, 360);
}

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // portrait: pull back + shrink the hero so the mascot never fills the screen
  const portrait = h > w;
  camera.position.z = portrait ? 10.5 : 6.6;
  camera.position.y = portrait ? 2.4 : 1.7;
  const s = portrait ? 0.85 : 1;
  podium.scale.setScalar(s);
  camera.lookAt(0, portrait ? -0.2 : 0.3, 0);
  camera.updateProjectionMatrix();
}
function animate() {
  if (!visible) return;
  raf = requestAnimationFrame(animate);
  const t = performance.now() / 1000;
  // mascot: friendly idle — sway, bob, and a big wave every few seconds
  podium.rotation.y = Math.sin(t * 0.45) * 0.28;
  mascot.g.position.y = -1.1 + Math.abs(Math.sin(t * 2.2)) * 0.05;
  const wavePhase = (t % 4) / 4;
  if (wavePhase < 0.35) {
    mascot.armR.rotation.set(-2.5 + Math.sin(t * 14) * 0.35, 0, 0.4);
  } else {
    mascot.armR.rotation.set(0, 0, 0.35);
  }
  mascot.armL.rotation.set(0, 0, -0.35 - Math.sin(t * 2.2) * 0.06);
  mascot.head.rotation.z = Math.sin(t * 0.9) * 0.06;
  const ps = podium.scale.x; // orbiters shrink with the hero in portrait
  orbiters.forEach(o => {
    const a = t * o.sp + o.ph;
    // orbit plane sits well behind the mascot so nothing crosses his body
    o.m.position.set(Math.cos(a) * o.r * ps, (o.y + Math.sin(t * 1.6 + o.ph) * 0.18) * ps, (Math.sin(a) * o.r * 0.25 - 1.7) * ps);
    o.m.rotation.set(t * 0.8 + o.ph, t * 1.1, 0);
    const d = (o.m.position.z + 2.2) / 4;
    o.m.scale.setScalar((0.6 + d * 0.5) * ps);
  });
  renderer.render(scene, camera);
}

function injectCss() {
  const s = document.createElement('style'); s.textContent = `
  #tr-title{position:fixed;inset:0;z-index:20;overflow:hidden;transition:opacity .35s ease;
    background:linear-gradient(180deg,#8FDCC8 0%,#C9EBD9 55%,#FFF3D8 100%);font-family:var(--font-display)}
  #tr-title.hide{opacity:0;pointer-events:none}
  #tr-title-c{position:absolute;inset:0;width:100%;height:100%}
  .tt-rays{position:absolute;left:50%;top:46%;width:160vmax;height:160vmax;transform:translate(-50%,-50%);opacity:.16;pointer-events:none;
    background:conic-gradient(#fff 0 11deg,transparent 11deg 30deg,#fff 30deg 41deg,transparent 41deg 60deg,#fff 60deg 71deg,transparent 71deg 90deg,#fff 90deg 101deg,transparent 101deg 120deg,#fff 120deg 131deg,transparent 131deg 150deg,#fff 150deg 161deg,transparent 161deg 180deg,#fff 180deg 191deg,transparent 191deg 210deg,#fff 210deg 221deg,transparent 221deg 240deg,#fff 240deg 251deg,transparent 251deg 270deg,#fff 270deg 281deg,transparent 281deg 300deg,#fff 300deg 311deg,transparent 311deg 330deg,#fff 330deg 341deg,transparent 341deg 360deg);
    border-radius:50%;animation:raySpin 60s linear infinite}
  @keyframes raySpin{to{transform:translate(-50%,-50%) rotate(360deg)}}
  .tt-cloud{position:absolute;background:#fff;border-radius:999px;opacity:.85;pointer-events:none;filter:blur(1px)}
  .tt-cloud::before,.tt-cloud::after{content:'';position:absolute;background:#fff;border-radius:50%}
  .tt-cloud.c1{width:130px;height:44px;top:14%;left:-140px;animation:cloudDrift 52s linear infinite}
  .tt-cloud.c1::before{width:56px;height:56px;top:-26px;left:22px}.tt-cloud.c1::after{width:40px;height:40px;top:-16px;left:66px}
  .tt-cloud.c2{width:90px;height:32px;top:30%;left:-100px;animation:cloudDrift 74s linear 12s infinite}
  .tt-cloud.c2::before{width:40px;height:40px;top:-18px;left:16px}.tt-cloud.c2::after{width:28px;height:28px;top:-10px;left:46px}
  .tt-cloud.c3{width:110px;height:38px;top:58%;left:-120px;animation:cloudDrift 64s linear 28s infinite}
  .tt-cloud.c3::before{width:48px;height:48px;top:-22px;left:18px}.tt-cloud.c3::after{width:34px;height:34px;top:-13px;left:56px}
  @keyframes cloudDrift{to{transform:translateX(calc(100vw + 300px))}}
  .tt-ui{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
    padding-top:calc(5vh + var(--safe-top));padding-bottom:var(--safe-bottom);pointer-events:none;user-select:none}
  .tt-ui>*{pointer-events:auto}
  .tt-logo{line-height:.82;text-align:center;filter:drop-shadow(0 6px 10px rgba(120,60,10,.28))}
  .tt-logo span{display:block;font-weight:800;letter-spacing:1px}
  .tt-logo .t{font-size:clamp(52px,16vw,92px);color:#F2505A;-webkit-text-stroke:4px #fff;paint-order:stroke fill}
  .tt-logo .r{font-size:clamp(52px,16vw,92px);color:#FFC838;margin-top:-6px;-webkit-text-stroke:4px #5A3A2E;paint-order:stroke fill}
  .tt-tag{margin-top:12px;font-size:clamp(13px,3.6vw,17px);font-weight:700;color:#5A3A2E}
  .tt-chips{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
  .tt-best{font-size:14px;font-weight:700;color:#5A3A2E;background:rgba(255,255,255,.72);border:2px solid #fff;padding:7px 15px;border-radius:999px;backdrop-filter:blur(4px);box-shadow:0 4px 12px rgba(90,58,46,.16)}
  .tt-best span{color:#E8632A}
  .tt-levels{margin-top:auto;margin-bottom:10px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:min(92vw,460px)}
  .tt-lvl{width:48px;height:52px;border:none;border-radius:14px;cursor:pointer;font-family:var(--font-display);font-weight:800;font-size:18px;color:#5A3A2E;
    background:rgba(255,255,255,.82);border:2px solid #fff;box-shadow:0 4px 10px rgba(90,58,46,.18);display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
  .tt-lvl i{font-style:normal;font-size:9.5px;letter-spacing:1px;color:#F08A1E;margin-top:2px}
  .tt-lvl.cur{background:linear-gradient(180deg,#FFE3A8,#FFC838);border-color:#fff;color:#8A4209}
  .tt-lvl.lock{opacity:.55;cursor:default;font-size:15px}
  .tt-lvl:not(.lock):active{transform:translateY(2px)}
  .tt-play{margin-bottom:14px;width:min(78vw,320px);height:64px;font-family:var(--font-display);font-size:26px;font-weight:800;color:#fff;letter-spacing:1px;border:none;border-radius:20px;cursor:pointer;background:linear-gradient(180deg,#FF8A3D,#F4671E);box-shadow:0 8px 0 #C24A12,0 14px 22px rgba(180,80,20,.4);transition:transform .08s,box-shadow .08s;animation:ttPulse 1.8s ease-in-out infinite}
  .tt-play span{font-size:20px}.tt-play:active{transform:translateY(6px);box-shadow:0 2px 0 #C24A12,0 6px 12px rgba(180,80,20,.4)}
  .tt-row{display:flex;gap:14px;margin-bottom:16px}
  .tt-ghost{font-weight:700;font-size:14px;color:#5A3A2E;background:rgba(255,255,255,.72);border:2px solid #fff;padding:10px 18px;border-radius:14px;cursor:pointer;backdrop-filter:blur(4px);box-shadow:0 4px 10px rgba(90,58,46,.14)}
  .tt-ghost:active{transform:translateY(1px)}
  .tt-ver{margin-bottom:10px;font-size:11px;font-weight:600;color:#7A9A8C;letter-spacing:1px}
  @keyframes ttPulse{0%,100%{box-shadow:0 8px 0 #C24A12,0 14px 22px rgba(180,80,20,.4)}50%{box-shadow:0 8px 0 #C24A12,0 14px 30px rgba(255,140,40,.65)}}`;
  document.head.appendChild(s);
}
