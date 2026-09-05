import { ProductRepository } from "../../../catalog/domain/repositories/ProductRepository";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import { CartRepository } from "../repositories/CartRepository";

export interface AddItemToCartInput {
  cartId: string;
  customerId: string;
  productId: string;
  quantity: number;
}

export class AddItemToCart {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: AddItemToCartInput): Promise<Cart> {
    if (input.quantity <= 0) {
      throw new Error("La cantidad a agregar debe ser mayor a cero.");
    }

    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new Error(`Producto no encontrado: ${input.productId}`);
    }

    if (!product.hasStock(input.quantity)) {
      throw new Error(
        `Stock insuficiente para "${product.getName()}". Disponible: ${product.getStock()}, solicitado: ${input.quantity}.`,
      );
    }

    let cart = await this.cartRepository.findById(input.cartId);
    if (!cart) {
      cart = Cart.create(input.cartId, input.customerId);
    }

    const item = CartItem.fromProduct(product, input.quantity);
    cart.addItem(item);

    await this.cartRepository.save(cart);
    return cart;
  }
}
