import { ICreditRequestRepository } from "@/domain/repositories/ICreditRequestRepository";
import { DashboardStatsDTO, StatusCountDTO, DailyVolumeDTO, ScoreDistributionDTO } from "../dtos/DashboardStatsDTO";
import { CreditRequestStatus } from "@/domain/entities/CreditRequest";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_META: Record<CreditRequestStatus, { label: string; color: string }> = {
  RASCUNHO:     { label: "Rascunho",      color: "#9E9E9E" },
  SOLICITADA:   { label: "Solicitada",    color: "#2196F3" },
  EM_ANALISE:   { label: "Em Análise",    color: "#FF9800" },
  EM_APROVACAO: { label: "Em Aprovação",  color: "#9C27B0" },
  APROVADA:     { label: "Aprovada",      color: "#4CAF50" },
  REJEITADA:    { label: "Rejeitada",     color: "#F44336" },
  CANCELADA:    { label: "Cancelada",     color: "#607D8B" },
};

export class GetDashboardStatsUseCase {
  constructor(
    private readonly creditRequestRepo: ICreditRequestRepository,
  ) {}

  async execute(): Promise<DashboardStatsDTO> {
    const { items: all } = await this.creditRequestRepo.findAll({ limit: 9999 });

    const aprovadas = all.filter((r) => r.status === "APROVADA");
    const rejeitadas = all.filter((r) => r.status === "REJEITADA");
    const pendentes = all.filter((r) =>
      ["SOLICITADA", "EM_ANALISE", "EM_APROVACAO"].includes(r.status),
    );

    const valorAprovado = aprovadas.reduce(
      (sum, r) => sum + (r.valorAprovado?.value ?? 0),
      0,
    );
    const valorSolicitado = all.reduce(
      (sum, r) => sum + r.valorSolicitado.value,
      0,
    );

    const scores = all
      .map((r) => r.scoreCredito)
      .filter((s): s is number => s !== undefined);
    const scoreMediano = scores.length
      ? scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)]
      : 0;

    const taxaAprovacao = all.length
      ? (aprovadas.length / all.filter((r) => r.status !== "RASCUNHO").length) * 100
      : 0;

    return {
      totalSolicitacoes: all.length,
      solicitacoesPendentes: pendentes.length,
      solicitacoesAprovadas: aprovadas.length,
      solicitacoesRejeitadas: rejeitadas.length,
      valorTotalAprovado: valorAprovado,
      valorTotalSolicitado: valorSolicitado,
      taxaAprovacao: Math.round(taxaAprovacao * 10) / 10,
      scoreMediano,
      solicitacoesPorStatus: this.buildStatusCounts(all),
      volumePorDia: this.buildDailyVolume(all),
      distribuicaoScore: this.buildScoreDistribution(scores),
    };
  }

  private buildStatusCounts(all: import("@/domain/entities/CreditRequest").CreditRequest[]): StatusCountDTO[] {
    const counts = new Map<CreditRequestStatus, number>();
    all.forEach((r) => counts.set(r.status, (counts.get(r.status) ?? 0) + 1));

    return Object.entries(STATUS_META).map(([status, meta]) => ({
      status: status as CreditRequestStatus,
      label: meta.label,
      color: meta.color,
      count: counts.get(status as CreditRequestStatus) ?? 0,
    }));
  }

  private buildDailyVolume(all: import("@/domain/entities/CreditRequest").CreditRequest[]): DailyVolumeDTO[] {
    const days = 7;
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dateStr = format(date, "dd/MM", { locale: ptBR });
      const dayItems = all.filter(
        (r) => format(r.dataInclusao, "dd/MM") === dateStr,
      );
      const aprovadas = dayItems.filter((r) => r.status === "APROVADA");
      return {
        data: dateStr,
        solicitacoes: dayItems.length,
        aprovacoes: aprovadas.length,
        valor: aprovadas.reduce((s, r) => s + (r.valorAprovado?.value ?? 0), 0),
      };
    });
  }

  private buildScoreDistribution(scores: number[]): ScoreDistributionDTO[] {
    const ranges = [
      { range: "300–449", min: 300, max: 449 },
      { range: "450–549", min: 450, max: 549 },
      { range: "550–649", min: 550, max: 649 },
      { range: "650–749", min: 650, max: 749 },
      { range: "750–850", min: 750, max: 850 },
    ];

    return ranges.map((r) => {
      const count = scores.filter((s) => s >= r.min && s <= r.max).length;
      return {
        ...r,
        count,
        percentage: scores.length ? Math.round((count / scores.length) * 100) : 0,
      };
    });
  }
}
