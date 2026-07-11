import * as THREE from 'three';
import { Accessory, MENU_ITEMS } from '../config/GameConfig';
import { P } from '../config/Palette';

// ── Shared low-poly art library ───────────────────────────────────────────────
// All geometry and single-color materials are cached and shared between
// instances: characters, tables and dishes cost no allocations after startup.

const FONT = '"Baloo 2", "Arial Rounded MT Bold", Arial, sans-serif';

const matCache = new Map<string, THREE.MeshStandardMaterial>();
export function M(c: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.MeshStandardMaterial {
  const key = c + '|' + JSON.stringify(o);
  let m = matCache.get(key);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.72, metalness: 0.04, ...o }); matCache.set(key, m); }
  return m;
}

const geoCache = new Map<string, THREE.BufferGeometry>();
export function G<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key);
  if (!g) { g = make(); geoCache.set(key, g); }
  return g as T;
}

export function shadows<T extends THREE.Object3D>(m: T): T {
  m.traverse(o => { const mm = o as THREE.Mesh; if (mm.isMesh) { mm.castShadow = true; mm.receiveShadow = true; } });
  return m;
}

// ── Canvas textures (floor, cloth, rug, wall art, signage) ───────────────────
const texCache = new Map<string, THREE.CanvasTexture>();
function cachedTex(key: string, make: () => THREE.CanvasTexture): THREE.CanvasTexture {
  let t = texCache.get(key);
  if (!t) { t = make(); texCache.set(key, t); }
  return t;
}

export function woodFloorTexture(): THREE.CanvasTexture {
  return cachedTex('floor', () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 512;
    const c = cv.getContext('2d')!;
    c.fillStyle = P.woodLightCss; c.fillRect(0, 0, 512, 512);
    const plankH = 64;
    for (let row = 0; row < 8; row++) {
      const y = row * plankH;
      const tone = 0.955 + ((row * 37) % 5) * 0.022;
      c.fillStyle = `rgb(${(249 * tone) | 0},${(215 * tone) | 0},${(154 * tone) | 0})`;
      c.fillRect(0, y, 512, plankH - 3);
      c.fillStyle = 'rgba(217,161,94,0.5)'; c.fillRect(0, y + plankH - 3, 512, 3);
      // butt joints, offset per row
      const off = (row % 2) * 128 + 64;
      for (let x = off; x < 512; x += 256) c.fillRect(x, y, 3, plankH - 3);
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.anisotropy = 4;
    return tex;
  });
}

/** Mint-and-white checkerboard for the kitchen zone. */
export function checkerTexture(): THREE.CanvasTexture {
  return cachedTex('checker', () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const c = cv.getContext('2d')!;
    const s = 64;
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      c.fillStyle = (x + y) % 2 ? P.tileACss : P.tileBCss;
      c.fillRect(x * s, y * s, s, s);
    }
    c.strokeStyle = 'rgba(90,58,46,0.06)'; c.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      c.beginPath(); c.moveTo(i * s, 0); c.lineTo(i * s, 256); c.stroke();
      c.beginPath(); c.moveTo(0, i * s); c.lineTo(256, i * s); c.stroke();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
  });
}

/** Round cream pavers for the entrance walkway. */
export function pathTexture(): THREE.CanvasTexture {
  return cachedTex('path', () => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 512;
    const c = cv.getContext('2d')!;
    c.fillStyle = P.pathStoneCss; c.fillRect(0, 0, 256, 512);
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.strokeStyle = 'rgba(217,161,94,0.35)'; c.lineWidth = 4;
    for (let i = 0; i < 5; i++) {
      const y = 52 + i * 100, x = 128 + ((i % 2) ? 28 : -28);
      c.beginPath(); c.ellipse(x, y, 62, 40, 0, 0, 7); c.fill(); c.stroke();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  });
}

/** Scalloped red-and-cream awning stripes. */
export function awningTexture(): THREE.CanvasTexture {
  return cachedTex('awning', () => {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128;
    const c = cv.getContext('2d')!;
    const w = 64;
    for (let i = 0; i < 8; i++) {
      c.fillStyle = i % 2 ? P.awningCreamCss : P.awningRedCss;
      c.fillRect(i * w, 0, w, 96);
      c.beginPath(); c.arc(i * w + w / 2, 96, w / 2, 0, Math.PI); c.fill();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });
}

/** Vertical sky gradient used as the diorama backdrop. */
export function skyTexture(): THREE.CanvasTexture {
  return cachedTex('sky', () => {
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 512;
    const c = cv.getContext('2d')!;
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, P.skyTopCss);
    g.addColorStop(0.62, '#C9EBD9');
    g.addColorStop(1, P.skyBottomCss);
    c.fillStyle = g; c.fillRect(0, 0, 32, 512);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });
}

/** Tiny gliding bird — two soft wing arcs. */
export function birdTexture(): THREE.CanvasTexture {
  return cachedTex('bird', () => {
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 32;
    const c = cv.getContext('2d')!;
    c.strokeStyle = 'rgba(90,58,46,0.8)'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(6, 22); c.quadraticCurveTo(19, 6, 32, 20); c.stroke();
    c.beginPath(); c.moveTo(32, 20); c.quadraticCurveTo(45, 6, 58, 22); c.stroke();
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });
}

/** Soft puffy cloud sprite. */
export function cloudTexture(): THREE.CanvasTexture {
  return cachedTex('cloud', () => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128;
    const c = cv.getContext('2d')!;
    c.fillStyle = 'rgba(255,255,255,0.95)';
    for (const [x, y, r] of [[70, 84, 34], [120, 66, 44], [175, 80, 36], [105, 92, 38], [150, 94, 32]]) {
      c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });
}

/** Red-and-cream gingham for the tablecloths — instantly "restaurant". */
export function ginghamTexture(): THREE.CanvasTexture {
  return cachedTex('gingham', () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const c = cv.getContext('2d')!;
    c.fillStyle = '#FDF6E8'; c.fillRect(0, 0, 256, 256);
    const s = 32;
    c.fillStyle = 'rgba(226,90,74,0.68)';
    for (let x = 0; x < 256; x += s * 2) c.fillRect(x, 0, s, 256);
    for (let y = 0; y < 256; y += s * 2) c.fillRect(0, y, 256, s);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.anisotropy = 4;
    return tex;
  });
}

export function signTexture(text: string, opts: { bg?: string; fg?: string; sub?: string } = {}): THREE.CanvasTexture {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 192;
  const c = cv.getContext('2d')!;
  c.fillStyle = opts.bg ?? '#5A3318';
  const r = 34;
  c.beginPath(); c.roundRect(4, 4, 504, 184, r); c.fill();
  c.strokeStyle = '#F4C25A'; c.lineWidth = 7; c.stroke();
  c.fillStyle = opts.fg ?? '#FFE8B0';
  c.font = `800 80px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(text, 256, opts.sub ? 76 : 96);
  if (opts.sub) { c.font = `700 42px ${FONT}`; c.fillStyle = '#F4C25A'; c.fillText(opts.sub, 256, 146); }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function menuBoardTexture(): THREE.CanvasTexture {
  return cachedTex('menu', () => {
    const cv = document.createElement('canvas'); cv.width = 384; cv.height = 512;
    const c = cv.getContext('2d')!;
    c.fillStyle = '#4A3524'; c.beginPath(); c.roundRect(0, 0, 384, 512, 22); c.fill();
    c.strokeStyle = '#8A5A2A'; c.lineWidth = 14; c.stroke();
    c.fillStyle = '#FFE8B0'; c.font = `800 50px ${FONT}`; c.textAlign = 'center';
    c.fillText('MENU', 192, 70);
    c.strokeStyle = '#F4C25A'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(60, 92); c.lineTo(324, 92); c.stroke();
    const rows = MENU_ITEMS.slice(0, 8).map(m2 => [m2.emoji, '$' + m2.price] as const);
    rows.forEach((rw, i) => {
      const y = 142 + i * 50;
      c.font = '38px serif'; c.textAlign = 'left'; c.fillStyle = '#FFE8B0'; c.fillText(rw[0], 66, y);
      c.font = `700 32px ${FONT}`; c.textAlign = 'right'; c.fillStyle = '#F4C25A'; c.fillText(rw[1], 322, y);
      c.strokeStyle = 'rgba(244,194,90,0.25)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(120, y - 10); c.lineTo(260, y - 10); c.stroke();
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });
}

// ── Dishes ────────────────────────────────────────────────────────────────────
export function plate(): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(G('plate', () => new THREE.CylinderGeometry(0.62, 0.52, 0.07, 36)), M(0xFFFFFF, { roughness: 0.35 })));
  const rim = new THREE.Mesh(G('plateRim', () => new THREE.TorusGeometry(0.56, 0.045, 12, 36)), M(0xF3D9A0));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.04; g.add(rim);
  return g;
}

// Index order matches GameConfig MENU_ITEMS.
export const DISH_EMOJI = MENU_ITEMS.map(m => m.emoji);
// Food gets its own gloss — sauces shine, cheese glistens, people get hungry.
const F = (c: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => M(c, { roughness: 0.42, ...o });
export function buildDish(i: number): THREE.Group {
  const g = new THREE.Group();
  if (i === 0) { // salad
    for (let k = 0; k < 10; k++) {
      const l = new THREE.Mesh(G('leaf', () => new THREE.IcosahedronGeometry(0.15, 0)), F([0x4FA63A, 0x6FBF4A, 0x3E8E2E][k % 3]));
      l.position.set((Math.random() - 0.5) * 0.5, 0.08 + Math.random() * 0.1, (Math.random() - 0.5) * 0.5);
      l.scale.setScalar(0.8 + Math.random() * 0.4); g.add(l);
    }
    const t = new THREE.Mesh(G('tom', () => new THREE.SphereGeometry(0.1, 10, 8)), F(0xE3403F, { roughness: 0.3 })); t.position.set(0.15, 0.12, -0.08); g.add(t);
  } else if (i === 1) { // burger
    const b0 = new THREE.Mesh(G('bunB', () => new THREE.CylinderGeometry(0.36, 0.4, 0.15, 22)), F(0xE3A24E));
    const p = new THREE.Mesh(G('patty', () => new THREE.CylinderGeometry(0.42, 0.42, 0.13, 22)), F(0x6B3B22, { roughness: 0.5 })); p.position.y = 0.13;
    const ch = new THREE.Mesh(G('cheese', () => new THREE.BoxGeometry(0.66, 0.05, 0.66)), F(0xFFC23D, { roughness: 0.32 })); ch.position.y = 0.22; ch.rotation.y = 0.8;
    const bt = new THREE.Mesh(G('bunT', () => new THREE.SphereGeometry(0.44, 22, 14, 0, 6.3, 0, Math.PI / 2)), F(0xF0B45E)); bt.position.y = 0.27; bt.scale.y = 0.7;
    g.add(b0, p, ch, bt);
  } else if (i === 2) { // pasta
    const bowl = new THREE.Mesh(G('bowl', () => new THREE.SphereGeometry(0.46, 22, 12, 0, 6.3, Math.PI / 2, Math.PI / 2)), F(0xE74C3C, { roughness: 0.35 })); bowl.scale.y = 0.6; bowl.position.y = 0.12;
    const n = new THREE.Mesh(G('noodle', () => new THREE.TorusKnotGeometry(0.2, 0.06, 60, 8)), F(0xF2CF6B, { roughness: 0.35 })); n.position.y = 0.2; n.scale.set(1, 0.5, 1);
    const mb = new THREE.Mesh(G('mball', () => new THREE.SphereGeometry(0.12, 12, 10)), F(0x7A3B1E, { roughness: 0.5 })); mb.position.set(0.13, 0.24, 0.06);
    g.add(bowl, n, mb);
  } else if (i === 3) { // sushi
    const rice = new THREE.Mesh(G('rice', () => new THREE.CapsuleGeometry(0.22, 0.3, 6, 12)), F(0xFBF6EC, { roughness: 0.5 })); rice.rotation.z = Math.PI / 2; rice.scale.y = 0.7; rice.position.y = 0.12;
    const fish = new THREE.Mesh(G('fish', () => new THREE.BoxGeometry(0.68, 0.11, 0.36)), F(0xF2784B, { roughness: 0.3 })); fish.position.y = 0.28;
    const band = new THREE.Mesh(G('nori', () => new THREE.BoxGeometry(0.14, 0.3, 0.42)), F(0x2E3A2A, { roughness: 0.55 })); band.position.y = 0.14;
    g.add(rice, fish, band);
  } else if (i === 4) { // pizza
    const slice = new THREE.Mesh(G('pizza', () => {
      const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.8, 0.42); s.lineTo(0.8, -0.42); s.lineTo(0, 0);
      return new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false });
    }), F(0xF2B33B, { roughness: 0.35 })); slice.rotation.x = -Math.PI / 2; slice.position.set(-0.4, 0.12, 0); g.add(slice);
    for (const [x, z] of [[-0.05, 0.05], [0.15, -0.15], [0.2, 0.18]]) {
      const pp = new THREE.Mesh(G('pep', () => new THREE.SphereGeometry(0.06, 8, 6)), F(0xC0392B, { roughness: 0.3 })); pp.position.set(x, 0.2, z); g.add(pp);
    }
  } else if (i === 5) { // cake
    const base = new THREE.Mesh(G('cakeB', () => new THREE.CylinderGeometry(0.34, 0.36, 0.22, 22)), F(0xF7D9E4, { roughness: 0.5 })); base.position.y = 0.11;
    const top = new THREE.Mesh(G('cakeT', () => new THREE.CylinderGeometry(0.24, 0.26, 0.18, 22)), F(0xFBEFF4, { roughness: 0.5 })); top.position.y = 0.3;
    const icing = new THREE.Mesh(G('icing', () => new THREE.TorusGeometry(0.3, 0.05, 10, 22)), F(0xE86A8A, { roughness: 0.3 })); icing.rotation.x = Math.PI / 2; icing.position.y = 0.22;
    const cherry = new THREE.Mesh(G('tom', () => new THREE.SphereGeometry(0.1, 10, 8)), F(0xD82E4E, { roughness: 0.25 })); cherry.position.y = 0.44;
    g.add(base, top, icing, cherry);
  } else if (i === 6) { // ramen
    const bowl = new THREE.Mesh(G('rbowl', () => new THREE.SphereGeometry(0.44, 22, 12, 0, 6.3, Math.PI / 2, Math.PI / 2)), F(0x3FA7A0, { roughness: 0.35 })); bowl.scale.y = 0.68; bowl.position.y = 0.14;
    const broth = new THREE.Mesh(G('broth', () => new THREE.CylinderGeometry(0.38, 0.38, 0.04, 22)), F(0xF2CF6B, { roughness: 0.25 })); broth.position.y = 0.24;
    const eggW = new THREE.Mesh(G('eggW', () => new THREE.SphereGeometry(0.11, 12, 10)), F(0xFBF6EC, { roughness: 0.45 })); eggW.position.set(0.16, 0.28, 0.05); eggW.scale.y = 0.6;
    const eggY = new THREE.Mesh(G('eggY', () => new THREE.SphereGeometry(0.055, 10, 8)), F(0xF5B83D, { roughness: 0.35 })); eggY.position.set(0.16, 0.31, 0.05); eggY.scale.y = 0.55;
    const nori = new THREE.Mesh(G('rnori', () => new THREE.BoxGeometry(0.16, 0.14, 0.02)), F(0x2E3A2A, { roughness: 0.55 })); nori.position.set(-0.2, 0.32, -0.08); nori.rotation.y = 0.5;
    const stick1 = new THREE.Mesh(G('stick', () => new THREE.CylinderGeometry(0.014, 0.02, 0.72, 6)), F(0xC98B4E)); stick1.position.set(-0.24, 0.4, 0.14); stick1.rotation.z = 1.05; stick1.rotation.y = 0.4;
    const stick2 = stick1.clone(); stick2.position.z = 0.22; stick2.rotation.y = 0.2;
    g.add(bowl, broth, eggW, eggY, nori, stick1, stick2);
  } else { // steak
    const meat = new THREE.Mesh(G('steak', () => new THREE.CapsuleGeometry(0.2, 0.42, 6, 14)), F(0x8A4A2A, { roughness: 0.45 }));
    meat.rotation.z = Math.PI / 2; meat.rotation.y = 0.4; meat.scale.set(1, 1.4, 1); meat.position.y = 0.14;
    g.add(meat);
    for (let k = 0; k < 3; k++) {
      const mark = new THREE.Mesh(G('gmark', () => new THREE.BoxGeometry(0.05, 0.015, 0.4)), F(0x4A2412, { roughness: 0.7 }));
      mark.position.set(-0.18 + k * 0.18, 0.285, 0); mark.rotation.y = 0.4; g.add(mark);
    }
    const butter = new THREE.Mesh(G('butter', () => new THREE.BoxGeometry(0.11, 0.08, 0.11)), F(0xFFE08A, { roughness: 0.25 })); butter.position.set(0.02, 0.33, 0.02); butter.rotation.y = 0.3;
    const herb = new THREE.Mesh(G('herb', () => new THREE.IcosahedronGeometry(0.07, 0)), F(0x4FA63A)); herb.position.set(0.3, 0.12, 0.22);
    g.add(butter, herb);
  }
  return g;
}

// ── Characters ────────────────────────────────────────────────────────────────
export interface Chibi {
  g: THREE.Group;
  armL: THREE.Group; armR: THREE.Group;
  head: THREE.Group;
  feet: THREE.Mesh[];
  eyes: THREE.Group[];
}

/** Occasional natural blinks. Call once per frame with performance.now(). */
export function tickBlink(c: Chibi, now: number) {
  const ud = c.g.userData as { nextBlink?: number };
  if (ud.nextBlink === undefined) ud.nextBlink = now + 1200 + Math.random() * 3400;
  const t = now - ud.nextBlink;
  if (t < 0) return;
  if (t > 150) {
    ud.nextBlink = now + 1800 + Math.random() * 3600;
    for (const e of c.eyes) e.scale.y = 1;
    return;
  }
  const f = Math.sin((t / 150) * Math.PI);
  for (const e of c.eyes) e.scale.y = Math.max(0.08, 1 - f);
}
export interface ChibiOpts {
  skin: number; outfit: number; hair: number;
  accessory?: Accessory; waiter?: boolean; chef?: boolean;
}

export function chibi(o: ChibiOpts): Chibi {
  const g = new THREE.Group();
  const bodyColor = o.chef ? 0xF5F2EA : o.outfit;
  const darker = new THREE.Color(bodyColor).multiplyScalar(0.78).getHex();
  // rounded egg body — friendlier than a capsule, reads from any angle
  const body = new THREE.Mesh(G('bodyEgg', () => new THREE.SphereGeometry(0.42, 20, 16)), M(bodyColor));
  body.position.y = 0.64; body.scale.set(1, 1.06, 0.92); g.add(body);
  const skirt = new THREE.Mesh(G('bodySkirt', () => new THREE.SphereGeometry(0.42, 20, 10, 0, 6.3, Math.PI * 0.62, Math.PI * 0.38)), M(darker));
  skirt.position.y = 0.645; skirt.scale.set(1.01, 1.06, 0.93); g.add(skirt);

  // arms — pivot groups at the shoulders so they can swing / carry / stir
  const mkArm = (side: number) => {
    const pivot = new THREE.Group(); pivot.position.set(side * 0.36, 0.88, 0);
    const arm = new THREE.Mesh(G('arm', () => new THREE.CapsuleGeometry(0.085, 0.26, 4, 10)), M(bodyColor));
    arm.position.y = -0.18; pivot.add(arm);
    const hand = new THREE.Mesh(G('hand', () => new THREE.SphereGeometry(0.095, 10, 8)), M(o.skin, { roughness: 0.55 }));
    hand.position.y = -0.36; pivot.add(hand);
    pivot.rotation.z = side * -0.35;
    g.add(pivot); return pivot;
  };
  const armL = mkArm(-1), armR = mkArm(1);

  if (o.waiter) {
    const shirt = new THREE.Mesh(G('shirt', () => new THREE.BoxGeometry(0.2, 0.4, 0.1)), M(0xFDFDFD)); shirt.position.set(0, 0.72, 0.33); g.add(shirt);
    const bow = new THREE.Mesh(G('bow', () => new THREE.BoxGeometry(0.18, 0.08, 0.06)), M(0xE23B3B)); bow.position.set(0, 0.9, 0.35); g.add(bow);
    const apron = new THREE.Mesh(G('apron', () => new THREE.CylinderGeometry(0.24, 0.21, 0.05, 18)), M(0xF3E5CC, { roughness: 0.9 }));
    apron.rotation.x = Math.PI / 2; apron.position.set(0, 0.36, 0.34); apron.scale.y = 0.9; g.add(apron);
    for (const bx of [-0.08, 0.08]) {
      const btn = new THREE.Mesh(G('btn', () => new THREE.SphereGeometry(0.025, 8, 6)), M(0xC9A227, { metalness: 0.5, roughness: 0.35 }));
      btn.position.set(bx, 0.58, 0.38); g.add(btn);
    }
  }
  if (o.chef) {
    // coral apron, waist tie and neckerchief — the chef pops from every angle
    const apron = new THREE.Mesh(G('chefApron', () => new THREE.BoxGeometry(0.46, 0.4, 0.05)), M(P.wallCoral, { roughness: 0.85 }));
    apron.position.set(0, 0.5, 0.36); g.add(apron);
    const tie = new THREE.Mesh(G('chefTie', () => new THREE.TorusGeometry(0.4, 0.05, 8, 20)), M(P.wallCoral, { roughness: 0.85 }));
    tie.rotation.x = Math.PI / 2; tie.position.y = 0.62; tie.scale.set(1, 0.92, 1); g.add(tie);
    const scarf = new THREE.Mesh(G('chefScarf', () => new THREE.BoxGeometry(0.24, 0.1, 0.08)), M(P.danger, { roughness: 0.7 }));
    scarf.position.set(0, 0.88, 0.34); g.add(scarf);
  }

  // the head is the character: big, round, expressive
  const head = new THREE.Group(); head.position.y = 1.34; g.add(head);
  const skull = new THREE.Mesh(G('skull', () => new THREE.SphereGeometry(0.46, 26, 18)), M(o.skin, { roughness: 0.55 })); head.add(skull);

  if (o.chef) {
    const toque = new THREE.Mesh(G('toque', () => new THREE.CylinderGeometry(0.32, 0.36, 0.42, 18)), M(0xFDFDFD, { roughness: 0.85 })); toque.position.y = 0.52; head.add(toque);
    for (const [px, py] of [[-0.13, 0.75], [0.13, 0.75], [0, 0.81]] as const) {
      const puff = new THREE.Mesh(G('puff', () => new THREE.SphereGeometry(0.17, 12, 10)), M(0xFDFDFD, { roughness: 0.85 })); puff.position.set(px, py, 0); head.add(puff);
    }
  } else if (o.accessory === 'cap') {
    const cap = new THREE.Mesh(G('cap', () => new THREE.SphereGeometry(0.48, 20, 12, 0, 6.3, 0, Math.PI * 0.5)), M(0xD84438)); cap.position.y = 0.05; head.add(cap);
    const brim = new THREE.Mesh(G('brim', () => new THREE.CylinderGeometry(0.32, 0.34, 0.05, 16, 1, false, 0, Math.PI)), M(0xD84438)); brim.position.set(0, 0.11, 0.34); head.add(brim);
  } else {
    const hair = new THREE.Mesh(G('hair', () => new THREE.SphereGeometry(0.48, 24, 16, 0, 6.3, 0, Math.PI * 0.58)), M(o.hair)); hair.position.y = 0.03; head.add(hair);
  }

  // the face sits proud of the hair shell so it reads at any camera angle
  const face = new THREE.Mesh(G('face', () => new THREE.SphereGeometry(0.4, 22, 16)), M(o.skin, { roughness: 0.55 }));
  face.position.set(0, -0.04, 0.13); head.add(face);
  // real eyes: white sclera, dark pupil, sparkle highlight, a brow.
  // Each eye lives in its own group so blinks can squash it shut.
  const eyes: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const eye = new THREE.Group(); eye.position.set(sx * 0.16, 0.05, 0.42); head.add(eye); eyes.push(eye);
    const sclera = new THREE.Mesh(G('sclera', () => new THREE.SphereGeometry(0.105, 14, 12)), M(0xFFFFFF, { roughness: 0.25 }));
    sclera.scale.set(1, 1.3, 0.55); eye.add(sclera);
    const pupil = new THREE.Mesh(G('pupil', () => new THREE.SphereGeometry(0.052, 12, 10)), M(0x33221A, { roughness: 0.25 }));
    pupil.position.set(0, -0.01, 0.07); pupil.scale.set(1, 1.25, 0.5); eye.add(pupil);
    const spark = new THREE.Mesh(G('spark', () => new THREE.SphereGeometry(0.02, 8, 6)), M(0xFFFFFF, { roughness: 0.2 }));
    spark.position.set(0.028, 0.035, 0.1); eye.add(spark);
    const brow = new THREE.Mesh(G('brow', () => new THREE.BoxGeometry(0.13, 0.032, 0.03)), M(o.chef ? 0x8A6A52 : o.hair));
    brow.position.set(sx * 0.16, 0.235, 0.415); brow.rotation.z = sx * -0.12; brow.rotation.x = -0.3; head.add(brow);
    const cheek = new THREE.Mesh(G('cheek', () => new THREE.SphereGeometry(0.07, 10, 8)), M(0xFF9E9E, { transparent: true, opacity: 0.55 }));
    cheek.position.set(sx * 0.26, -0.11, 0.36); head.add(cheek);
  }
  // a little smile — half-torus hugging the face
  const smile = new THREE.Mesh(G('smile', () => new THREE.TorusGeometry(0.11, 0.02, 6, 12, Math.PI)), M(0x8A4A32, { roughness: 0.6 }));
  smile.position.set(0, -0.13, 0.44); smile.rotation.z = Math.PI; smile.rotation.x = -0.28; smile.scale.y = 0.7;
  head.add(smile);

  // accessories
  if (o.accessory === 'glasses') {
    for (const sx of [-1, 1]) {
      const lens = new THREE.Mesh(G('lens', () => new THREE.TorusGeometry(0.105, 0.018, 8, 16)), M(0x333333, { metalness: 0.3 }));
      lens.position.set(sx * 0.16, 0.05, 0.5); head.add(lens);
    }
    const bridge = new THREE.Mesh(G('bridge', () => new THREE.BoxGeometry(0.12, 0.02, 0.02)), M(0x333333)); bridge.position.set(0, 0.05, 0.51); head.add(bridge);
  } else if (o.accessory === 'sunglasses') {
    const shade = new THREE.Mesh(G('shade', () => new THREE.BoxGeometry(0.46, 0.12, 0.05)), M(0x14161C, { roughness: 0.25 })); shade.position.set(0, 0.06, 0.49); head.add(shade);
  } else if (o.accessory === 'flower') {
    const fl = new THREE.Group(); fl.position.set(0.31, 0.29, 0.19);
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(G('petal', () => new THREE.SphereGeometry(0.055, 8, 6)), M(0xF7A8C4));
      petal.position.set(Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0); fl.add(petal);
    }
    const core = new THREE.Mesh(G('flcore', () => new THREE.SphereGeometry(0.045, 8, 6)), M(0xFFC94A)); fl.add(core);
    head.add(fl);
  } else if (o.accessory === 'bow') {
    const bw = new THREE.Group(); bw.position.set(-0.29, 0.31, 0.12); bw.rotation.z = 0.5;
    const l = new THREE.Mesh(G('bowL', () => new THREE.ConeGeometry(0.07, 0.14, 8)), M(0xE86A8A)); l.rotation.z = Math.PI / 2; l.position.x = -0.08;
    const r = new THREE.Mesh(G('bowL', () => new THREE.ConeGeometry(0.07, 0.14, 8)), M(0xE86A8A)); r.rotation.z = -Math.PI / 2; r.position.x = 0.08;
    const knot = new THREE.Mesh(G('bowK', () => new THREE.SphereGeometry(0.045, 8, 6)), M(0xD84468)); bw.add(l, r, knot);
    head.add(bw);
  }

  const feet: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const foot = new THREE.Mesh(G('foot', () => new THREE.SphereGeometry(0.135, 10, 8)), M(0x3a3f4a));
    foot.position.set(sx * 0.15, 0.12, 0.05); foot.scale.set(1, 0.7, 1.3); g.add(foot); feet.push(foot);
  }
  shadows(g);
  return { g, armL, armR, head, feet, eyes };
}

// Poses
export function poseSit(c: Chibi) {
  c.feet.forEach(f => { f.visible = false; });
  c.armL.rotation.set(-0.9, 0, -0.2); c.armR.rotation.set(-0.9, 0, 0.2); // hands on the table
}
export function poseStand(c: Chibi) {
  c.feet.forEach(f => { f.visible = true; });
  c.armL.rotation.set(0, 0, -0.35); c.armR.rotation.set(0, 0, 0.35);
}
export function poseCarry(c: Chibi) {
  c.armL.rotation.set(-1.25, 0, -0.12); c.armR.rotation.set(-1.25, 0, 0.12); // both arms forward under a tray
}

// ── Bubbles & floating text ───────────────────────────────────────────────────
export interface Bubble {
  spr: THREE.Sprite;
  draw: (emoji: string, frac: number, ring: number) => void;
  drawHearts: (emoji: string, hearts01: number) => void;
  dispose: () => void;
}
function rrect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function heart(c: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string) {
  c.fillStyle = fill;
  c.beginPath();
  c.moveTo(x, y + s * 0.35);
  c.bezierCurveTo(x, y, x - s * 0.5, y - s * 0.15, x - s * 0.5, y + s * 0.18);
  c.bezierCurveTo(x - s * 0.5, y + s * 0.5, x - s * 0.12, y + s * 0.72, x, y + s * 0.95);
  c.bezierCurveTo(x + s * 0.12, y + s * 0.72, x + s * 0.5, y + s * 0.5, x + s * 0.5, y + s * 0.18);
  c.bezierCurveTo(x + s * 0.5, y - s * 0.15, x, y, x, y + s * 0.35);
  c.closePath(); c.fill();
}
export function makeBubble(): Bubble {
  const cv = document.createElement('canvas'); cv.width = cv.height = 160;
  const ctx = cv.getContext('2d')!;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(1.32, 1.32, 1); spr.renderOrder = 999;
  function shell(borderCol: string) {
    ctx.clearRect(0, 0, 160, 160);
    ctx.fillStyle = 'rgba(0,0,0,0.16)'; rrect(ctx, 24, 22, 112, 96, 26); ctx.fill();
    ctx.fillStyle = '#FFF8EE'; rrect(ctx, 20, 18, 112, 96, 26); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = borderCol; ctx.stroke();
    ctx.fillStyle = '#FFF8EE'; ctx.beginPath(); ctx.moveTo(60, 110); ctx.lineTo(92, 110); ctx.lineTo(76, 138); ctx.closePath(); ctx.fill();
  }
  function draw(emoji: string, frac: number, ring: number) {
    const col = ring < 0.3 ? '#E8442C' : ring < 0.6 ? '#FF9E1B' : '#5BBF4A';
    shell(col);
    ctx.beginPath(); ctx.lineWidth = 9; ctx.strokeStyle = col;
    ctx.arc(76, 66, 56, -Math.PI / 2, -Math.PI / 2 + Math.max(0.001, frac) * Math.PI * 2); ctx.stroke();
    ctx.font = '54px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(emoji, 76, 64);
    tex.needsUpdate = true;
  }
  // Diner-Dash patience: a row of five hearts under the request
  function drawHearts(emoji: string, hearts01: number) {
    const col = hearts01 < 0.3 ? '#E8442C' : hearts01 < 0.6 ? '#FF9E1B' : '#5BBF4A';
    shell(col);
    ctx.font = '44px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(emoji, 76, 52);
    const hearts = hearts01 * 5;
    for (let i = 0; i < 5; i++) {
      const fillFrac = Math.max(0, Math.min(1, hearts - i));
      const x = 40 + i * 19, y = 82;
      heart(ctx, x, y, 15, '#E4D7C4');
      if (fillFrac > 0.05) heart(ctx, x, y, 15 * (0.55 + 0.45 * fillFrac), fillFrac >= 1 ? '#E8442C' : '#F08A6A');
    }
    tex.needsUpdate = true;
  }
  return { spr, draw, drawHearts, dispose: () => { mat.dispose(); tex.dispose(); } };
}

/** Small numbered badge (table numbers on tables and on ready plates). */
export function numberSprite(n: number, bg = '#B33A22'): THREE.Sprite {
  const cv = document.createElement('canvas'); cv.width = cv.height = 96;
  const c = cv.getContext('2d')!;
  c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.arc(50, 52, 40, 0, 7); c.fill();
  c.fillStyle = bg; c.beginPath(); c.arc(48, 48, 40, 0, 7); c.fill();
  c.lineWidth = 6; c.strokeStyle = '#FFF3D8'; c.stroke();
  c.fillStyle = '#FFF3D8'; c.font = `800 46px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(String(n), 48, 52);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  spr.scale.set(0.55, 0.55, 1); spr.renderOrder = 998;
  return spr;
}

export function floatSprite(txt: string, color = '#FFE27A', stroke = '#5A3A2E'): THREE.Sprite {
  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 90; const ctx = cv.getContext('2d')!;
  ctx.font = `800 54px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 9; ctx.strokeStyle = stroke; ctx.strokeText(txt, 160, 46);
  ctx.fillStyle = color; ctx.fillText(txt, 160, 46);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  spr.scale.set(2.6, 0.73, 1); spr.renderOrder = 1000;
  return spr;
}

// Soft radial blob texture shared by steam / poof particles
let blobTex: THREE.CanvasTexture | null = null;
export function steamTexture(): THREE.CanvasTexture {
  if (blobTex) return blobTex;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const c = cv.getContext('2d')!;
  const grad = c.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = grad; c.fillRect(0, 0, 64, 64);
  blobTex = new THREE.CanvasTexture(cv);
  return blobTex;
}
