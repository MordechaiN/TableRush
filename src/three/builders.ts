import * as THREE from 'three';

// Shared low-poly art builders for the Three.js restaurant.
export const M = (c: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: 0.72, metalness: 0.04, ...o });

export function shadows<T extends THREE.Object3D>(m: T): T {
  m.traverse(o => { const mm = o as THREE.Mesh; if (mm.isMesh) { mm.castShadow = true; mm.receiveShadow = true; } });
  return m;
}

export function plate(): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.52, 0.07, 36), M(0xFFFFFF, { roughness: 0.35 })));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.045, 12, 36), M(0xF3D9A0));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.04; g.add(rim);
  return g;
}

// dishIdx maps to GameConfig MENU_ITEMS order: 0 salad,1 burger,2 pasta,3 sushi,4 pizza
export const DISH_EMOJI = ['🥗', '🍔', '🍝', '🍣', '🍕'];
export function buildDish(i: number): THREE.Group {
  const g = new THREE.Group();
  if (i === 0) { // salad
    for (let k = 0; k < 12; k++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13 + Math.random() * 0.05, 0), M([0x4FA63A, 0x6FBF4A, 0x3E8E2E][k % 3])); l.position.set((Math.random() - 0.5) * 0.5, 0.08 + Math.random() * 0.1, (Math.random() - 0.5) * 0.5); g.add(l); }
    const t = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), M(0xE3403F)); t.position.set(0.15, 0.12, -0.08); g.add(t);
  } else if (i === 1) { // burger
    const b0 = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.15, 22), M(0xE3A24E));
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.13, 22), M(0x6B3B22)); p.position.y = 0.13;
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.05, 0.66), M(0xFFC23D)); ch.position.y = 0.22; ch.rotation.y = 0.8;
    const bt = new THREE.Mesh(new THREE.SphereGeometry(0.44, 22, 14, 0, 6.3, 0, Math.PI / 2), M(0xF0B45E)); bt.position.y = 0.27; bt.scale.y = 0.7;
    g.add(b0, p, ch, bt);
  } else if (i === 2) { // pasta
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.46, 22, 12, 0, 6.3, Math.PI / 2, Math.PI / 2), M(0xE74C3C, { roughness: 0.35 })); bowl.scale.y = 0.6; bowl.position.y = 0.12;
    const n = new THREE.Mesh(new THREE.TorusKnotGeometry(0.2, 0.06, 60, 8), M(0xF2CF6B)); n.position.y = 0.2; n.scale.set(1, 0.5, 1);
    const mb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), M(0x7A3B1E)); mb.position.set(0.13, 0.24, 0.06);
    g.add(bowl, n, mb);
  } else if (i === 3) { // sushi
    const rice = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.3, 6, 12), M(0xFBF6EC, { roughness: 0.5 })); rice.rotation.z = Math.PI / 2; rice.scale.y = 0.7; rice.position.y = 0.12;
    const fish = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.11, 0.36), M(0xF2784B, { roughness: 0.4 })); fish.position.y = 0.28;
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.42), M(0x2E3A2A)); band.position.y = 0.14;
    g.add(rice, fish, band);
  } else { // pizza
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.8, 0.42); s.lineTo(0.8, -0.42); s.lineTo(0, 0);
    const slice = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false }), M(0xF2B33B)); slice.rotation.x = -Math.PI / 2; slice.position.y = 0.12; g.add(slice);
    for (const [x, z] of [[0.35, 0.05], [0.55, -0.15], [0.6, 0.18]]) { const pp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), M(0xC0392B)); pp.position.set(x, 0.2, z); g.add(pp); }
  }
  return g;
}

export function chibi(skin: number, outfit: number, hair: number, isWaiter = false): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.3, 6, 16), M(outfit)); body.position.y = 0.62; body.scale.y = 0.9; g.add(body);
  if (isWaiter) {
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.12), M(0xFDFDFD)); shirt.position.set(0, 0.66, 0.3); g.add(shirt);
    const bow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.06), M(0xE23B3B)); bow.position.set(0, 0.82, 0.34); g.add(bow);
  }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.44, 28, 20), M(skin, { roughness: 0.55 })); head.position.y = 1.3; g.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 16, 0, 6.3, 0, Math.PI * 0.6), M(hair)); hairM.position.y = 1.34; g.add(hairM);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), M(0x241a12)); eye.position.set(sx * 0.16, 1.32, 0.4); g.add(eye);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), M(0xffffff, { roughness: 0.3 })); w.position.set(sx * 0.16 + 0.03, 1.35, 0.45); g.add(w);
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), M(0xFF8A8A, { transparent: true, opacity: 0.5 })); cheek.position.set(sx * 0.24, 1.22, 0.37); g.add(cheek);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), M(0x3a3f4a)); foot.position.set(sx * 0.14, 0.12, 0.05); foot.scale.set(1, 0.7, 1.3); g.add(foot);
  }
  return shadows(g);
}

function rrect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

export interface Bubble { spr: THREE.Sprite; draw: (emoji: string, frac: number, ring: number) => void; }
export function makeBubble(): Bubble {
  const cv = document.createElement('canvas'); cv.width = cv.height = 160;
  const ctx = cv.getContext('2d')!;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  spr.scale.set(1.5, 1.5, 1); spr.renderOrder = 999;
  function draw(emoji: string, frac: number, ring: number) {
    ctx.clearRect(0, 0, 160, 160);
    ctx.fillStyle = 'rgba(0,0,0,0.16)'; rrect(ctx, 24, 22, 112, 96, 26); ctx.fill();
    ctx.fillStyle = '#FFF8EE'; rrect(ctx, 20, 18, 112, 96, 26); ctx.fill();
    const col = ring < 0.3 ? '#E8442C' : ring < 0.6 ? '#FF9E1B' : '#5BBF4A';
    ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
    ctx.beginPath(); ctx.lineWidth = 9; ctx.strokeStyle = col;
    ctx.arc(76, 66, 56, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#FFF8EE'; ctx.beginPath(); ctx.moveTo(60, 110); ctx.lineTo(92, 110); ctx.lineTo(76, 138); ctx.closePath(); ctx.fill();
    ctx.font = '54px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(emoji, 76, 64);
    tex.needsUpdate = true;
  }
  return { spr, draw };
}

export function floatSprite(txt: string, color = '#FFE27A', stroke = '#7a3a0a'): THREE.Sprite {
  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 90; const ctx = cv.getContext('2d')!;
  ctx.font = '900 58px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 9; ctx.strokeStyle = stroke; ctx.strokeText(txt, 160, 46);
  ctx.fillStyle = color; ctx.fillText(txt, 160, 46);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  spr.scale.set(2.6, 0.73, 1); spr.renderOrder = 1000;
  return spr;
}
