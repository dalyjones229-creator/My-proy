import { Customer } from "../domain/entities/Customer";
import { CustomerRepository } from "../domain/repositories/CustomerRepository";

export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly customers = new Map<string, Customer>();

  async findById(id: string): Promise<Customer | null> {
    return this.customers.get(id) ?? null;
  }

  async save(customer: Customer): Promise<void> {
    this.customers.set(customer.id, customer);
  }
}
