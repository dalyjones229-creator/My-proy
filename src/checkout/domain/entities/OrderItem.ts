import { Money } from "../../../shared/domain/Money";

export class OrderItem {
  constructor(
    readonly productId: string,
    readonly name: string,
    readonly quantity: number,
    readonly unitPrice: Money,
  ) {}

  lineTotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }
}
