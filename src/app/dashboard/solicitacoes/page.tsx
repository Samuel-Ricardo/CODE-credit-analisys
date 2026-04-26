'use client';

import { useEffect, useState } from 'react';
import { useCreditContext } from '@/presentation/contexts/CreditContext';
import { CreditRequestCard } from '@/presentation/components/credit/CreditRequestCard';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import { AeroInput, AeroSelect } from '@/presentation/components/ui/AeroInput';
import type { CreditRequestStatus } from '@/domain/entities/CreditRequest';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '',             label: 'Todos os status' },
  { value: 'SOLICITADA',   label: 'Solicitada' },
  { value: 'EM_ANALISE',   label: 'Em Análise' },
  { value: 'EM_APROVACAO', label: 'Em Aprovação' },
  { value: 'APROVADA',     label: 'Aprovada' },
  { value: 'REJEITADA',    label: 'Rejeitada' },
];

export default function SolicitacoesPage() {
  const { requests, loading, loadRequests } = useCreditContext();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadRequests({
      status: status ? [status as CreditRequestStatus] : undefined,
      search: search || undefined,
    });
  }, [status, search]);

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-3">
          <div className="flex-1">
            <AeroInput
              placeholder="Buscar por nome, documento ou número..."
              leftIcon={<Search size={14} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-44">
            <AeroSelect
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        </div>
        <AeroButton
          onClick={() => router.push('/dashboard/solicitacoes/nova')}
        >
          <Plus size={15} />
          Nova Solicitação
        </AeroButton>
      </div>

      {/* Count */}
      <p className="text-xs text-text-muted/70">
        {requests.length} solicitação{requests.length !== 1 ? 'ões' : ''} encontrada{requests.length !== 1 ? 's' : ''}
      </p>

      {/* List */}
      {loading && (
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="h-32 animate-pulse bg-white/30" />
          ))}
        </div>
      )}

      {!loading && requests.length === 0 && (
        <GlassCard className="py-16 text-center">
          <Filter size={32} className="mx-auto text-text-muted/30 mb-3" />
          <p className="text-sm font-medium text-text-muted/60">
            Nenhuma solicitação encontrada
          </p>
          <p className="text-xs text-text-muted/40 mt-1">
            Ajuste os filtros ou crie uma nova solicitação
          </p>
          <AeroButton
            className="mt-4 mx-auto"
            onClick={() => router.push('/dashboard/solicitacoes/nova')}
          >
            <Plus size={14} /> Nova Solicitação
          </AeroButton>
        </GlassCard>
      )}

      {!loading && requests.length > 0 && (
        <div className="grid gap-4">
          {requests.map((req) => (
            <CreditRequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
