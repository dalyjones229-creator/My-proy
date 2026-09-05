import { CartRepository } from "../../../cart/domain/repositories/CartRepository";
import { Customer } from "../../../customers/domain/entities/Customer";
import { CustomerRepository } from "../../../customers/domain/repositories/CustomerRepository";
import { Money } from "../../../shared/domain/Money";
import { Order, OrderStatus } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { OrderRepository } from "../repositories/OrderRepository";
import { PaymentGateway } from "../ports/PaymentGateway";

export interface ProcessCheckoutInput {
  cartId: string;
  customerId: string;
}

export interface ProcessCheckoutResult {
  orderId: string;
  status: OrderStatus;
  total: Money;
  transactionId?: string;
}

export class ProcessCheckout {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly orderRepository: OrderRepository,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(input: ProcessCheckoutInput): Promise<ProcessCheckoutResult> {
    const cart = await this.cartRepository.findById(input.cartId);
    if (!cart || cart.isEmpty()) {
      throw new Error("El carrito esta vacio o no existe.");
    }

    const customer: Customer | null = await this.customerRepository.findById(
      input.customerId,
    );
    if (!customer) {
      throw new Error(`Cliente no encontrado: ${input.customerId}`);
    }

    const items: OrderItem[] = cart.getItems().map(
      (i) =>
        new OrderItem(
          i.productId,
          i.name,
          i.getQuantity(),
          i.lineTotal().multiply(1 / i.getQuantity()),
        ),
    );

    const order = Order.create(cryptoUuid(), input.customerId, items);

    try {
      const payment = await this.paymentGateway.charge({
        orderId: order.id,
        amount: order.getTotal(),
        customerEmail: customer.getEmail(),
        reference: `ORDER-${order.id}`,
      });

      if (!payment.success) {
        order.markAsFailed();
        await this.orderRepository.save(order);
        return this.toResult(order, payment.transactionId);
      }

      order.markAsPaid(payment.transactionId);
      await this.orderRepository.save(order);
      return this.toResult(order, payment.transactionId);
    } catch (error) {
      order.markAsFailed();
      await this.orderRepository.save(order);
      throw error;
    }
  }

  private toResult(order: Order, transactionId?: string): ProcessCheckoutResult {
    return {
      orderId: order.id,
      status: order.getStatus(),
      total: order.getTotal(),
      ...(transactionId ? { transactionId } : {}),
    };
  }
}

function cryptoUuid(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `ord_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
  );
}
