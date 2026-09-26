import { Cart } from "../entities/Cart";
import { CartRepository } from "../repositories/CartRepository";

export interface RemoveItemFromCartInput {
  cartId: string;
  productId: string;
}

export class RemoveItemFromCart {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(input: RemoveItemFromCartInput): Promise<Cart> {
    const cart = await this.cartRepository.findById(input.cartId);
    if (!cart) {
      throw new Error("Carrito no encontrado.");
    }

    if (!cart.removeItem(input.productId)) {
      throw new Error("El articulo no esta en el carrito.");
    }

    await this.cartRepository.save(cart);
    return cart;
  }
}