'use client';

import { useEffect } from 'react';
import { useCreditContext } from '@/presentation/contexts/CreditContext';
import { StatsCards } from '@/presentation/components/dashboard/StatsCards';
import { VolumeChart, ScoreDistributionChart } from '@/presentation/components/dashboard/CreditCharts';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import { Download, RefreshCw } from 'lucide-react';

export default function RelatoriosPage() {
  const { dashboardStats, loading, loadDashboard } = useCreditContext();

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleExport = () => {
    if (!dashboardStats) return;
    const json = JSON.stringify(dashboardStats, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-credito-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1a1a2e]">Relatórios</h2>
          <p className="text-xs text-[#4a4a6a]/70">
            Análise consolidada de crédito
          </p>
        </div>
        <div className="flex gap-2">
          <AeroButton variant="ghost" size="sm" onClick={loadDashboard} loading={loading}>
            <RefreshCw size={14} /> Atualizar
          </AeroButton>
          <AeroButton size="sm" onClick={handleExport} disabled={!dashboardStats}>
            <Download size={14} /> Exportar JSON
          </AeroButton>
        </div>
      </div>

      {/* KPIs */}
      {dashboardStats ? (
        <>
          <StatsCards stats={dashboardStats} />

          {/* Summary table */}
          <GlassCard>
            <h3 className="text-sm font-bold text-[#1a1a2e] mb-4">Resumo por Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="text-xs font-semibold text-[#4a4a6a]/60 pb-3 pr-4">Status</th>
                    <th className="text-xs font-semibold text-[#4a4a6a]/60 pb-3 pr-4">Quantidade</th>
                    <th className="text-xs font-semibold text-[#4a4a6a]/60 pb-3">Participação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {dashboardStats.solicitacoesPorStatus
                    .filter((s) => s.count > 0)
                    .sort((a, b) => b.count - a.count)
                    .map((s) => (
                      <tr key={s.status}>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: s.color }}
                            />
                            <span className="font-medium text-[#1a1a2e]">{s.label}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 font-bold text-[#1a1a2e]">{s.count}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/30 rounded-full max-w-24">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(s.count / dashboardStats.totalSolicitacoes) * 100}%`,
                                  background: s.color,
                                }}
                              />
                            </div>
                            <span className="text-xs text-[#4a4a6a]/70">
                              {((s.count / dashboardStats.totalSolicitacoes) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VolumeChart data={dashboardStats.volumePorDia} />
            <ScoreDistributionChart data={dashboardStats.distribuicaoScore} />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="h-28 animate-pulse bg-white/30" />
          ))}
        </div>
      )}
    </div>
  );
}
