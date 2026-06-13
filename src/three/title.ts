import * as THREE from 'three';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { SoundManager } from '../systems/SoundManager';
import { fmtScore } from '../config/GameConfig';
import { M } from './builders';

// 3D animated title / menu. Pure presentation; calls back to the orchestrator.
let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera;
let hero: THREE.Group, orbiters: { m: THREE.Object3D; r: number; sp: number; ph: number; y: number }[] = [];
let raf = 0, overlay: HTMLDivElement, bestEl: HTMLElement | null = null, visible = false;

export function initTitle(handlers: { onPlay: () => void; onSettings: () => void; onCredits: () => void }) {
  overlay = document.createElement('div'); overlay.id = 'tr-title';
  overlay.innerHTML = `
    <canvas id="tr-title-c"></canvas>
    <div class="tt-ui">
      <div class="tt-logo"><span class="t">TABLE</span><span class="r">RUSH</span></div>
      <div class="tt-tag">Seat · Serve · Sparkle ✨</div>
      <div class="tt-best">🏆 BEST <span id="tt-best">0</span></div>
      <button class="tt-play" id="tt-play"><span>▶</span> PLAY</button>
      <div class="tt-row"><button class="tt-ghost" id="tt-settings">⚙ Settings</button><button class="tt-ghost" id="tt-credits">♥ Credits</button></div>
      <div class="tt-ver">v2.0 · Three.js Edition</div>
    </div>`;
  document.body.appendChild(overlay); injectCss(); bestEl = overlay.querySelector('#tt-best');

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

  hero = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.5, 0.18, 48), M(0xFFFFFF, { roughness: 0.4 })); plate.position.y = -1.35; plate.castShadow = plate.receiveShadow = true;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.08, 16, 48), M(0xF3D9A0)); rim.rotation.x = Math.PI / 2; rim.position.y = -1.27;
  const cloche = new THREE.Mesh(new THREE.SphereGeometry(1.25, 40, 24, 0, 6.3, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xEFF2F8, roughness: 0.3, metalness: 0.5, emissive: 0x4a4f5a, emissiveIntensity: 0.18 })); cloche.position.y = -1.27; cloche.castShadow = true;
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 16), M(0xF2B33B, { metalness: 0.7, roughness: 0.25 }));
  hero.add(plate, rim, cloche, knob); scene.add(hero);

  const burger = mkBurger(), donut = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.18, 16, 32), M(0xF58FB6)), cherry = mkCherry(), pizza = mkPizza();
  [burger, donut, cherry, pizza].forEach((f, i) => { scene.add(f); orbiters.push({ m: f, r: [2.7, 2.4, 2.9, 2.5][i], sp: [0.5, -0.62, 0.43, -0.55][i], ph: (i / 4) * 6.28, y: 0.4 + i * 0.12 }); });

  resize(); addEventListener('resize', resize);
  (overlay.querySelector('#tt-play') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } handlers.onPlay(); };
  (overlay.querySelector('#tt-settings') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } handlers.onSettings(); };
  (overlay.querySelector('#tt-credits') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } handlers.onCredits(); };
  showTitle(); animate();
}

function mkBurger() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.18, 24), M(0xE3A24E)); b.position.y = -0.18; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.16, 24), M(0x6B3B22)); const c = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.06, 0.78), M(0xFFC23D)); c.position.y = 0.1; c.rotation.y = 0.78; const t = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16, 0, 6.3, 0, Math.PI / 2), M(0xF0B45E)); t.position.y = 0.16; t.scale.y = 0.7; g.add(b, p, c, t); g.traverse(o => (o as THREE.Mesh).castShadow = true); return g; }
function mkCherry() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16), M(0xE3403F, { roughness: 0.35 })); b.castShadow = true; const s = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), M(0x4E7A36)); s.position.y = 0.34; s.rotation.z = 0.3; g.add(b, s); return g; }
function mkPizza() { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.85, 0.42); s.lineTo(0.85, -0.42); s.lineTo(0, 0); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }), M(0xF2B33B)); m.castShadow = true; return m; }

function refresh() { try { if (bestEl) bestEl.textContent = fmtScore(ProgressionSystem.getData().highScore || 0); } catch { /* */ } }
export function showTitle() { refresh(); overlay.style.display = 'block'; requestAnimationFrame(() => overlay.classList.remove('hide')); if (!visible) { visible = true; animate(); } }
export function hideTitle() { overlay.classList.add('hide'); visible = false; cancelAnimationFrame(raf); setTimeout(() => { if (!visible) overlay.style.display = 'none'; }, 360); }

function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.position.z = h > w ? 7.4 : 6.2; camera.position.y = h > w ? 2 : 1.7; camera.lookAt(0, 0.3, 0); camera.updateProjectionMatrix(); }
function animate() { raf = requestAnimationFrame(animate); const t = performance.now() / 1000; hero.rotation.y = t * 0.5; hero.position.y = Math.sin(t * 1.4) * 0.07; orbiters.forEach(o => { const a = t * o.sp + o.ph; o.m.position.set(Math.cos(a) * o.r, o.y + Math.sin(t * 1.6 + o.ph) * 0.18, Math.sin(a) * o.r * 0.55 - 0.3); o.m.rotation.set(t * 0.8 + o.ph, t * 1.1, 0); const d = (o.m.position.z + 2) / 4; o.m.scale.setScalar(0.6 + d * 0.5); }); renderer.render(scene, camera); }

function injectCss() {
  const s = document.createElement('style'); s.textContent = `
  #tr-title{position:fixed;inset:0;z-index:20;overflow:hidden;transition:opacity .35s ease;
    background:radial-gradient(120% 90% at 50% 12%,#FFF3DD 0%,#FFE3B8 38%,#FBC98A 70%,#EFA85E 100%);font-family:'Arial Black',Arial,sans-serif}
  #tr-title.hide{opacity:0;pointer-events:none}
  #tr-title-c{position:absolute;inset:0;width:100%;height:100%}
  .tt-ui{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;padding-top:7vh;pointer-events:none;user-select:none}
  .tt-ui>*{pointer-events:auto}
  .tt-logo{line-height:.82;text-align:center;filter:drop-shadow(0 6px 10px rgba(120,60,10,.28))}
  .tt-logo span{display:block;font-weight:900;letter-spacing:1px}
  .tt-logo .t{font-size:clamp(56px,17vw,96px);color:#E8442C;-webkit-text-stroke:4px #fff;paint-order:stroke fill}
  .tt-logo .r{font-size:clamp(56px,17vw,96px);color:#FF9E1B;margin-top:-6px;-webkit-text-stroke:4px #8a4209;paint-order:stroke fill}
  .tt-tag{margin-top:14px;font-size:clamp(13px,3.6vw,17px);font-family:Arial;font-weight:bold;color:#9A551F}
  .tt-best{margin-top:16px;font-size:15px;color:#7a4516;background:rgba(255,255,255,.6);border:2px solid rgba(255,255,255,.8);padding:7px 18px;border-radius:999px;backdrop-filter:blur(4px);box-shadow:0 4px 12px rgba(150,90,20,.18)}
  .tt-best span{color:#E8442C}
  .tt-play{margin-top:auto;margin-bottom:16px;width:min(78vw,320px);height:64px;font-family:'Arial Black';font-size:26px;font-weight:900;color:#fff;letter-spacing:1px;border:none;border-radius:20px;cursor:pointer;background:linear-gradient(180deg,#FF8A3D,#F4671E);box-shadow:0 8px 0 #C24A12,0 14px 22px rgba(180,80,20,.4);transition:transform .08s,box-shadow .08s;animation:ttPulse 1.8s ease-in-out infinite}
  .tt-play span{font-size:20px}.tt-play:active{transform:translateY(6px);box-shadow:0 2px 0 #C24A12,0 6px 12px rgba(180,80,20,.4)}
  .tt-row{display:flex;gap:14px;margin-bottom:18px}
  .tt-ghost{font-family:Arial;font-weight:bold;font-size:14px;color:#7a4516;background:rgba(255,255,255,.65);border:2px solid rgba(255,255,255,.85);padding:10px 18px;border-radius:14px;cursor:pointer;backdrop-filter:blur(4px);box-shadow:0 4px 10px rgba(150,90,20,.16)}
  .tt-ghost:active{transform:translateY(1px)}
  .tt-ver{margin-bottom:12px;font-family:Arial;font-size:11px;color:#B0793C;letter-spacing:1px}
  @keyframes ttPulse{0%,100%{box-shadow:0 8px 0 #C24A12,0 14px 22px rgba(180,80,20,.4)}50%{box-shadow:0 8px 0 #C24A12,0 14px 30px rgba(255,140,40,.65)}}`;
  document.head.appendChild(s);
}
