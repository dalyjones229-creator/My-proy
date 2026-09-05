import { Cart } from "../domain/entities/Cart";
import { CartRepository } from "../domain/repositories/CartRepository";

export class InMemoryCartRepository implements CartRepository {
  private readonly carts = new Map<string, Cart>();

  async findById(id: string): Promise<Cart | null> {
    return this.carts.get(id) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<Cart | null> {
    return (
      [...this.carts.values()].find((c) => c.customerId === customerId) ?? null
    );
  }

  async save(cart: Cart): Promise<void> {
    this.carts.set(cart.id, cart);
  }
}
