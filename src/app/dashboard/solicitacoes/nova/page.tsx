'use client';

import { useRouter } from 'next/navigation';
import { useCreditContext } from '@/presentation/contexts/CreditContext';
import { CreditRequestForm } from '@/presentation/components/credit/CreditRequestForm';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import type { CreateCreditRequestDTO } from '@/application/dtos/CreditRequestDTO';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { ScoreGauge } from '@/presentation/components/ui/ScoreGauge';
import type { CreditRequestSummaryDTO } from '@/application/dtos/CreditRequestDTO';

export default function NovaSolicitacaoPage() {
  const { createRequest, loading } = useCreditContext();
  const router = useRouter();
  const [created, setCreated] = useState<CreditRequestSummaryDTO | null>(null);

  const handleSubmit = async (dto: CreateCreditRequestDTO) => {
    const result = await createRequest(dto);
    setCreated(result);
  };

  if (created) {
    return (
      <div className="max-w-xl mx-auto">
        <GlassCard className="text-center py-10">
          <CheckCircle size={52} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-text mb-1">
            Solicitação Criada!
          </h2>
          <p className="text-sm text-text-muted/70 mb-6">
            {created.numeroSolicitacao} · {created.customerNome}
          </p>

          {created.scoreCredito && (
            <div className="flex justify-center mb-6">
              <ScoreGauge score={created.scoreCredito} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm mb-6">
            <div className="glass rounded-xl p-3">
              <p className="text-[10px] text-text-muted/60 uppercase tracking-wide">Valor</p>
              <p className="font-bold text-text">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(created.valorSolicitado)}
              </p>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-[10px] text-text-muted/60 uppercase tracking-wide">Status</p>
              <p className="font-bold text-text">{created.status}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <AeroButton variant="ghost" onClick={() => router.push('/dashboard/solicitacoes')}>
              Ver todas
            </AeroButton>
            <AeroButton onClick={() => setCreated(null)}>
              Nova solicitação
            </AeroButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <AeroButton
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft size={14} /> Voltar
        </AeroButton>
      </div>

      <CreditRequestForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
