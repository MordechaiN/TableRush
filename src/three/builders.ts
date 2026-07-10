import * as THREE from 'three';
import { Accessory, MENU_ITEMS } from '../config/GameConfig';

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
    c.fillStyle = '#F0CE96'; c.fillRect(0, 0, 512, 512);
    const plankH = 64;
    for (let row = 0; row < 8; row++) {
      const y = row * plankH;
      const tone = 0.94 + ((row * 37) % 5) * 0.028;
      c.fillStyle = `rgb(${(242 * tone) | 0},${(208 * tone) | 0},${(150 * tone) | 0})`;
      c.fillRect(0, y, 512, plankH - 3);
      c.fillStyle = 'rgba(165,115,60,0.45)'; c.fillRect(0, y + plankH - 3, 512, 3);
      // butt joints, offset per row
      const off = (row % 2) * 128 + 64;
      for (let x = off; x < 512; x += 256) c.fillRect(x, y, 3, plankH - 3);
      // grain
      c.strokeStyle = 'rgba(175,125,65,0.16)'; c.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        c.beginPath();
        const gy = y + 10 + i * 11 + ((row * 13 + i * 7) % 6);
        c.moveTo(0, gy); c.bezierCurveTo(140, gy + 3, 340, gy - 3, 512, gy + 2); c.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 5);
    tex.anisotropy = 4;
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
    c.fillStyle = 'rgba(226,90,74,0.55)';
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

/** Cozy dining-room rug: cream field, terracotta border, stitched dots. */
export function rugTexture(): THREE.CanvasTexture {
  return cachedTex('rug', () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 512;
    const c = cv.getContext('2d')!;
    const cx = 256, cy = 256;
    c.fillStyle = '#E2725B'; c.beginPath(); c.arc(cx, cy, 254, 0, 7); c.fill();
    c.fillStyle = '#F6E3C2'; c.beginPath(); c.arc(cx, cy, 224, 0, 7); c.fill();
    c.strokeStyle = 'rgba(226,114,91,0.7)'; c.lineWidth = 5;
    c.setLineDash([14, 12]);
    c.beginPath(); c.arc(cx, cy, 208, 0, 7); c.stroke();
    c.setLineDash([]);
    c.fillStyle = 'rgba(226,114,91,0.35)';
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      c.beginPath(); c.arc(cx + Math.cos(a) * 165, cy + Math.sin(a) * 165, 7, 0, 7); c.fill();
    }
    c.fillStyle = 'rgba(226,114,91,0.22)';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.26;
      c.beginPath(); c.arc(cx + Math.cos(a) * 95, cy + Math.sin(a) * 95, 9, 0, 7); c.fill();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
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

/** Framed café wall art: an emoji doodle on a cream mat. */
export function wallArtTexture(emoji: string, frame: string): THREE.CanvasTexture {
  return cachedTex('art' + emoji, () => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 300;
    const c = cv.getContext('2d')!;
    c.fillStyle = frame; c.beginPath(); c.roundRect(0, 0, 256, 300, 14); c.fill();
    c.fillStyle = '#FBF3E2'; c.beginPath(); c.roundRect(20, 20, 216, 260, 6); c.fill();
    c.font = '110px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(emoji, 128, 138);
    c.strokeStyle = 'rgba(150,100,50,0.4)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(64, 226); c.lineTo(192, 226); c.stroke();
    c.beginPath(); c.moveTo(88, 244); c.lineTo(168, 244); c.stroke();
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });
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
export function buildDish(i: number): THREE.Group {
  const g = new THREE.Group();
  if (i === 0) { // salad
    for (let k = 0; k < 10; k++) {
      const l = new THREE.Mesh(G('leaf', () => new THREE.IcosahedronGeometry(0.15, 0)), M([0x4FA63A, 0x6FBF4A, 0x3E8E2E][k % 3]));
      l.position.set((Math.random() - 0.5) * 0.5, 0.08 + Math.random() * 0.1, (Math.random() - 0.5) * 0.5);
      l.scale.setScalar(0.8 + Math.random() * 0.4); g.add(l);
    }
    const t = new THREE.Mesh(G('tom', () => new THREE.SphereGeometry(0.1, 10, 8)), M(0xE3403F)); t.position.set(0.15, 0.12, -0.08); g.add(t);
  } else if (i === 1) { // burger
    const b0 = new THREE.Mesh(G('bunB', () => new THREE.CylinderGeometry(0.36, 0.4, 0.15, 22)), M(0xE3A24E));
    const p = new THREE.Mesh(G('patty', () => new THREE.CylinderGeometry(0.42, 0.42, 0.13, 22)), M(0x6B3B22)); p.position.y = 0.13;
    const ch = new THREE.Mesh(G('cheese', () => new THREE.BoxGeometry(0.66, 0.05, 0.66)), M(0xFFC23D)); ch.position.y = 0.22; ch.rotation.y = 0.8;
    const bt = new THREE.Mesh(G('bunT', () => new THREE.SphereGeometry(0.44, 22, 14, 0, 6.3, 0, Math.PI / 2)), M(0xF0B45E)); bt.position.y = 0.27; bt.scale.y = 0.7;
    g.add(b0, p, ch, bt);
  } else if (i === 2) { // pasta
    const bowl = new THREE.Mesh(G('bowl', () => new THREE.SphereGeometry(0.46, 22, 12, 0, 6.3, Math.PI / 2, Math.PI / 2)), M(0xE74C3C, { roughness: 0.35 })); bowl.scale.y = 0.6; bowl.position.y = 0.12;
    const n = new THREE.Mesh(G('noodle', () => new THREE.TorusKnotGeometry(0.2, 0.06, 60, 8)), M(0xF2CF6B)); n.position.y = 0.2; n.scale.set(1, 0.5, 1);
    const mb = new THREE.Mesh(G('mball', () => new THREE.SphereGeometry(0.12, 12, 10)), M(0x7A3B1E)); mb.position.set(0.13, 0.24, 0.06);
    g.add(bowl, n, mb);
  } else if (i === 3) { // sushi
    const rice = new THREE.Mesh(G('rice', () => new THREE.CapsuleGeometry(0.22, 0.3, 6, 12)), M(0xFBF6EC, { roughness: 0.5 })); rice.rotation.z = Math.PI / 2; rice.scale.y = 0.7; rice.position.y = 0.12;
    const fish = new THREE.Mesh(G('fish', () => new THREE.BoxGeometry(0.68, 0.11, 0.36)), M(0xF2784B, { roughness: 0.4 })); fish.position.y = 0.28;
    const band = new THREE.Mesh(G('nori', () => new THREE.BoxGeometry(0.14, 0.3, 0.42)), M(0x2E3A2A)); band.position.y = 0.14;
    g.add(rice, fish, band);
  } else if (i === 4) { // pizza
    const slice = new THREE.Mesh(G('pizza', () => {
      const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.8, 0.42); s.lineTo(0.8, -0.42); s.lineTo(0, 0);
      return new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false });
    }), M(0xF2B33B)); slice.rotation.x = -Math.PI / 2; slice.position.set(-0.4, 0.12, 0); g.add(slice);
    for (const [x, z] of [[-0.05, 0.05], [0.15, -0.15], [0.2, 0.18]]) {
      const pp = new THREE.Mesh(G('pep', () => new THREE.SphereGeometry(0.06, 8, 6)), M(0xC0392B)); pp.position.set(x, 0.2, z); g.add(pp);
    }
  } else if (i === 5) { // cake
    const base = new THREE.Mesh(G('cakeB', () => new THREE.CylinderGeometry(0.34, 0.36, 0.22, 22)), M(0xF7D9E4, { roughness: 0.5 })); base.position.y = 0.11;
    const top = new THREE.Mesh(G('cakeT', () => new THREE.CylinderGeometry(0.24, 0.26, 0.18, 22)), M(0xFBEFF4, { roughness: 0.5 })); top.position.y = 0.3;
    const icing = new THREE.Mesh(G('icing', () => new THREE.TorusGeometry(0.3, 0.05, 10, 22)), M(0xE86A8A)); icing.rotation.x = Math.PI / 2; icing.position.y = 0.22;
    const cherry = new THREE.Mesh(G('tom', () => new THREE.SphereGeometry(0.1, 10, 8)), M(0xD82E4E, { roughness: 0.3 })); cherry.position.y = 0.44;
    g.add(base, top, icing, cherry);
  } else if (i === 6) { // ramen
    const bowl = new THREE.Mesh(G('rbowl', () => new THREE.SphereGeometry(0.44, 22, 12, 0, 6.3, Math.PI / 2, Math.PI / 2)), M(0x3FA7A0, { roughness: 0.35 })); bowl.scale.y = 0.68; bowl.position.y = 0.14;
    const broth = new THREE.Mesh(G('broth', () => new THREE.CylinderGeometry(0.38, 0.38, 0.04, 22)), M(0xF2CF6B, { roughness: 0.4 })); broth.position.y = 0.24;
    const eggW = new THREE.Mesh(G('eggW', () => new THREE.SphereGeometry(0.11, 12, 10)), M(0xFBF6EC, { roughness: 0.5 })); eggW.position.set(0.16, 0.28, 0.05); eggW.scale.y = 0.6;
    const eggY = new THREE.Mesh(G('eggY', () => new THREE.SphereGeometry(0.055, 10, 8)), M(0xF5B83D, { roughness: 0.45 })); eggY.position.set(0.16, 0.31, 0.05); eggY.scale.y = 0.55;
    const nori = new THREE.Mesh(G('rnori', () => new THREE.BoxGeometry(0.16, 0.14, 0.02)), M(0x2E3A2A)); nori.position.set(-0.2, 0.32, -0.08); nori.rotation.y = 0.5;
    const stick1 = new THREE.Mesh(G('stick', () => new THREE.CylinderGeometry(0.014, 0.02, 0.72, 6)), M(0xC98B4E)); stick1.position.set(-0.24, 0.4, 0.14); stick1.rotation.z = 1.05; stick1.rotation.y = 0.4;
    const stick2 = stick1.clone(); stick2.position.z = 0.22; stick2.rotation.y = 0.2;
    g.add(bowl, broth, eggW, eggY, nori, stick1, stick2);
  } else { // steak
    const meat = new THREE.Mesh(G('steak', () => new THREE.CapsuleGeometry(0.2, 0.42, 6, 14)), M(0x8A4A2A, { roughness: 0.6 }));
    meat.rotation.z = Math.PI / 2; meat.rotation.y = 0.4; meat.scale.set(1, 1.4, 1); meat.position.y = 0.14;
    g.add(meat);
    for (let k = 0; k < 3; k++) {
      const mark = new THREE.Mesh(G('gmark', () => new THREE.BoxGeometry(0.05, 0.015, 0.4)), M(0x4A2412, { roughness: 0.8 }));
      mark.position.set(-0.18 + k * 0.18, 0.285, 0); mark.rotation.y = 0.4; g.add(mark);
    }
    const butter = new THREE.Mesh(G('butter', () => new THREE.BoxGeometry(0.11, 0.08, 0.11)), M(0xFFE08A, { roughness: 0.35 })); butter.position.set(0.02, 0.33, 0.02); butter.rotation.y = 0.3;
    const herb = new THREE.Mesh(G('herb', () => new THREE.IcosahedronGeometry(0.07, 0)), M(0x4FA63A)); herb.position.set(0.3, 0.12, 0.22);
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
}
export interface ChibiOpts {
  skin: number; outfit: number; hair: number;
  accessory?: Accessory; waiter?: boolean; chef?: boolean;
}

export function chibi(o: ChibiOpts): Chibi {
  const g = new THREE.Group();
  const bodyColor = o.chef ? 0xF5F2EA : o.outfit;
  // Taller, wider body so characters read even from the steep portrait camera.
  const body = new THREE.Mesh(G('body', () => new THREE.CapsuleGeometry(0.34, 0.4, 6, 16)), M(bodyColor));
  body.position.y = 0.66; g.add(body);

  // arms — pivot groups at the shoulders so they can swing / carry / stir
  const mkArm = (side: number) => {
    const pivot = new THREE.Group(); pivot.position.set(side * 0.32, 0.9, 0);
    const arm = new THREE.Mesh(G('arm', () => new THREE.CapsuleGeometry(0.085, 0.26, 4, 10)), M(bodyColor));
    arm.position.y = -0.18; pivot.add(arm);
    const hand = new THREE.Mesh(G('hand', () => new THREE.SphereGeometry(0.09, 10, 8)), M(o.skin, { roughness: 0.55 }));
    hand.position.y = -0.36; pivot.add(hand);
    pivot.rotation.z = side * -0.35;
    g.add(pivot); return pivot;
  };
  const armL = mkArm(-1), armR = mkArm(1);

  if (o.waiter) {
    const shirt = new THREE.Mesh(G('shirt', () => new THREE.BoxGeometry(0.2, 0.42, 0.1)), M(0xFDFDFD)); shirt.position.set(0, 0.74, 0.31); g.add(shirt);
    const bow = new THREE.Mesh(G('bow', () => new THREE.BoxGeometry(0.18, 0.08, 0.06)), M(0xE23B3B)); bow.position.set(0, 0.94, 0.34); g.add(bow);
    const apron = new THREE.Mesh(G('apron', () => new THREE.BoxGeometry(0.42, 0.3, 0.05)), M(0xF3E5CC, { roughness: 0.9 })); apron.position.set(0, 0.4, 0.33); g.add(apron);
    for (const bx of [-0.08, 0.08]) {
      const btn = new THREE.Mesh(G('btn', () => new THREE.SphereGeometry(0.025, 8, 6)), M(0xC9A227, { metalness: 0.5, roughness: 0.35 }));
      btn.position.set(bx, 0.6, 0.36); g.add(btn);
    }
  }

  // head group (so emotions can tilt it) — slightly smaller than before so
  // bodies stay visible from above
  const head = new THREE.Group(); head.position.y = 1.32; g.add(head);
  const skull = new THREE.Mesh(G('skull', () => new THREE.SphereGeometry(0.41, 26, 18)), M(o.skin, { roughness: 0.55 })); head.add(skull);

  if (o.chef) {
    const toque = new THREE.Mesh(G('toque', () => new THREE.CylinderGeometry(0.29, 0.33, 0.4, 18)), M(0xFDFDFD, { roughness: 0.85 })); toque.position.y = 0.46; head.add(toque);
    for (const [px, py] of [[-0.12, 0.68], [0.12, 0.68], [0, 0.74]] as const) {
      const puff = new THREE.Mesh(G('puff', () => new THREE.SphereGeometry(0.16, 12, 10)), M(0xFDFDFD, { roughness: 0.85 })); puff.position.set(px, py, 0); head.add(puff);
    }
  } else if (o.accessory === 'cap') {
    const cap = new THREE.Mesh(G('cap', () => new THREE.SphereGeometry(0.43, 20, 12, 0, 6.3, 0, Math.PI * 0.5)), M(0xD84438)); cap.position.y = 0.05; head.add(cap);
    const brim = new THREE.Mesh(G('brim', () => new THREE.CylinderGeometry(0.28, 0.3, 0.05, 16, 1, false, 0, Math.PI)), M(0xD84438)); brim.position.set(0, 0.1, 0.3); head.add(brim);
  } else {
    const hair = new THREE.Mesh(G('hair', () => new THREE.SphereGeometry(0.43, 24, 16, 0, 6.3, 0, Math.PI * 0.6)), M(o.hair)); hair.position.y = 0.03; head.add(hair);
  }

  // the face sits proud of the hair shell so it reads at any camera angle
  const face = new THREE.Mesh(G('face', () => new THREE.SphereGeometry(0.36, 22, 16)), M(o.skin, { roughness: 0.55 }));
  face.position.set(0, -0.03, 0.12); head.add(face);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(G('eye', () => new THREE.SphereGeometry(0.07, 12, 10)), M(0x241a12)); eye.position.set(sx * 0.15, 0.03, 0.4); head.add(eye);
    const w = new THREE.Mesh(G('eyeW', () => new THREE.SphereGeometry(0.026, 8, 6)), M(0xffffff, { roughness: 0.3 })); w.position.set(sx * 0.15 + 0.03, 0.06, 0.45); head.add(w);
    const cheek = new THREE.Mesh(G('cheek', () => new THREE.SphereGeometry(0.065, 10, 8)), M(0xFF8A8A, { transparent: true, opacity: 0.5 })); cheek.position.set(sx * 0.22, -0.09, 0.36); head.add(cheek);
  }
  // a little smile — half-torus hugging the face
  const smile = new THREE.Mesh(G('smile', () => new THREE.TorusGeometry(0.1, 0.018, 6, 12, Math.PI)), M(0x8A4A32, { roughness: 0.6 }));
  smile.position.set(0, -0.12, 0.4); smile.rotation.z = Math.PI; smile.rotation.x = -0.25; smile.scale.y = 0.65;
  head.add(smile);

  // accessories
  if (o.accessory === 'glasses') {
    for (const sx of [-1, 1]) {
      const lens = new THREE.Mesh(G('lens', () => new THREE.TorusGeometry(0.09, 0.018, 8, 16)), M(0x333333, { metalness: 0.3 }));
      lens.position.set(sx * 0.15, 0.03, 0.45); head.add(lens);
    }
    const bridge = new THREE.Mesh(G('bridge', () => new THREE.BoxGeometry(0.12, 0.02, 0.02)), M(0x333333)); bridge.position.set(0, 0.03, 0.46); head.add(bridge);
  } else if (o.accessory === 'sunglasses') {
    const shade = new THREE.Mesh(G('shade', () => new THREE.BoxGeometry(0.42, 0.11, 0.05)), M(0x14161C, { roughness: 0.25 })); shade.position.set(0, 0.04, 0.44); head.add(shade);
  } else if (o.accessory === 'flower') {
    const fl = new THREE.Group(); fl.position.set(0.28, 0.26, 0.17);
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(G('petal', () => new THREE.SphereGeometry(0.055, 8, 6)), M(0xF7A8C4));
      petal.position.set(Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0); fl.add(petal);
    }
    const core = new THREE.Mesh(G('flcore', () => new THREE.SphereGeometry(0.045, 8, 6)), M(0xFFC94A)); fl.add(core);
    head.add(fl);
  } else if (o.accessory === 'bow') {
    const bw = new THREE.Group(); bw.position.set(-0.26, 0.28, 0.11); bw.rotation.z = 0.5;
    const l = new THREE.Mesh(G('bowL', () => new THREE.ConeGeometry(0.07, 0.14, 8)), M(0xE86A8A)); l.rotation.z = Math.PI / 2; l.position.x = -0.08;
    const r = new THREE.Mesh(G('bowL', () => new THREE.ConeGeometry(0.07, 0.14, 8)), M(0xE86A8A)); r.rotation.z = -Math.PI / 2; r.position.x = 0.08;
    const knot = new THREE.Mesh(G('bowK', () => new THREE.SphereGeometry(0.045, 8, 6)), M(0xD84468)); bw.add(l, r, knot);
    head.add(bw);
  }

  const feet: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const foot = new THREE.Mesh(G('foot', () => new THREE.SphereGeometry(0.13, 10, 8)), M(0x3a3f4a));
    foot.position.set(sx * 0.14, 0.12, 0.05); foot.scale.set(1, 0.7, 1.3); g.add(foot); feet.push(foot);
  }
  shadows(g);
  return { g, armL, armR, head, feet };
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

export function floatSprite(txt: string, color = '#FFE27A', stroke = '#7a3a0a'): THREE.Sprite {
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
