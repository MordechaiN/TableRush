import * as THREE from 'three';
import { MENU_ITEMS, BURNERS, SHELF_SLOTS } from '../config/GameConfig';
import { M, G, chibi, Chibi, plate, buildDish, makeBubble, Bubble, shadows, poseCarry, poseStand, menuBoardTexture, signTexture, DISH_EMOJI } from './builders';
import { Effects } from './effects';

// ── The visible kitchen ───────────────────────────────────────────────────────
// Orders arrive as tickets, land on a burner, cook with steam + a progress
// bubble, then the chef physically carries the plate to an "ORDER UP" slot on
// the pass. Nothing teleports.

export interface Ticket { tableIndex: number; dish: number; dead: boolean; }

interface Burner {
  pos: THREE.Vector3;
  pan: THREE.Group;
  content: THREE.Group | null;
  ticket: Ticket | null;
  t: number; dur: number;
  bubble: Bubble;
  done: boolean;
  steamAcc: number;
}
interface Slot {
  pos: THREE.Vector3;
  plate: THREE.Group | null;
  ticket: Ticket | null;
  glow: THREE.Mesh;
  staleT: number;
}

type ChefState = 'idle' | 'toBurner' | 'stir' | 'toSlot' | 'toIdle';

const AISLE_Z = -6.9;
const CHEF_IDLE_X = -1.1;

export class Kitchen {
  private burners: Burner[] = [];
  private slots: Slot[] = [];
  private queue: Ticket[] = [];
  private queueSprites: Bubble[] = [];
  private chef: Chibi;
  private chefState: ChefState = 'idle';
  private chefTargetX = CHEF_IDLE_X;
  private chefTask: { burner?: Burner; slot?: Slot } = {};
  private chefCarry: THREE.Group | null = null;
  private stirT = 0;
  onReady: ((ticket: Ticket) => void) | null = null;
  onWasted: ((ticket: Ticket) => void) | null = null;

  constructor(private scene: THREE.Scene, private fx: Effects) {
    this.buildSet();
    const burnerXs = [-2.5, -1.1, 0.3].slice(0, BURNERS);
    for (const bx of burnerXs) {
      const pos = new THREE.Vector3(bx, 1.62, -8.05);
      const pan = new THREE.Group();
      pan.add(new THREE.Mesh(G('pan', () => new THREE.CylinderGeometry(0.42, 0.38, 0.12, 20)), M(0x3A3F47, { roughness: 0.4, metalness: 0.5 })));
      const handle = new THREE.Mesh(G('panHandle', () => new THREE.CylinderGeometry(0.035, 0.035, 0.5, 8)), M(0x2A2D33));
      handle.rotation.z = Math.PI / 2; handle.rotation.y = 0.3; handle.position.set(0.6, 0, 0.15); pan.add(handle);
      pan.position.copy(pos); shadows(pan); scene.add(pan);
      const bubble = makeBubble();
      bubble.spr.position.set(pos.x, pos.y + 1.15, pos.z); bubble.spr.scale.set(1.15, 1.15, 1); bubble.spr.visible = false;
      scene.add(bubble.spr);
      this.burners.push({ pos, pan, content: null, ticket: null, t: 0, dur: 1, bubble, done: false, steamAcc: 0 });
    }
    const slotXs = [1.5, 2.6, 3.7].slice(0, SHELF_SLOTS);
    for (const sx of slotXs) {
      const pos = new THREE.Vector3(sx, 1.26, -5.85);
      const mark = new THREE.Mesh(G('slotMark', () => new THREE.CylinderGeometry(0.5, 0.5, 0.02, 24)), M(0xF7EAD2, { roughness: 0.9 }));
      mark.position.set(pos.x, 1.19, pos.z); scene.add(mark);
      const glow = new THREE.Mesh(
        G('slotGlow', () => new THREE.RingGeometry(0.52, 0.68, 28)),
        new THREE.MeshBasicMaterial({ color: 0xFFC21E, transparent: true, opacity: 0, side: THREE.DoubleSide }),
      );
      glow.rotation.x = -Math.PI / 2; glow.position.set(pos.x, 1.21, pos.z); scene.add(glow);
      this.slots.push({ pos, plate: null, ticket: null, glow, staleT: 0 });
    }
    this.chef = chibi({ skin: 0xF3C19E, outfit: 0xF5F2EA, hair: 0x6B3A1F, chef: true });
    this.chef.g.position.set(CHEF_IDLE_X, 0, AISLE_Z);
    this.chef.g.rotation.y = Math.PI; // facing the stove
    scene.add(this.chef.g);
  }

  // Static kitchen furniture: pass counter, stove, hood, fridge, signage
  private buildSet() {
    const s = this.scene;
    // pass counter the waiter picks up from
    const counter = new THREE.Mesh(G('kCounter', () => new THREE.BoxGeometry(8.6, 1.12, 1.5)), M(0xC9763A));
    counter.position.set(0, 0.56, -5.85); s.add(shadows(counter));
    const top = new THREE.Mesh(G('kTop', () => new THREE.BoxGeometry(8.9, 0.14, 1.7)), M(0xF3E5CC, { roughness: 0.5 }));
    top.position.set(0, 1.16, -5.85); s.add(shadows(top));
    const kick = new THREE.Mesh(G('kKick', () => new THREE.BoxGeometry(8.6, 0.18, 0.06)), M(0x9A5528));
    kick.position.set(0, 0.65, -5.06); s.add(kick);

    // stove block against the back wall
    const stove = new THREE.Mesh(G('kStove', () => new THREE.BoxGeometry(4.6, 1.5, 1.4)), M(0x8A8F98, { roughness: 0.35, metalness: 0.45 }));
    stove.position.set(-1.1, 0.75, -8.1); s.add(shadows(stove));
    const cooktop = new THREE.Mesh(G('kCooktop', () => new THREE.BoxGeometry(4.7, 0.08, 1.5)), M(0x2E3138, { roughness: 0.3, metalness: 0.3 }));
    cooktop.position.set(-1.1, 1.53, -8.1); s.add(cooktop);
    for (const bx of [-2.5, -1.1, 0.3]) {
      const burnerRing = new THREE.Mesh(G('kBurner', () => new THREE.CylinderGeometry(0.46, 0.46, 0.03, 20)), M(0x14161C, { roughness: 0.5 }));
      burnerRing.position.set(bx, 1.58, -8.05); s.add(burnerRing);
    }
    // hood + duct
    const hood = new THREE.Mesh(G('kHood', () => new THREE.BoxGeometry(4.9, 0.8, 1.6)), M(0xB0662E, { roughness: 0.4, metalness: 0.5 }));
    hood.position.set(-1.1, 3.55, -8.2); s.add(shadows(hood));
    const duct = new THREE.Mesh(G('kDuct', () => new THREE.BoxGeometry(1.2, 2.2, 1.0)), M(0x9A5A28, { roughness: 0.45, metalness: 0.5 }));
    duct.position.set(-1.1, 5.0, -8.3); s.add(duct);

    // fridge in the right-back corner
    const fridge = new THREE.Mesh(G('kFridge', () => new THREE.BoxGeometry(1.5, 3.0, 1.3)), M(0xC8CDD6, { roughness: 0.3, metalness: 0.5 }));
    fridge.position.set(3.3, 1.5, -8.15); s.add(shadows(fridge));
    const fHandle = new THREE.Mesh(G('kFH', () => new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8)), M(0x6E7480));
    fHandle.position.set(2.75, 1.7, -7.45); s.add(fHandle);

    // plate stack décor on the left end of the pass
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(G('plate', () => new THREE.CylinderGeometry(0.62, 0.52, 0.07, 36)), M(0xFFFFFF, { roughness: 0.35 }));
      p.position.set(-3.6, 1.28 + i * 0.09, -5.85); p.scale.setScalar(0.8); s.add(p);
    }

    // "ORDER UP!" hanging sign above the slots
    const sign = new THREE.Mesh(G('kSign', () => new THREE.PlaneGeometry(2.6, 0.98)), new THREE.MeshBasicMaterial({ map: signTexture('ORDER UP!', { bg: '#B33A22', fg: '#FFF3D8' }), transparent: true }));
    sign.position.set(2.6, 3.1, -5.85); s.add(sign);
    for (const cx of [1.6, 3.6]) {
      const cord = new THREE.Mesh(G('kCord', () => new THREE.CylinderGeometry(0.025, 0.025, 2.6, 6)), M(0x6E4A28));
      cord.position.set(cx, 4.85, -5.85); s.add(cord);
    }

    // menu board on the back wall, left side
    const board = new THREE.Mesh(G('kBoard', () => new THREE.PlaneGeometry(2.1, 2.8)), new THREE.MeshBasicMaterial({ map: menuBoardTexture() }));
    board.position.set(-3.55, 3.6, -8.93); s.add(board);
  }

  /** Where the waiter should stand to pick up a ready plate. */
  pickupPoint(tableIndex: number): THREE.Vector3 {
    const slot = this.slots.find(sl => sl.ticket && sl.ticket.tableIndex === tableIndex);
    return new THREE.Vector3(slot ? slot.pos.x : 2.6, 0, -4.55);
  }

  submit(ticket: Ticket) {
    const free = this.burners.find(b => !b.ticket);
    if (free) this.startCooking(free, ticket);
    else { this.queue.push(ticket); this.refreshQueueRail(); }
  }

  private startCooking(b: Burner, ticket: Ticket) {
    b.ticket = ticket; b.t = 0; b.done = false; b.steamAcc = 0;
    b.dur = MENU_ITEMS[ticket.dish].cookTime;
    b.content = buildDish(ticket.dish);
    b.content.scale.setScalar(0.55);
    b.content.position.set(b.pos.x, b.pos.y + 0.06, b.pos.z);
    this.scene.add(b.content);
    b.bubble.spr.visible = true;
    b.bubble.draw(DISH_EMOJI[ticket.dish], 0.01, 1);
  }

  /** True if this table's plate is sitting ready on the pass. */
  hasReady(tableIndex: number): boolean {
    return this.slots.some(sl => sl.ticket && !sl.ticket.dead && sl.ticket.tableIndex === tableIndex);
  }

  /** Waiter takes the plate for a table off the pass. Returns the plate group. */
  takeReady(tableIndex: number): { dish: number; plate: THREE.Group } | null {
    const slot = this.slots.find(sl => sl.ticket && sl.ticket.tableIndex === tableIndex);
    if (!slot || !slot.plate || !slot.ticket) return null;
    const out = { dish: slot.ticket.dish, plate: slot.plate };
    this.scene.remove(slot.plate);
    slot.plate = null; slot.ticket = null; slot.staleT = 0;
    (slot.glow.material as THREE.MeshBasicMaterial).opacity = 0;
    return out;
  }

  /** Customer left — mark their ticket dead wherever it is in the pipeline. */
  cancel(tableIndex: number) {
    for (const t of this.queue) if (t.tableIndex === tableIndex) t.dead = true;
    this.queue = this.queue.filter(t => !t.dead);
    this.refreshQueueRail();
    for (const b of this.burners) if (b.ticket && b.ticket.tableIndex === tableIndex) b.ticket.dead = true;
    for (const sl of this.slots) if (sl.ticket && sl.ticket.tableIndex === tableIndex) sl.ticket.dead = true;
  }

  /** Number of pans actively cooking (drives the sizzle sound level). */
  activeBurners(): number {
    return this.burners.filter(b => b.ticket && !b.done).length;
  }

  debug() {
    return {
      burners: this.burners.map(b => b.ticket ? `t${b.ticket.tableIndex}:${Math.round(b.t * 10) / 10}/${b.dur}${b.done ? ':done' : ''}` : '-'),
      slots: this.slots.map(sl => sl.ticket ? `t${sl.ticket.tableIndex}${sl.ticket.dead ? ':dead' : ''}${sl.plate ? ':plate' : ''}` : '-'),
      queue: this.queue.length,
      chef: this.chefState + '@' + Math.round(this.chef.g.position.x * 10) / 10 + '→' + this.chefTargetX,
    };
  }

  private refreshQueueRail() {
    // mini ticket chits above the left side of the pass
    while (this.queueSprites.length < this.queue.length) {
      const bub = makeBubble();
      bub.spr.scale.set(0.8, 0.8, 1);
      this.scene.add(bub.spr);
      this.queueSprites.push(bub);
    }
    this.queueSprites.forEach((bub, i) => {
      const t = this.queue[i];
      if (t) {
        bub.spr.visible = true;
        bub.spr.position.set(-3.4 + i * 0.85, 2.6, -5.85);
        bub.draw(DISH_EMOJI[t.dish], 0.01, 1);
      } else bub.spr.visible = false;
    });
  }

  update(dt: number, now: number) {
    // cooking progress
    for (const b of this.burners) {
      if (!b.ticket) continue;
      if (!b.done) {
        b.t += dt;
        const frac = Math.min(1, b.t / b.dur);
        b.bubble.draw(DISH_EMOJI[b.ticket.dish], frac, 1);
        b.steamAcc += dt;
        if (b.steamAcc > 0.28) { b.steamAcc = 0; this.fx.steam(new THREE.Vector3(b.pos.x, b.pos.y + 0.25, b.pos.z)); }
        if (b.content) b.content.rotation.y += dt * 1.2;
        if (frac >= 1) {
          b.done = true;
          b.bubble.spr.visible = false;
          if (b.content) b.content.scale.setScalar(0.62);
        }
      } else if (b.ticket.dead) {
        // cooked for a guest who stormed out — bin it
        this.wasteBurner(b);
      }
    }
    // stale ready plates whose guest left
    for (const sl of this.slots) {
      if (sl.ticket && sl.ticket.dead) {
        sl.staleT += dt;
        if (sl.staleT > 1.2) this.wasteSlot(sl);
      } else if (sl.ticket) {
        const m = sl.glow.material as THREE.MeshBasicMaterial;
        m.opacity = 0.55 + Math.sin(now / 180) * 0.25;
        sl.glow.scale.setScalar(1 + Math.sin(now / 240) * 0.06);
      }
    }
    this.updateChef(dt, now);
  }

  private wasteBurner(b: Burner) {
    if (b.content) { this.scene.remove(b.content); b.content = null; }
    this.fx.steam(new THREE.Vector3(b.pos.x, b.pos.y + 0.3, b.pos.z), true);
    if (b.ticket) this.onWasted?.(b.ticket);
    b.ticket = null; b.done = false; b.bubble.spr.visible = false;
    this.pullFromQueue(b);
  }

  private wasteSlot(sl: Slot) {
    if (sl.plate) { this.scene.remove(sl.plate); sl.plate = null; }
    this.fx.steam(new THREE.Vector3(sl.pos.x, sl.pos.y + 0.3, sl.pos.z), true);
    if (sl.ticket) this.onWasted?.(sl.ticket);
    sl.ticket = null; sl.staleT = 0;
    (sl.glow.material as THREE.MeshBasicMaterial).opacity = 0;
  }

  private pullFromQueue(b: Burner) {
    const next = this.queue.shift();
    this.refreshQueueRail();
    if (next) this.startCooking(b, next);
  }

  // ── chef brain ──────────────────────────────────────────────────────────────
  private updateChef(dt: number, now: number) {
    const c = this.chef;
    if (this.chefState === 'idle' || this.chefState === 'stir') {
      // is a finished plate waiting and a slot free?
      const doneBurner = this.burners.find(b => b.done && b.ticket && !b.ticket.dead);
      const freeSlot = this.slots.find(sl => !sl.ticket);
      if (doneBurner && freeSlot) {
        this.chefTask = { burner: doneBurner, slot: freeSlot };
        this.chefTargetX = doneBurner.pos.x;
        this.chefState = 'toBurner';
      } else if (this.chefState === 'idle') {
        const cooking = this.burners.find(b => b.ticket && !b.done);
        if (cooking) { this.chefTargetX = cooking.pos.x; this.chefState = 'toBurner'; this.chefTask = { burner: cooking }; }
      }
    }

    const walk = (targetX: number): boolean => {
      const dx = targetX - c.g.position.x;
      if (Math.abs(dx) < 0.06) { c.g.position.x = targetX; return true; }
      c.g.position.x += Math.sign(dx) * Math.min(Math.abs(dx), 3.2 * dt);
      c.g.position.y = Math.abs(Math.sin(now / 90)) * 0.08;
      return false;
    };

    switch (this.chefState) {
      case 'toBurner':
        if (walk(this.chefTargetX)) {
          c.g.rotation.y = Math.PI; c.g.position.y = 0;
          const b = this.chefTask.burner;
          if (b && b.done && b.ticket && !b.ticket.dead) {
            // pick the plate up and carry it to the pass
            const sl = this.chefTask.slot ?? this.slots.find(s2 => !s2.ticket);
            if (sl) {
              const pl = plate();
              const food = b.content ?? buildDish(b.ticket.dish);
              if (b.content) { this.scene.remove(b.content); b.content = null; }
              food.scale.setScalar(0.62); food.position.y = 0.06;
              pl.add(food);
              this.chefCarry = pl;
              pl.position.set(0, 1.02, 0.42);
              c.g.add(pl);
              poseCarry(c);
              sl.ticket = b.ticket; // reserve
              b.ticket = null; b.done = false;
              this.pullFromQueue(b);
              this.chefTask = { slot: sl };
              this.chefTargetX = sl.pos.x;
              this.chefState = 'toSlot';
            }
          } else if (b && b.ticket && !b.done) {
            this.chefState = 'stir'; this.stirT = 0;
          } else {
            this.chefState = 'toIdle'; this.chefTargetX = CHEF_IDLE_X;
          }
        }
        break;
      case 'stir': {
        this.stirT += dt;
        c.armR.rotation.x = -1.1 + Math.sin(now / 110) * 0.35;
        c.g.position.y = Math.abs(Math.sin(now / 220)) * 0.04;
        const b = this.chefTask.burner;
        if (!b || !b.ticket || b.done || this.stirT > 1.6) {
          poseStand(c); c.armR.rotation.x = 0;
          this.chefState = 'idle'; this.chefTask = {};
        }
        break;
      }
      case 'toSlot': {
        c.g.rotation.y = 0; // faces the dining room while carrying
        if (walk(this.chefTargetX)) {
          c.g.position.y = 0;
          const sl = this.chefTask.slot;
          if (sl && this.chefCarry) {
            c.g.remove(this.chefCarry);
            this.chefCarry.position.copy(sl.pos);
            this.chefCarry.rotation.set(0, 0, 0);
            this.scene.add(this.chefCarry);
            sl.plate = this.chefCarry;
            this.chefCarry = null;
            poseStand(c);
            this.fx.sparkle(new THREE.Vector3(sl.pos.x, sl.pos.y + 0.5, sl.pos.z), 0xFFE27A, 6);
            if (sl.ticket && !sl.ticket.dead) this.onReady?.(sl.ticket);
            else sl.staleT = 0; // dead ticket — will be binned by update()
          }
          this.chefState = 'toIdle'; this.chefTargetX = CHEF_IDLE_X; this.chefTask = {};
        }
        break;
      }
      case 'toIdle':
        c.g.rotation.y = Math.PI;
        if (walk(this.chefTargetX)) { c.g.position.y = 0; this.chefState = 'idle'; }
        break;
    }
  }
}
