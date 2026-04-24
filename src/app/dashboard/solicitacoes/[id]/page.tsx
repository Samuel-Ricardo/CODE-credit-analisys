'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RepositoryFactory } from '@/infrastructure/factories/RepositoryFactory';
import { ListCreditRequestsUseCase } from '@/application/use-cases/ListCreditRequestsUseCase';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import { StatusBadge, RiskBadge } from '@/presentation/components/ui/StatusBadge';
import { ScoreGauge } from '@/presentation/components/ui/ScoreGauge';
import { ApprovalForm } from '@/presentation/components/credit/ApprovalForm';
import type { CreditRequestSummaryDTO } from '@/application/dtos/CreditRequestDTO';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, XCircle } from 'lucide-react';
import { useCreditContext } from '@/presentation/contexts/CreditContext';

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const TIER_LABEL: Record<string, string> = {
  LIDER: 'Líder', COORDENADOR: 'Coordenador', GERENTE: 'Gerente',
  GERENTE_GERAL: 'Gerente Geral', DIRETORIA: 'Diretoria',
};

export default function SolicitacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { approveRequest, rejectRequest, loading } = useCreditContext();
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

  const handleApprove = async ({ observacoes }: { observacoes?: string }) => {
    if (!request) return;
    const updated = await approveRequest({
      creditRequestId: request.id,
      usuarioId: 'user-current',
      usuarioNome: 'Ana Ferreira',
      alcada: 'GERENTE',
      observacoes,
    });
    setRequest(updated);
  };

  const handleReject = async ({ motivoRejeicao }: { motivoRejeicao: string }) => {
    if (!request) return;
    const updated = await rejectRequest({
      creditRequestId: request.id,
      usuarioId: 'user-current',
      usuarioNome: 'Ana Ferreira',
      alcada: 'GERENTE',
      motivoRejeicao,
    });
    setRequest(updated);
  };

  if (notFound) {
    return (
      <GlassCard className="text-center py-16">
        <p className="text-lg font-bold text-text">Solicitação não encontrada</p>
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
              <h1 className="text-xl font-bold text-text">{request.customerNome}</h1>
              <StatusBadge status={request.status} />
              {request.risco && <RiskBadge risk={request.risco} />}
            </div>
            <p className="text-sm text-text-muted/70 mb-3">
              {request.numeroSolicitacao} · {request.customerDocumento}
            </p>
            <div className="flex flex-wrap gap-5 text-sm">
              <div>
                <p className="text-[10px] text-text-muted/60 uppercase tracking-wide">Solicitado</p>
                <p className="font-bold text-text text-base">{formatMoney(request.valorSolicitado)}</p>
              </div>
              {request.valorAprovado != null && (
                <div>
                  <p className="text-[10px] text-text-muted/60 uppercase tracking-wide">Aprovado</p>
                  <p className="font-bold text-green-600 text-base">{formatMoney(request.valorAprovado)}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-text-muted/60 uppercase tracking-wide">Alçada</p>
                <p className="font-semibold text-text">{TIER_LABEL[request.alcadaRequerida]}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted/60 uppercase tracking-wide">Data</p>
                <p className="font-semibold text-text">
                  {format(request.dataInclusao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Status timeline */}
      <GlassCard>
        <h3 className="text-sm font-bold text-text mb-4">Linha do Tempo</h3>
        <div className="flex items-center gap-2 text-xs">
          {['RASCUNHO', 'SOLICITADA', 'EM_ANALISE', 'EM_APROVACAO', 'APROVADA'].map((s, idx, arr) => {
            const statuses = ['RASCUNHO', 'SOLICITADA', 'EM_ANALISE', 'EM_APROVACAO', 'APROVADA', 'REJEITADA', 'CANCELADA'];
            const currentIdx = statuses.indexOf(request.status);
            const stepIdx = statuses.indexOf(s);
            const done = currentIdx >= stepIdx && request.status !== 'REJEITADA';
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${done ? 'bg-orange-500 text-white' : 'bg-white/40 text-text-muted/50 border border-white/60'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={done ? 'text-orange-600 font-semibold' : 'text-text-muted/50'}>
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

      {/* Rejection motivo */}
      {request.status === 'REJEITADA' && request.motivoRejeicao && (
        <GlassCard>
          <h3 className="text-sm font-bold text-red-500 mb-2">Motivo da Rejeição</h3>
          <p className="text-sm text-text">{request.motivoRejeicao}</p>
        </GlassCard>
      )}

      {/* Approval / rejection form */}
      <ApprovalForm
        request={request}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={loading}
      />
    </div>
  );
}
