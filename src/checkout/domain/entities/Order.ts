import { Money } from "../../../shared/domain/Money";
import { OrderItem } from "./OrderItem";

export enum OrderStatus {
  Pending = "pending",
  Paid = "paid",
  Failed = "failed",
  Cancelled = "cancelled",
}

export class Order {
  private status: OrderStatus = OrderStatus.Pending;
  private paymentId?: string;

  private constructor(
    readonly id: string,
    readonly customerId: string,
    readonly items: OrderItem[],
    readonly total: Money,
    readonly createdAt: Date,
  ) {}

  static create(
    id: string,
    customerId: string,
    items: OrderItem[],
    createdAt = new Date(),
  ): Order {
    if (items.length === 0) {
      throw new Error("Una orden debe contener al menos un item.");
    }
    const total = items
      .map((i) => i.lineTotal())
      .reduce((acc, line) => acc.add(line));
    return new Order(id, customerId, items, total, createdAt);
  }

  markAsPaid(paymentId: string): void {
    this.paymentId = paymentId;
    this.status = OrderStatus.Paid;
  }

  markAsFailed(): void {
    this.status = OrderStatus.Failed;
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getPaymentId(): string | undefined {
    return this.paymentId;
  }

  getTotal(): Money {
    return this.total;
  }
}
