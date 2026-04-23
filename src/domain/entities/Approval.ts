import { ApprovalTier } from "./CreditRequest";

export type ApprovalAction =
  | "APROVADO"
  | "REJEITADO"
  | "DEVOLVIDO"
  | "ENCAMINHADO";

export interface ApprovalProps {
  id: string;
  creditRequestId: string;
  usuarioId: string;
  usuarioNome: string;
  alcada: ApprovalTier;
  acao: ApprovalAction;
  observacoes?: string;
  statusAnterior: string;
  statusNovo: string;
  dataAcao: Date;
}

export class Approval {
  private readonly props: ApprovalProps;

  private constructor(props: ApprovalProps) {
    this.props = { ...props };
  }

  static create(props: ApprovalProps): Approval {
    return new Approval(props);
  }

  get id() { return this.props.id; }
  get creditRequestId() { return this.props.creditRequestId; }
  get usuarioId() { return this.props.usuarioId; }
  get usuarioNome() { return this.props.usuarioNome; }
  get alcada() { return this.props.alcada; }
  get acao() { return this.props.acao; }
  get observacoes() { return this.props.observacoes; }
  get statusAnterior() { return this.props.statusAnterior; }
  get statusNovo() { return this.props.statusNovo; }
  get dataAcao() { return this.props.dataAcao; }

  toPlain(): ApprovalProps {
    return { ...this.props };
  }
}
