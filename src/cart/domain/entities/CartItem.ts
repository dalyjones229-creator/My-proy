import { Money } from "../../../shared/domain/Money";
import { Product } from "../../../catalog/domain/entities/Product";

export class CartItem {
  private constructor(
    readonly productId: string,
    readonly name: string,
    readonly unitPrice: Money,
    private quantity: number,
    readonly batch: string,
  ) {}

  static fromProduct(product: Product, quantity: number): CartItem {
    if (quantity <= 0) {
      throw new Error("La cantidad de un item debe ser mayor a cero.");
    }
    return new CartItem(
      product.id,
      product.getName(),
      product.getPrice(),
      quantity,
      product.getBatch(),
    );
  }

  getQuantity(): number {
    return this.quantity;
  }

  increase(quantity: number): void {
    if (quantity <= 0) {
      throw new Error("La cantidad a incrementar debe ser mayor a cero.");
    }
    this.quantity += quantity;
  }

  lineTotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }
}
