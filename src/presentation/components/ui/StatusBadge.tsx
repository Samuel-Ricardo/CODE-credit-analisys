import { clsx } from "clsx";
import type { CreditRequestStatus } from "@/domain/entities/CreditRequest";
import type { RiskLevel } from "@/domain/entities/CreditScore";

const STATUS_CONFIG: Record<
  CreditRequestStatus,
  { label: string; cls: string; dot: string }
> = {
  RASCUNHO:     { label: "Rascunho",      cls: "badge badge-draft",    dot: "bg-gray-400" },
  SOLICITADA:   { label: "Solicitada",    cls: "badge badge-analysis", dot: "bg-sky-400" },
  EM_ANALISE:   { label: "Em Análise",    cls: "badge badge-pending",  dot: "bg-orange-400" },
  EM_APROVACAO: { label: "Em Aprovação",  cls: "badge badge-analysis", dot: "bg-purple-400" },
  APROVADA:     { label: "Aprovada",      cls: "badge badge-approved", dot: "bg-green-500" },
  REJEITADA:    { label: "Rejeitada",     cls: "badge badge-rejected", dot: "bg-red-400" },
  CANCELADA:    { label: "Cancelada",     cls: "badge badge-draft",    dot: "bg-gray-400" },
};

const RISK_CONFIG: Record<RiskLevel, { label: string; cls: string; dot: string }> = {
  MUITO_BAIXO: { label: "Muito Baixo", cls: "badge badge-approved", dot: "bg-green-500" },
  BAIXO:       { label: "Baixo",       cls: "badge badge-approved", dot: "bg-green-400" },
  MEDIO:       { label: "Médio",       cls: "badge badge-pending",  dot: "bg-orange-400" },
  ALTO:        { label: "Alto",        cls: "badge badge-rejected", dot: "bg-red-400" },
  MUITO_ALTO:  { label: "Muito Alto",  cls: "badge badge-rejected", dot: "bg-red-600" },
};

interface StatusBadgeProps {
  status: CreditRequestStatus;
  className?: string;
}

interface RiskBadgeProps {
  risk: RiskLevel;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={clsx(cfg.cls, className)}>
      <span className={clsx("inline-block w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const cfg = RISK_CONFIG[risk];
  return (
    <span className={clsx(cfg.cls, className)}>
      <span className={clsx("inline-block w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
