'use client';

import { useEffect } from 'react';
import { useCreditContext } from '@/presentation/contexts/CreditContext';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { CreditRequestCard } from '@/presentation/components/credit/CreditRequestCard';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import { CheckSquare } from 'lucide-react';

export default function AprovacoesPage() {
  const { requests, loading, loadRequests } = useCreditContext();

  useEffect(() => {
    loadRequests({ status: ['SOLICITADA', 'EM_ANALISE', 'EM_APROVACAO'] });
  }, []);

  const pendentes = requests.filter((r) =>
    ['SOLICITADA', 'EM_ANALISE', 'EM_APROVACAO'].includes(r.status),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1a1a2e]">Aprovações</h2>
          <p className="text-xs text-[#4a4a6a]/70">
            {pendentes.length} solicitaç{pendentes.length !== 1 ? 'ões' : 'ão'} aguardando análise
          </p>
        </div>
        <AeroButton
          variant="ghost"
          size="sm"
          onClick={() => loadRequests({ status: ['SOLICITADA', 'EM_ANALISE', 'EM_APROVACAO'] })}
          loading={loading}
        >
          Atualizar
        </AeroButton>
      </div>

      {loading && (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} className="h-32 animate-pulse bg-white/30" />
          ))}
        </div>
      )}

      {!loading && pendentes.length === 0 && (
        <GlassCard className="py-16 text-center">
          <CheckSquare size={40} className="mx-auto text-green-500 mb-3" />
          <p className="text-sm font-medium text-[#4a4a6a]/70">
            Nenhuma solicitação pendente!
          </p>
          <p className="text-xs text-[#4a4a6a]/50 mt-1">
            Todas as solicitações foram processadas.
          </p>
        </GlassCard>
      )}

      <div className="grid gap-4">
        {pendentes.map((req) => (
          <CreditRequestCard key={req.id} request={req} />
        ))}
      </div>
    </div>
  );
}
