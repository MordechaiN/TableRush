export interface CarrySlot {
  orderId: number;
  emoji: string;
  itemId: number;
}

export class CarrySystem {
  private capacity: number;
  private slots: CarrySlot[] = [];

  constructor(capacity = 2) {
    this.capacity = capacity;
  }

  canPickUp(): boolean {
    return this.slots.length < this.capacity;
  }

  pickUp(orderId: number, emoji: string, itemId: number): boolean {
    if (!this.canPickUp()) return false;
    this.slots.push({ orderId, emoji, itemId });
    return true;
  }

  drop(orderId: number): CarrySlot | null {
    const idx = this.slots.findIndex(s => s.orderId === orderId);
    if (idx === -1) return null;
    return this.slots.splice(idx, 1)[0];
  }

  // Drop the first slot carrying this food type; used for inventory-kitchen delivery
  dropByEmoji(emoji: string): CarrySlot | null {
    const idx = this.slots.findIndex(s => s.emoji === emoji);
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

  hasItemType(emoji: string): boolean {
    return this.slots.some(s => s.emoji === emoji);
  }

  get count(): number {
    return this.slots.length;
  }

  get maxCapacity(): number {
    return this.capacity;
  }

  upgrade(newCapacity: number): void {
    this.capacity = Math.max(this.capacity, newCapacity);
  }
}
