'use client';

import { useRouter } from 'next/navigation';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { StatusBadge, RiskBadge } from '@/presentation/components/ui/StatusBadge';
import { ScoreGauge } from '@/presentation/components/ui/ScoreGauge';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import type { CreditRequestSummaryDTO } from '@/application/dtos/CreditRequestDTO';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, User, Building2 } from 'lucide-react';

interface CreditRequestCardProps {
  request: CreditRequestSummaryDTO;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const TIER_LABEL: Record<string, string> = {
  LIDER: 'Líder',
  COORDENADOR: 'Coordenador',
  GERENTE: 'Gerente',
  GERENTE_GERAL: 'Gerente Geral',
  DIRETORIA: 'Diretoria',
};

export function CreditRequestCard({ request }: CreditRequestCardProps) {
  const router = useRouter();

  return (
    <GlassCard className="hover:shadow-[0_12px_40px_rgba(245,124,0,0.15)] transition-shadow">
      <div className="flex items-start gap-4">
        {/* Score / avatar */}
        <div className="shrink-0">
          {request.scoreCredito ? (
            <ScoreGauge score={request.scoreCredito} size={90} strokeWidth={7} />
          ) : (
            <div className="w-22.5 h-22.5 rounded-full flex items-center justify-center bg-white/20 border border-white/40">
              {request.customerTipo === 'PF'
                ? <User size={28} className="text-text-muted/50" />
                : <Building2 size={28} className="text-text-muted/50" />
              }
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-[15px] font-bold text-text leading-tight">
                {request.customerNome}
              </p>
              <p className="text-xs text-text-muted/70 mt-0.5">
                {request.customerDocumento} · {request.numeroSolicitacao}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
            <div>
              <p className="text-[10px] text-text-muted/60 uppercase tracking-wide">Solicitado</p>
              <p className="text-sm font-bold text-text">
                {formatMoney(request.valorSolicitado)}
              </p>
            </div>
            {request.valorAprovado != null && (
              <div>
                <p className="text-[10px] text-text-muted/60 uppercase tracking-wide">Aprovado</p>
                <p className="text-sm font-bold text-green-600">
                  {formatMoney(request.valorAprovado)}
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-text-muted/60 uppercase tracking-wide">Alçada</p>
              <p className="text-sm font-semibold text-text">
                {TIER_LABEL[request.alcadaRequerida]}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted/60 uppercase tracking-wide">Data</p>
              <p className="text-sm font-semibold text-text">
                {format(request.dataInclusao, 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
            {request.risco && (
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] text-text-muted/60 uppercase tracking-wide">Risco</p>
                <RiskBadge risk={request.risco} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <AeroButton
          size="sm"
          variant="ghost"
          onClick={() => router.push(`/dashboard/solicitacoes/${request.id}`)}
        >
          Ver detalhes
          <ArrowRight size={14} />
        </AeroButton>
      </div>
    </GlassCard>
  );
}
