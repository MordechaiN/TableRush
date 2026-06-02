// Carry architecture — currently 1-item capacity. Future upgrades expand this.

export interface CarrySlot {
  orderId: number;
  tableId: number;
  emoji: string;
}

export class CarrySystem {
  private capacity: number;
  private slots: CarrySlot[] = [];

  constructor(capacity = 1) {
    this.capacity = capacity;
  }

  canPickUp(): boolean {
    return this.slots.length < this.capacity;
  }

  pickUp(orderId: number, tableId: number, emoji: string): boolean {
    if (!this.canPickUp()) return false;
    this.slots.push({ orderId, tableId, emoji });
    return true;
  }

  drop(orderId: number): CarrySlot | null {
    const idx = this.slots.findIndex(s => s.orderId === orderId);
    if (idx === -1) return null;
    return this.slots.splice(idx, 1)[0];
  }

  clear(): CarrySlot[] {
    const dropped = [...this.slots];
    this.slots = [];
    return dropped;
  }

  getSlots(): CarrySlot[] {
    return [...this.slots];
  }

  getFirstSlot(): CarrySlot | null {
    return this.slots[0] ?? null;
  }

  isEmpty(): boolean {
    return this.slots.length === 0;
  }

  hasOrder(orderId: number): boolean {
    return this.slots.some(s => s.orderId === orderId);
  }

  get count(): number {
    return this.slots.length;
  }

  get maxCapacity(): number {
    return this.capacity;
  }

  // Future upgrade path: call this when player buys tray upgrade
  upgrade(newCapacity: number): void {
    this.capacity = Math.max(this.capacity, newCapacity);
  }
}
