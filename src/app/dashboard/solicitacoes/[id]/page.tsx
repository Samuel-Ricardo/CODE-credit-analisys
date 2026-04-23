'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RepositoryFactory } from '@/infrastructure/factories/RepositoryFactory';
import { ListCreditRequestsUseCase } from '@/application/use-cases/ListCreditRequestsUseCase';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import { StatusBadge, RiskBadge } from '@/presentation/components/ui/StatusBadge';
import { ScoreGauge } from '@/presentation/components/ui/ScoreGauge';
import type { CreditRequestSummaryDTO } from '@/application/dtos/CreditRequestDTO';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useCreditContext } from '@/presentation/contexts/CreditContext';

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const TIER_LABEL: Record<string, string> = {
  LIDER: 'Líder', COORDENADOR: 'Coordenador', GERENTE: 'Gerente',
  GERENTE_GERAL: 'Gerente Geral', DIRETORIA: 'Diretoria',
};

const MODALIDADE_LABEL: Record<string, string> = {
  CREDITO_PESSOAL: 'Crédito Pessoal', CREDITO_PARCELADO: 'Crédito Parcelado',
  CAPITAL_GIRO: 'Capital de Giro', FINANCIAMENTO: 'Financiamento',
};

export default function SolicitacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { approveRequest, loading } = useCreditContext();
  const [request, setRequest] = useState<CreditRequestSummaryDTO | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      const repo = RepositoryFactory.getCreditRequestRepository();
      const customerRepo = RepositoryFactory.getCustomerRepository();
      const uc = new ListCreditRequestsUseCase(repo, customerRepo);
      const { items } = await uc.execute({ filters: { limit: 999 } });
      const found = items.find((r) => r.id === id);
      if (found) setRequest(found);
      else setNotFound(true);
    };
    load();
  }, [id]);

  const handleApprove = async () => {
    if (!request) return;
    const updated = await approveRequest({
      creditRequestId: request.id,
      usuarioId: 'user-current',
      usuarioNome: 'Ana Ferreira',
      alcada: 'GERENTE',
    });
    setRequest(updated);
  };

  if (notFound) {
    return (
      <GlassCard className="text-center py-16">
        <p className="text-lg font-bold text-[#1a1a2e]">Solicitação não encontrada</p>
        <AeroButton className="mt-4" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Voltar
        </AeroButton>
      </GlassCard>
    );
  }

  if (!request) {
    return <GlassCard className="h-64 animate-pulse bg-white/30" />;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <AeroButton variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft size={14} /> Voltar
      </AeroButton>

      {/* Header card */}
      <GlassCard variant="orange">
        <div className="flex items-start gap-5 flex-wrap">
          {request.scoreCredito && (
            <ScoreGauge score={request.scoreCredito} size={110} />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <h1 className="text-xl font-bold text-[#1a1a2e]">{request.customerNome}</h1>
              <StatusBadge status={request.status} />
              {request.risco && <RiskBadge risk={request.risco} />}
            </div>
            <p className="text-sm text-[#4a4a6a]/70 mb-3">
              {request.numeroSolicitacao} · {request.customerDocumento}
            </p>
            <div className="flex flex-wrap gap-5 text-sm">
              <div>
                <p className="text-[10px] text-[#4a4a6a]/60 uppercase tracking-wide">Solicitado</p>
                <p className="font-bold text-[#1a1a2e] text-base">{formatMoney(request.valorSolicitado)}</p>
              </div>
              {request.valorAprovado != null && (
                <div>
                  <p className="text-[10px] text-[#4a4a6a]/60 uppercase tracking-wide">Aprovado</p>
                  <p className="font-bold text-green-600 text-base">{formatMoney(request.valorAprovado)}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-[#4a4a6a]/60 uppercase tracking-wide">Alçada</p>
                <p className="font-semibold text-[#1a1a2e]">{TIER_LABEL[request.alcadaRequerida]}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#4a4a6a]/60 uppercase tracking-wide">Data</p>
                <p className="font-semibold text-[#1a1a2e]">
                  {format(request.dataInclusao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Status timeline */}
      <GlassCard>
        <h3 className="text-sm font-bold text-[#1a1a2e] mb-4">Linha do Tempo</h3>
        <div className="flex items-center gap-2 text-xs">
          {['RASCUNHO', 'SOLICITADA', 'EM_ANALISE', 'EM_APROVACAO', 'APROVADA'].map((s, idx, arr) => {
            const statuses = ['RASCUNHO', 'SOLICITADA', 'EM_ANALISE', 'EM_APROVACAO', 'APROVADA', 'REJEITADA', 'CANCELADA'];
            const currentIdx = statuses.indexOf(request.status);
            const stepIdx = statuses.indexOf(s);
            const done = currentIdx >= stepIdx && request.status !== 'REJEITADA';
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${done ? 'bg-orange-500 text-white' : 'bg-white/40 text-[#4a4a6a]/50 border border-white/60'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={done ? 'text-orange-600 font-semibold' : 'text-[#4a4a6a]/50'}>
                    {s.replace('_', ' ')}
                  </p>
                </div>
                {idx < arr.length - 1 && (
                  <div className={`flex-1 h-px max-w-8 ${done ? 'bg-orange-400' : 'bg-white/40'}`} />
                )}
              </div>
            );
          })}
          {request.status === 'REJEITADA' && (
            <div className="flex items-center gap-1 text-red-500 font-semibold">
              <XCircle size={14} /> Rejeitada
            </div>
          )}
        </div>
      </GlassCard>

      {/* Actions */}
      {['SOLICITADA', 'EM_ANALISE', 'EM_APROVACAO'].includes(request.status) && (
        <GlassCard>
          <h3 className="text-sm font-bold text-[#1a1a2e] mb-4">Ações</h3>
          <div className="flex gap-3">
            <AeroButton onClick={handleApprove} loading={loading}>
              <CheckCircle size={15} /> Aprovar Solicitação
            </AeroButton>
            <AeroButton variant="danger">
              <XCircle size={15} /> Rejeitar
            </AeroButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
