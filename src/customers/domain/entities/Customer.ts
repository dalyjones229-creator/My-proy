export interface CustomerProps {
  id: string;
  fullName: string;
  email: string;
  shippingAddress: string;
}

export class Customer {
  readonly id: string;
  private fullName: string;
  private email: string;
  private shippingAddress: string;

  private constructor(props: CustomerProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.email = props.email;
    this.shippingAddress = props.shippingAddress;
  }

  static create(props: CustomerProps): Customer {
    if (!props.email.includes("@")) {
      throw new Error("El email del cliente no es valido.");
    }
    if (!props.shippingAddress.trim()) {
      throw new Error("La direccion de envio es obligatoria.");
    }
    return new Customer(props);
  }

  getEmail(): string {
    return this.email;
  }

  getFullName(): string {
    return this.fullName;
  }

  getShippingAddress(): string {
    return this.shippingAddress;
  }
}
