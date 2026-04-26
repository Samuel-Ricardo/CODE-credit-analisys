import { CreditRequestStatus } from "@/domain/entities/CreditRequest";

export interface DashboardStatsDTO {
  totalSolicitacoes: number;
  solicitacoesPendentes: number;
  solicitacoesAprovadas: number;
  solicitacoesRejeitadas: number;
  valorTotalAprovado: number;
  valorTotalSolicitado: number;
  taxaAprovacao: number; // 0-100
  scoreMediano: number;
  solicitacoesPorStatus: StatusCountDTO[];
  volumePorDia: DailyVolumeDTO[];
  distribuicaoScore: ScoreDistributionDTO[];
}

export interface StatusCountDTO {
  status: CreditRequestStatus;
  label: string;
  count: number;
  color: string;
}

export interface DailyVolumeDTO {
  data: string; // dd/MM
  solicitacoes: number;
  aprovacoes: number;
  valor: number;
}

export interface ScoreDistributionDTO {
  range: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}
