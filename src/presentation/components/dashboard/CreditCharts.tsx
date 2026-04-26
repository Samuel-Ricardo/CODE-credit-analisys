'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import type { DailyVolumeDTO, ScoreDistributionDTO } from '@/application/dtos/DashboardStatsDTO';

interface VolumeChartProps {
  data: DailyVolumeDTO[];
}

interface ScoreChartProps {
  data: ScoreDistributionDTO[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-text mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function VolumeChart({ data }: VolumeChartProps) {
  return (
    <GlassCard>
      <h3 className="text-sm font-bold text-text mb-4">Volume dos Últimos 7 Dias</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="solGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F57C00" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#F57C00" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="aprovGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#4CAF50" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="data" tick={{ fontSize: 11, fill: '#4a4a6a' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#4a4a6a' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="solicitacoes"
            name="Solicitações"
            stroke="#F57C00"
            strokeWidth={2}
            fill="url(#solGrad)"
            dot={{ r: 3, fill: '#F57C00' }}
          />
          <Area
            type="monotone"
            dataKey="aprovacoes"
            name="Aprovações"
            stroke="#4CAF50"
            strokeWidth={2}
            fill="url(#aprovGrad)"
            dot={{ r: 3, fill: '#4CAF50' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

const SCORE_COLORS = ['#F44336', '#FF5722', '#FF9800', '#8BC34A', '#4CAF50'];

export function ScoreDistributionChart({ data }: ScoreChartProps) {
  return (
    <GlassCard>
      <h3 className="text-sm font-bold text-text mb-4">Distribuição de Score</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#4a4a6a' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#4a4a6a' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="Clientes" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={SCORE_COLORS[i]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
