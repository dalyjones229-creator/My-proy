import { CartRepository } from "../repositories/CartRepository";

export interface CartItemView {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: { amount: number; currency: string };
  lineTotal: { amount: number; currency: string };
}

export interface GetCartResult {
  cartId: string;
  customerId: string;
  items: CartItemView[];
  total: { amount: number; currency: string };
  isEmpty: boolean;
}

export class GetCart {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(cartId: string): Promise<GetCartResult | null> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) return null;

    const items: CartItemView[] = cart.getItems().map((i) => ({
      productId: i.productId,
      name: i.name,
      quantity: i.getQuantity(),
      unitPrice: {
        amount: i.unitPrice.getAmount(),
        currency: i.unitPrice.getCurrency(),
      },
      lineTotal: {
        amount: i.lineTotal().getAmount(),
        currency: i.lineTotal().getCurrency(),
      },
    }));

    const total = cart.total();
    return {
      cartId: cart.id,
      customerId: cart.customerId,
      items,
      total: { amount: total.getAmount(), currency: total.getCurrency() },
      isEmpty: cart.isEmpty(),
    };
  }
}
