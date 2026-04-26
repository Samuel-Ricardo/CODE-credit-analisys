export class CPF {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(raw: string): CPF {
    const clean = raw.replace(/\D/g, '');
    if (!CPF.isValid(clean)) {
      throw new Error(`CPF inválido: ${raw}`);
    }
    return new CPF(clean);
  }

  static isValid(raw: string): boolean {
    const clean = raw.replace(/\D/g, '');
    if (clean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(clean)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
    let rem = (sum * 10) % 11;
    if (rem === 10 || rem === 11) rem = 0;
    if (rem !== parseInt(clean[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
    rem = (sum * 10) % 11;
    if (rem === 10 || rem === 11) rem = 0;
    return rem === parseInt(clean[10]);
  }

  format(): string {
    return this._value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  get value(): string {
    return this._value;
  }

  equals(other: CPF): boolean {
    return this._value === other._value;
  }
}
