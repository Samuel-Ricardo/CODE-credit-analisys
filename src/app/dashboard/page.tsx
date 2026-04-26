'use client';

import { useEffect } from 'react';
import { useCreditContext } from '@/presentation/contexts/CreditContext';
import { StatsCards } from '@/presentation/components/dashboard/StatsCards';
import { VolumeChart, ScoreDistributionChart } from '@/presentation/components/dashboard/CreditCharts';
import { RecentRequests } from '@/presentation/components/dashboard/RecentRequests';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { dashboardStats, requests, loading, loadDashboard, loadRequests } = useCreditContext();
  const router = useRouter();

  useEffect(() => {
    loadDashboard();
    loadRequests();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">Visão Geral</h2>
          <p className="text-xs text-text-muted/70">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <AeroButton
            variant="ghost"
            size="sm"
            onClick={() => { loadDashboard(); loadRequests(); }}
            loading={loading}
          >
            <RefreshCw size={14} />
            Atualizar
          </AeroButton>
          <AeroButton
            size="sm"
            onClick={() => router.push('/dashboard/solicitacoes/nova')}
          >
            <Plus size={14} />
            Nova Solicitação
          </AeroButton>
        </div>
      </div>

      {/* Stats grid */}
      {dashboardStats ? (
        <StatsCards stats={dashboardStats} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="h-28 animate-pulse bg-white/30" />
          ))}
        </div>
      )}

      {/* Charts row */}
      {dashboardStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <VolumeChart data={dashboardStats.volumePorDia} />
          </div>
          <ScoreDistributionChart data={dashboardStats.distribuicaoScore} />
        </div>
      )}

      {/* Recent requests */}
      <RecentRequests requests={requests} />
    </div>
  );
}
