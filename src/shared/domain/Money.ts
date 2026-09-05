export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {
    if (amount < 0) {
      throw new Error("El monto de Money no puede ser negativo.");
    }
    if (!currency || currency.length !== 3) {
      throw new Error("La moneda debe ser un codigo ISO de 3 letras.");
    }
  }

  static of(amount: number, currency = "COP"): Money {
    return new Money(Math.round(amount * 100) / 100, currency.toUpperCase());
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error("No se pueden operar montos con distintas monedas.");
    }
  }
}
