import { CreditRequestStatus, ApprovalTier } from "@/domain/entities/CreditRequest";
import { CustomerType } from "@/domain/entities/Customer";
import { RiskLevel } from "@/domain/entities/CreditScore";

// ── Input DTOs ───────────────────────────────────────────────

export interface CreateCreditRequestDTO {
  customerDocumento: string;
  customerNome: string;
  customerTipo: CustomerType;
  customerEmail: string;
  customerTelefone: string;
  customerRenda: number;
  customerCep?: string;
  valorSolicitado: number;
  bandeiraId: string;
  modalidade: string;
  finalidade: string;
  observacoes?: string;
}

export interface ApproveCreditRequestDTO {
  creditRequestId: string;
  usuarioId: string;
  usuarioNome: string;
  alcada: ApprovalTier;
  observacoes?: string;
}

export interface RejectCreditRequestDTO {
  creditRequestId: string;
  usuarioId: string;
  usuarioNome: string;
  alcada: ApprovalTier;
  motivoRejeicao: string;
}

// ── Output DTOs ──────────────────────────────────────────────

export interface ScoreFactorDTO {
  fator: string;
  impacto: number;
  descricao: string;
}

export interface ApprovalHistoryDTO {
  id: string;
  usuarioNome: string;
  alcada: ApprovalTier;
  acao: string;
  observacoes?: string;
  statusAnterior: string;
  statusNovo: string;
  dataAcao: Date;
}

export interface CreditRequestSummaryDTO {
  id: string;
  numeroSolicitacao: string;
  customerNome: string;
  customerDocumento: string;
  customerTipo: CustomerType;
  valorSolicitado: number;
  valorAprovado?: number;
  status: CreditRequestStatus;
  alcadaRequerida: ApprovalTier;
  scoreCredito?: number;
  risco?: RiskLevel;
  dataInclusao: Date;
  dataConclusao?: Date;
}

export interface CreditRequestDetailDTO extends CreditRequestSummaryDTO {
  modalidade: string;
  finalidade: string;
  bandeiraId: string;
  observacoes?: string;
  motivoRejeicao?: string;
  responsavelAnaliseId?: string;
  historicoAprovacoes: ApprovalHistoryDTO[];
  fatoresScore: ScoreFactorDTO[];
  customerEmail: string;
  customerTelefone: string;
  customerRenda: number;
}
