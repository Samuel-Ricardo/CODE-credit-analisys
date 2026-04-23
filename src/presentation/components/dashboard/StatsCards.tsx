import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import type { DashboardStatsDTO } from '@/application/dtos/DashboardStatsDTO';

interface StatsCardsProps {
  stats: DashboardStatsDTO;
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return `R$ ${value.toFixed(0)}`;
}

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  accent: 'orange' | 'green' | 'red' | 'sky';
}

const ACCENT_MAP = {
  orange: {
    icon: 'bg-orange-500/15 text-orange-600',
    value: 'text-orange-700',
    glow: 'shadow-[0_0_24px_rgba(245,124,0,0.12)]',
  },
  green: {
    icon: 'bg-green-500/15 text-green-600',
    value: 'text-green-700',
    glow: 'shadow-[0_0_24px_rgba(76,175,80,0.1)]',
  },
  red: {
    icon: 'bg-red-400/15 text-red-500',
    value: 'text-red-600',
    glow: 'shadow-[0_0_24px_rgba(239,83,80,0.1)]',
  },
  sky: {
    icon: 'bg-sky-500/15 text-sky-600',
    value: 'text-sky-700',
    glow: 'shadow-[0_0_24px_rgba(41,182,246,0.1)]',
  },
};

function StatCard({ title, value, sub, trend, trendLabel, accent }: StatCardProps) {
  const colors = ACCENT_MAP[accent];
  return (
    <GlassCard className={clsx('flex flex-col gap-3', colors.glow)}>
      <p className="text-sm font-medium text-text-muted/80">{title}</p>
      <p className={clsx('text-3xl font-bold tracking-tight stat-glow', colors.value)}>
        {value}
      </p>
      <div className="flex items-center gap-1.5">
        {trend === 'up' && <TrendingUp size={12} className="text-green-500" />}
        {trend === 'down' && <TrendingDown size={12} className="text-red-400" />}
        {trend === 'neutral' && <Minus size={12} className="text-text-muted/40" />}
        <span className="text-xs text-text-muted/60">{sub ?? trendLabel}</span>
      </div>
    </GlassCard>
  );
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Solicitações"
        value={String(stats.totalSolicitacoes)}
        sub={`${stats.solicitacoesPendentes} pendentes`}
        trend="up"
        accent="orange"
      />
      <StatCard
        title="Aprovadas"
        value={String(stats.solicitacoesAprovadas)}
        sub={`Taxa ${stats.taxaAprovacao.toFixed(1)}%`}
        trend="up"
        accent="green"
      />
      <StatCard
        title="Rejeitadas"
        value={String(stats.solicitacoesRejeitadas)}
        sub="Este período"
        trend="neutral"
        accent="red"
      />
      <StatCard
        title="Volume Aprovado"
        value={formatCurrency(stats.valorTotalAprovado)}
        sub={`Score médio: ${stats.scoreMediano}`}
        trend="up"
        accent="sky"
      />
    </div>
  );
}
