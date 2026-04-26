export class CNPJ {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(raw: string): CNPJ {
    const clean = raw.replace(/\D/g, '');
    if (!CNPJ.isValid(clean)) {
      throw new Error(`CNPJ inválido: ${raw}`);
    }
    return new CNPJ(clean);
  }

  static isValid(raw: string): boolean {
    const clean = raw.replace(/\D/g, '');
    if (clean.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(clean)) return false;

    const calcDigit = (cnpj: string, len: number): number => {
      let sum = 0;
      let pos = len - 7;
      for (let i = len; i >= 1; i--) {
        sum += parseInt(cnpj.charAt(len - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      const rem = sum % 11;
      return rem < 2 ? 0 : 11 - rem;
    };

    const d1 = calcDigit(clean, 12);
    if (d1 !== parseInt(clean[12])) return false;

    const d2 = calcDigit(clean, 13);
    return d2 === parseInt(clean[13]);
  }

  format(): string {
    return this._value.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }

  get value(): string {
    return this._value;
  }

  equals(other: CNPJ): boolean {
    return this._value === other._value;
  }
}
