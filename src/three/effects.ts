import * as THREE from 'three';
import { steamTexture, floatSprite } from './builders';

// ── Pooled particle effects ───────────────────────────────────────────────────
// Coins, sparkles, steam puffs and floating text are pre-allocated and reused —
// zero geometry/material churn during play, no GC spikes.

interface Particle {
  o: THREE.Object3D; alive: boolean; t: number; life: number;
  vx: number; vy: number; vz: number; rot: number; kind: 'coin' | 'spark' | 'steam' | 'poof';
  baseScale: number;
}

const COIN_GEO = new THREE.CylinderGeometry(0.13, 0.13, 0.04, 12);
const COIN_MAT = new THREE.MeshStandardMaterial({ color: 0xFFC21E, metalness: 0.5, roughness: 0.35 });
const SPARK_GEO = new THREE.SphereGeometry(0.07, 6, 5);

export class Effects {
  private pool: Particle[] = [];
  private floats: { spr: THREE.Sprite; t: number; alive: boolean }[] = [];
  private sparkMats = new Map<number, THREE.MeshBasicMaterial>();

  constructor(private scene: THREE.Scene) {
    for (let i = 0; i < 36; i++) this.alloc('coin');
    for (let i = 0; i < 36; i++) this.alloc('spark');
    for (let i = 0; i < 28; i++) this.alloc('steam');
  }

  private alloc(kind: Particle['kind']): Particle {
    let o: THREE.Object3D;
    if (kind === 'coin') o = new THREE.Mesh(COIN_GEO, COIN_MAT);
    else if (kind === 'spark') o = new THREE.Mesh(SPARK_GEO, new THREE.MeshBasicMaterial({ color: 0xFFF0B0, transparent: true }));
    else o = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTexture(), transparent: true, depthWrite: false, opacity: 0.55 }));
    o.visible = false;
    this.scene.add(o);
    const p: Particle = { o, alive: false, t: 0, life: 1, vx: 0, vy: 0, vz: 0, rot: 0, kind, baseScale: 1 };
    this.pool.push(p);
    return p;
  }

  private take(kind: Particle['kind']): Particle | null {
    for (const p of this.pool) if (!p.alive && p.kind === kind) return p;
    return null; // pool exhausted — skip rather than allocate mid-frame
  }

  coinBurst(pos: THREE.Vector3, n = 12) {
    for (let i = 0; i < n; i++) {
      const p = this.take('coin'); if (!p) return;
      p.alive = true; p.t = 0; p.life = 2;
      p.o.position.copy(pos); p.o.visible = true;
      const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 3.5;
      p.vx = Math.cos(a) * sp; p.vy = 4.5 + Math.random() * 3.5; p.vz = Math.sin(a) * sp;
      p.rot = Math.random() * 12;
    }
  }

  sparkle(pos: THREE.Vector3, color: number, n = 8) {
    for (let i = 0; i < n; i++) {
      const p = this.take('spark'); if (!p) return;
      p.alive = true; p.t = 0; p.life = 0.6;
      ((p.o as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHex(color);
      ((p.o as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 1;
      p.o.position.copy(pos); p.o.visible = true;
      const a = (i / n) * Math.PI * 2, sp = 1.5 + Math.random() * 2;
      p.vx = Math.cos(a) * sp; p.vy = 1.5 + Math.random() * 2; p.vz = Math.sin(a) * sp;
    }
  }

  steam(pos: THREE.Vector3, gray = false) {
    const p = this.take('steam'); if (!p) return;
    p.alive = true; p.t = 0; p.life = 1.1;
    p.o.position.set(pos.x + (Math.random() - 0.5) * 0.3, pos.y, pos.z + (Math.random() - 0.5) * 0.3);
    p.o.visible = true;
    p.baseScale = 0.35 + Math.random() * 0.2;
    const m = (p.o as THREE.Sprite).material as THREE.SpriteMaterial;
    m.color.setHex(gray ? 0x9a9a9a : 0xffffff);
    p.vx = (Math.random() - 0.5) * 0.2; p.vy = 0.9 + Math.random() * 0.4; p.vz = (Math.random() - 0.5) * 0.2;
  }

  /** Small tan footstep puff at floor level (the waiter hustling). */
  dust(pos: THREE.Vector3) {
    const p = this.take('steam'); if (!p) return;
    p.alive = true; p.t = 0; p.life = 0.5;
    p.o.position.set(pos.x + (Math.random() - 0.5) * 0.2, 0.12, pos.z + (Math.random() - 0.5) * 0.2);
    p.o.visible = true;
    p.baseScale = 0.22 + Math.random() * 0.1;
    const m = (p.o as THREE.Sprite).material as THREE.SpriteMaterial;
    m.color.setHex(0xD8B98A);
    p.vx = (Math.random() - 0.5) * 0.4; p.vy = 0.35; p.vz = 0.2 + Math.random() * 0.3;
  }

  float(txt: string, x: number, z: number, color?: string, y = 2.2) {
    const spr = floatSprite(txt, color);
    spr.position.set(x, y, z);
    this.scene.add(spr);
    this.floats.push({ spr, t: 0, alive: true });
  }

  update(dt: number) {
    for (const p of this.pool) {
      if (!p.alive) continue;
      p.t += dt;
      if (p.kind === 'coin') {
        p.vy -= 14 * dt;
        p.o.position.x += p.vx * dt; p.o.position.y += p.vy * dt; p.o.position.z += p.vz * dt;
        p.o.rotation.x += p.rot * dt; p.o.rotation.y += p.rot * dt;
        if (p.o.position.y < 0.12 || p.t > p.life) { p.alive = false; p.o.visible = false; }
      } else if (p.kind === 'spark') {
        p.vy -= 6 * dt;
        p.o.position.x += p.vx * dt; p.o.position.y += p.vy * dt; p.o.position.z += p.vz * dt;
        const m = (p.o as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.opacity = Math.max(0, 1 - p.t / p.life);
        if (p.t > p.life) { p.alive = false; p.o.visible = false; }
      } else { // steam
        p.o.position.x += p.vx * dt; p.o.position.y += p.vy * dt; p.o.position.z += p.vz * dt;
        const f = p.t / p.life;
        p.o.scale.setScalar(p.baseScale * (1 + f * 1.6));
        const m = (p.o as THREE.Sprite).material as THREE.SpriteMaterial;
        m.opacity = 0.55 * (1 - f);
        if (p.t > p.life) { p.alive = false; p.o.visible = false; }
      }
    }
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i]; f.t += dt;
      f.spr.position.y += dt * 1.5;
      (f.spr.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - f.t / 1.1);
      if (f.t > 1.1) {
        this.scene.remove(f.spr);
        (f.spr.material as THREE.SpriteMaterial).map?.dispose();
        (f.spr.material as THREE.SpriteMaterial).dispose();
        this.floats.splice(i, 1);
      }
    }
  }
}
