export class Money {
  private readonly _centavos: number;

  private constructor(centavos: number) {
    if (centavos < 0) throw new Error(`Valor monetário inválido: ${centavos}`);
    this._centavos = Math.round(centavos);
  }

  static fromReais(value: number): Money {
    return new Money(value * 100);
  }

  static fromCentavos(centavos: number): Money {
    return new Money(centavos);
  }

  static zero(): Money {
    return new Money(0);
  }

  get value(): number {
    return this._centavos / 100;
  }

  get centavos(): number {
    return this._centavos;
  }

  format(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this.value);
  }

  add(other: Money): Money {
    return Money.fromCentavos(this._centavos + other._centavos);
  }

  subtract(other: Money): Money {
    return Money.fromCentavos(this._centavos - other._centavos);
  }

  multiply(factor: number): Money {
    return Money.fromCentavos(this._centavos * factor);
  }

  isGreaterThan(other: Money): boolean {
    return this._centavos > other._centavos;
  }

  isLessThan(other: Money): boolean {
    return this._centavos < other._centavos;
  }

  equals(other: Money): boolean {
    return this._centavos === other._centavos;
  }
}
