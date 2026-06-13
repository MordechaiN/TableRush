import * as THREE from 'three';
import { ProgressionSystem } from './systems/ProgressionSystem';
import { SoundManager } from './systems/SoundManager';
import { fmtScore } from './config/GameConfig';

// ──────────────────────────────────────────────────────────────────────────
// TABLE RUSH — Three.js 3D title / menu experience.
// A warm, animated 3D hero (plate + silver cloche + floating low-poly food)
// behind a modern glassy mobile UI. Launches into the Phaser game on PLAY.
// ──────────────────────────────────────────────────────────────────────────

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let hero: THREE.Group;
let orbiters: { mesh: THREE.Object3D; r: number; speed: number; phase: number; yBob: number }[] = [];
let raf = 0;
let visible = true;
let overlay: HTMLDivElement;
let bestEl: HTMLSpanElement | null = null;

type Game = { scene: { start: (k: string) => void; stop: (k: string) => void } };
let gameRef: Game;

function mat(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...opts });
}

function buildBurger(): THREE.Group {
  const g = new THREE.Group();
  const bunBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.18, 24), mat(0xE3A24E));
  bunBottom.position.y = -0.18;
  const patty = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.16, 24), mat(0x6B3B22));
  const cheese = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.06, 0.78), mat(0xFFC23D));
  cheese.position.y = 0.1; cheese.rotation.y = Math.PI / 4;
  const bunTop = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xF0B45E));
  bunTop.position.y = 0.16; bunTop.scale.y = 0.7;
  [bunBottom, patty, cheese, bunTop].forEach(m => { m.castShadow = true; g.add(m); });
  return g;
}
function buildDonut(): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.18, 16, 32), mat(0xF58FB6));
  m.castShadow = true; return m;
}
function buildCherry(): THREE.Group {
  const g = new THREE.Group();
  const berry = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16), mat(0xE3403F, { roughness: 0.35 }));
  berry.castShadow = true;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), mat(0x4E7A36));
  stem.position.y = 0.34; stem.rotation.z = 0.3;
  g.add(berry, stem); return g;
}
function buildPizza(): THREE.Mesh {
  // wedge slice
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); shape.lineTo(0.85, 0.42); shape.lineTo(0.85, -0.42); shape.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
  const m = new THREE.Mesh(geo, mat(0xF2B33B));
  m.castShadow = true; return m;
}

export function initIntro(game: Game) {
  gameRef = game;

  // Overlay (3D canvas + UI)
  overlay = document.createElement('div');
  overlay.id = 'intro';
  overlay.innerHTML = `
    <canvas id="intro-canvas"></canvas>
    <div class="intro-ui">
      <div class="intro-logo">
        <span class="lt">TABLE</span><span class="lr">RUSH</span>
      </div>
      <div class="intro-tag">Seat · Serve · Sparkle ✨</div>
      <div class="intro-best">🏆 BEST <span id="intro-best-val">0</span></div>
      <button class="btn-play" id="intro-play"><span>▶</span> PLAY</button>
      <div class="intro-row">
        <button class="btn-ghost" id="intro-settings">⚙ Settings</button>
        <button class="btn-ghost" id="intro-credits">♥ Credits</button>
      </div>
      <div class="intro-ver">v2.0 · 3D Edition</div>
    </div>`;
  document.body.appendChild(overlay);
  injectStyles();
  bestEl = overlay.querySelector('#intro-best-val');

  const canvas = overlay.querySelector('#intro-canvas') as HTMLCanvasElement;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 1.7, 6.2);
  camera.lookAt(0, 0.4, 0);

  // Lights — warm & cozy
  scene.add(new THREE.AmbientLight(0xfff0d8, 0.85));
  scene.add(new THREE.HemisphereLight(0xfff6e6, 0xE89B50, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(3.5, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1; key.shadow.camera.far = 20;
  (key.shadow.camera as THREE.OrthographicCamera).left = -6;
  (key.shadow.camera as THREE.OrthographicCamera).right = 6;
  (key.shadow.camera as THREE.OrthographicCamera).top = 6;
  (key.shadow.camera as THREE.OrthographicCamera).bottom = -6;
  scene.add(key);
  const warm = new THREE.PointLight(0xff9a3d, 0.7, 30);
  warm.position.set(-3, 2, 3);
  scene.add(warm);
  const rim = new THREE.DirectionalLight(0xffd9a0, 0.5);
  rim.position.set(-2, 3, -4);
  scene.add(rim);

  // Soft contact shadow ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.22 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // Hero: plate + cloche
  hero = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.5, 0.18, 48), mat(0xFFFFFF, { roughness: 0.4 }));
  plate.position.y = -1.35; plate.castShadow = true; plate.receiveShadow = true;
  const plateRim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.08, 16, 48), mat(0xF3D9A0));
  plateRim.rotation.x = Math.PI / 2; plateRim.position.y = -1.27;
  const cloche = new THREE.Mesh(
    new THREE.SphereGeometry(1.25, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xEFF2F8, roughness: 0.3, metalness: 0.5, emissive: 0x4a4f5a, emissiveIntensity: 0.18 }),
  );
  cloche.position.y = -1.27; cloche.castShadow = true;
  const clocheBand = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.05, 12, 40), mat(0xF2B33B, { metalness: 0.6, roughness: 0.3 }));
  clocheBand.rotation.x = Math.PI / 2; clocheBand.position.y = -0.85;
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 16), mat(0xF2B33B, { metalness: 0.7, roughness: 0.25 }));
  knob.position.y = 0.0; knob.castShadow = true;
  const knobStem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 12), mat(0xBFC4CE, { metalness: 0.7, roughness: 0.3 }));
  knobStem.position.y = -0.12;
  hero.add(plate, plateRim, cloche, clocheBand, knobStem, knob);
  scene.add(hero);

  // Orbiting food
  const foods = [buildBurger(), buildDonut(), buildCherry(), buildPizza()];
  const radii = [2.7, 2.4, 2.9, 2.5];
  const speeds = [0.5, -0.62, 0.43, -0.55];
  foods.forEach((f, i) => {
    f.scale.setScalar(0.95);
    scene.add(f);
    orbiters.push({ mesh: f, r: radii[i], speed: speeds[i], phase: (i / foods.length) * Math.PI * 2, yBob: 0.4 + i * 0.12 });
  });

  resize();
  window.addEventListener('resize', resize);

  // Buttons
  const play = overlay.querySelector('#intro-play') as HTMLButtonElement;
  play.addEventListener('click', () => { try { SoundManager.uiClick(); } catch { /* */ } startGame(); });
  (overlay.querySelector('#intro-settings') as HTMLButtonElement)
    .addEventListener('click', () => { try { SoundManager.uiClick(); } catch { /* */ } hideIntro(); gameRef.scene.start('SettingsScene'); });
  (overlay.querySelector('#intro-credits') as HTMLButtonElement)
    .addEventListener('click', () => { try { SoundManager.uiClick(); } catch { /* */ } hideIntro(); gameRef.scene.start('CreditsScene'); });

  refreshStats();
  animate();

  (window as unknown as { TableRushUI: unknown }).TableRushUI = { show: showIntro, hide: hideIntro };
}

function startGame() {
  hideIntro();
  try { gameRef.scene.stop('MainMenuScene'); } catch { /* */ }
  gameRef.scene.start('GameScene');
}

function refreshStats() {
  try {
    const prog = ProgressionSystem.getData();
    if (bestEl) bestEl.textContent = fmtScore(prog.highScore || 0);
  } catch { /* */ }
}

export function showIntro() {
  refreshStats();
  overlay.style.display = 'block';
  requestAnimationFrame(() => overlay.classList.remove('hide'));
  if (!visible) { visible = true; animate(); }
}

export function hideIntro() {
  overlay.classList.add('hide');
  visible = false;
  cancelAnimationFrame(raf);
  setTimeout(() => { if (!visible) overlay.style.display = 'none'; }, 360);
}

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // pull camera back on portrait so the hero fits under the UI
  camera.position.z = h > w ? 7.4 : 6.2;
  camera.position.y = h > w ? 2.0 : 1.7;
  camera.lookAt(0, 0.3, 0);
  camera.updateProjectionMatrix();
}

function animate() {
  raf = requestAnimationFrame(animate);
  const t = performance.now() / 1000;
  hero.rotation.y = t * 0.5;
  hero.position.y = Math.sin(t * 1.4) * 0.07;
  orbiters.forEach(o => {
    const a = t * o.speed + o.phase;
    o.mesh.position.set(Math.cos(a) * o.r, o.yBob + Math.sin(t * 1.6 + o.phase) * 0.18, Math.sin(a) * o.r * 0.55 - 0.3);
    o.mesh.rotation.x = t * 0.8 + o.phase;
    o.mesh.rotation.y = t * 1.1;
    // scale down items behind the hero for depth
    const depth = (o.mesh.position.z + 2) / 4;
    o.mesh.scale.setScalar(0.6 + depth * 0.5);
  });
  renderer.render(scene, camera);
}

function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
  #intro { position: fixed; inset: 0; z-index: 20; overflow: hidden;
    background: radial-gradient(120% 90% at 50% 12%, #FFF3DD 0%, #FFE3B8 38%, #FBC98A 70%, #EFA85E 100%);
    transition: opacity .35s ease; }
  #intro.hide { opacity: 0; pointer-events: none; }
  #intro-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  .intro-ui { position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: flex-start; padding-top: 7vh;
    font-family: 'Arial Black', Arial, sans-serif; pointer-events: none; user-select: none; }
  .intro-ui > * { pointer-events: auto; }
  .intro-logo { line-height: .82; text-align: center; filter: drop-shadow(0 6px 10px rgba(120,60,10,.28)); }
  .intro-logo span { display: block; font-weight: 900; letter-spacing: 1px; }
  .intro-logo .lt { font-size: clamp(56px, 17vw, 96px); color: #E8442C;
    -webkit-text-stroke: 4px #fff; paint-order: stroke fill; }
  .intro-logo .lr { font-size: clamp(56px, 17vw, 96px); color: #FF9E1B; margin-top: -6px;
    -webkit-text-stroke: 4px #8a4209; paint-order: stroke fill; }
  .intro-tag { margin-top: 14px; font-size: clamp(13px,3.6vw,17px); font-family: Arial, sans-serif;
    font-weight: bold; color: #9A551F; letter-spacing: .5px; }
  .intro-best { margin-top: 16px; font-size: 15px; color: #7a4516;
    background: rgba(255,255,255,.6); border: 2px solid rgba(255,255,255,.8);
    padding: 7px 18px; border-radius: 999px; backdrop-filter: blur(4px);
    box-shadow: 0 4px 12px rgba(150,90,20,.18); }
  .intro-best span { color: #E8442C; }
  .btn-play { margin-top: auto; margin-bottom: 16px; width: min(78vw, 320px); height: 64px;
    font-family: 'Arial Black', sans-serif; font-size: 26px; font-weight: 900; color: #fff;
    letter-spacing: 1px; border: none; border-radius: 20px; cursor: pointer;
    background: linear-gradient(180deg, #FF8A3D 0%, #F4671E 100%);
    box-shadow: 0 8px 0 #C24A12, 0 14px 22px rgba(180,80,20,.4);
    transition: transform .08s ease, box-shadow .08s ease; }
  .btn-play span { font-size: 20px; }
  .btn-play:hover { transform: translateY(-2px); }
  .btn-play:active { transform: translateY(6px); box-shadow: 0 2px 0 #C24A12, 0 6px 12px rgba(180,80,20,.4); }
  .intro-row { display: flex; gap: 14px; margin-bottom: 18px; }
  .btn-ghost { font-family: Arial, sans-serif; font-weight: bold; font-size: 14px; color: #7a4516;
    background: rgba(255,255,255,.65); border: 2px solid rgba(255,255,255,.85);
    padding: 10px 18px; border-radius: 14px; cursor: pointer; backdrop-filter: blur(4px);
    box-shadow: 0 4px 10px rgba(150,90,20,.16); transition: transform .08s ease; }
  .btn-ghost:hover { transform: translateY(-2px); }
  .btn-ghost:active { transform: translateY(1px); }
  .intro-ver { margin-bottom: 12px; font-family: Arial, sans-serif; font-size: 11px; color: #B0793C; letter-spacing: 1px; }
  @keyframes playPulse { 0%,100%{ box-shadow: 0 8px 0 #C24A12, 0 14px 22px rgba(180,80,20,.4);} 50%{ box-shadow: 0 8px 0 #C24A12, 0 14px 30px rgba(255,140,40,.65);} }
  .btn-play { animation: playPulse 1.8s ease-in-out infinite; }
  `;
  document.head.appendChild(s);
}
