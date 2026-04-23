export interface Address {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export type CustomerType = "PF" | "PJ";

export interface CustomerProps {
  id: string;
  tipo: CustomerType;
  documento: string; // cleaned (digits only)
  nomeRazaoSocial: string;
  nomeFantasia?: string;
  email: string;
  telefone: string;
  renda: number;
  endereco: Address;
  ativo: boolean;
  dataCadastro: Date;
}

export class Customer {
  private readonly props: CustomerProps;

  private constructor(props: CustomerProps) {
    this.props = { ...props };
  }

  static create(props: CustomerProps): Customer {
    return new Customer(props);
  }

  get id() { return this.props.id; }
  get tipo() { return this.props.tipo; }
  get documento() { return this.props.documento; }
  get nomeRazaoSocial() { return this.props.nomeRazaoSocial; }
  get nomeFantasia() { return this.props.nomeFantasia; }
  get email() { return this.props.email; }
  get telefone() { return this.props.telefone; }
  get renda() { return this.props.renda; }
  get endereco() { return this.props.endereco; }
  get ativo() { return this.props.ativo; }
  get dataCadastro() { return this.props.dataCadastro; }

  get documentoFormatado(): string {
    const d = this.props.documento;
    if (this.props.tipo === "PF") {
      return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  isPessoaFisica(): boolean { return this.props.tipo === "PF"; }
  isPessoaJuridica(): boolean { return this.props.tipo === "PJ"; }

  toPlain(): CustomerProps {
    return { ...this.props };
  }
}
