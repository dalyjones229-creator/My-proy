import { Money } from "../../../shared/domain/Money";
import { CartItem } from "./CartItem";

export class Cart {
  private items: CartItem[] = [];

  private constructor(readonly id: string, readonly customerId: string) {}

  static create(id: string, customerId: string): Cart {
    return new Cart(id, customerId);
  }

  addItem(item: CartItem): void {
    const existing = this.items.find((i) => i.productId === item.productId);
    if (existing) {
      existing.increase(item.getQuantity());
      return;
    }
    this.items.push(item);
  }

  removeItem(productId: string): boolean {
    const before = this.items.length;
    this.items = this.items.filter((i) => i.productId !== productId);
    return this.items.length < before;
  }

  getItems(): readonly CartItem[] {
    return [...this.items];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  total(): Money {
    if (this.items.length === 0) {
      return Money.of(0);
    }
    return this.items
      .map((i) => i.lineTotal())
      .reduce((acc, line) => acc.add(line));
  }
}
