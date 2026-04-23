import { Money } from "@/domain/value-objects/Money";

export type CreditRequestStatus =
  | "RASCUNHO"
  | "SOLICITADA"
  | "EM_ANALISE"
  | "EM_APROVACAO"
  | "APROVADA"
  | "REJEITADA"
  | "CANCELADA";

export type ApprovalTier =
  | "LIDER"
  | "COORDENADOR"
  | "GERENTE"
  | "GERENTE_GERAL"
  | "DIRETORIA";

export interface CreditRequestProps {
  id: string;
  numeroSolicitacao: string;
  customerId: string;
  valorSolicitado: Money;
  valorAprovado?: Money;
  bandeiraId: string;
  modalidade: string;
  finalidade: string;
  status: CreditRequestStatus;
  alcadaRequerida: ApprovalTier;
  responsavelAnaliseId?: string;
  dataInclusao: Date;
  dataConclusao?: Date;
  motivoRejeicao?: string;
  observacoes?: string;
  scoreCredito?: number;
}

export class CreditRequest {
  private readonly props: CreditRequestProps;

  private constructor(props: CreditRequestProps) {
    this.props = { ...props };
  }

  static create(props: CreditRequestProps): CreditRequest {
    return new CreditRequest(props);
  }

  static determineApprovalTier(valor: number): ApprovalTier {
    if (valor <= 10_000) return "LIDER";
    if (valor <= 50_000) return "COORDENADOR";
    if (valor <= 200_000) return "GERENTE";
    if (valor <= 1_000_000) return "GERENTE_GERAL";
    return "DIRETORIA";
  }

  get id() { return this.props.id; }
  get numeroSolicitacao() { return this.props.numeroSolicitacao; }
  get customerId() { return this.props.customerId; }
  get valorSolicitado() { return this.props.valorSolicitado; }
  get valorAprovado() { return this.props.valorAprovado; }
  get bandeiraId() { return this.props.bandeiraId; }
  get modalidade() { return this.props.modalidade; }
  get finalidade() { return this.props.finalidade; }
  get status() { return this.props.status; }
  get alcadaRequerida() { return this.props.alcadaRequerida; }
  get responsavelAnaliseId() { return this.props.responsavelAnaliseId; }
  get dataInclusao() { return this.props.dataInclusao; }
  get dataConclusao() { return this.props.dataConclusao; }
  get motivoRejeicao() { return this.props.motivoRejeicao; }
  get observacoes() { return this.props.observacoes; }
  get scoreCredito() { return this.props.scoreCredito; }

  isActive(): boolean {
    return !["APROVADA", "REJEITADA", "CANCELADA"].includes(this.props.status);
  }

  canBeApprovedBy(tier: ApprovalTier): boolean {
    const order: ApprovalTier[] = [
      "LIDER", "COORDENADOR", "GERENTE", "GERENTE_GERAL", "DIRETORIA",
    ];
    return order.indexOf(tier) >= order.indexOf(this.props.alcadaRequerida);
  }

  withStatus(status: CreditRequestStatus, extra?: Partial<CreditRequestProps>): CreditRequest {
    return CreditRequest.create({ ...this.props, status, ...extra });
  }

  toPlain(): CreditRequestProps {
    return { ...this.props };
  }
}
