import { useRouter } from 'next/navigation';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { StatusBadge } from '@/presentation/components/ui/StatusBadge';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import type { CreditRequestSummaryDTO } from '@/application/dtos/CreditRequestDTO';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react';

interface RecentRequestsProps {
  requests: CreditRequestSummaryDTO[];
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function RecentRequests({ requests }: RecentRequestsProps) {
  const router = useRouter();
  const recent = requests.slice(0, 6);

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/30">
        <h3 className="text-sm font-bold text-text">Solicitações Recentes</h3>
        <AeroButton
          size="sm"
          variant="ghost"
          onClick={() => router.push('/dashboard/solicitacoes')}
          className="text-xs"
        >
          Ver todas
          <ArrowRight size={12} />
        </AeroButton>
      </div>

      <div className="divide-y divide-white/20">
        {recent.length === 0 && (
          <p className="text-center text-sm text-text-muted/60 py-8">
            Nenhuma solicitação encontrada
          </p>
        )}
        {recent.map((req) => (
          <button
            key={req.id}
            onClick={() => router.push(`/dashboard/solicitacoes/${req.id}`)}
            className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-white/20 transition-colors text-left group"
          >
            {/* Score ring */}
            <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: 'rgba(245,124,0,0.12)',
                color: '#F57C00',
                border: '1.5px solid rgba(245,124,0,0.25)',
              }}
            >
              {req.scoreCredito ? req.scoreCredito.toString().slice(0, 3) : '—'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text truncate">
                {req.customerNome}
              </p>
              <p className="text-xs text-text-muted/70 truncate">
                {req.numeroSolicitacao} · {req.customerDocumento}
              </p>
            </div>

            {/* Value */}
            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-sm font-bold text-text">
                {formatMoney(req.valorSolicitado)}
              </p>
              <p className="text-xs text-text-muted/60">
                {format(req.dataInclusao, 'dd/MM/yy', { locale: ptBR })}
              </p>
            </div>

            {/* Status */}
            <div className="shrink-0">
              <StatusBadge status={req.status} />
            </div>

            <ArrowRight size={14} className="text-text-muted/30 group-hover:text-orange-500 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
