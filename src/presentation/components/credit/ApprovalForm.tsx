'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import { AeroTextarea } from '@/presentation/components/ui/AeroInput';
import {
  approveSchema,
  rejectSchema,
  type ApproveFormValues,
  type RejectFormValues,
} from '@/application/validation/schemas';
import type { CreditRequestSummaryDTO } from '@/application/dtos/CreditRequestDTO';
import type { ApproveCreditRequestDTO, RejectCreditRequestDTO } from '@/application/dtos/CreditRequestDTO';

type Tab = 'approve' | 'reject';

interface ApprovalFormProps {
  request: CreditRequestSummaryDTO;
  onApprove: (dto: Omit<ApproveCreditRequestDTO, 'creditRequestId' | 'usuarioId' | 'usuarioNome' | 'alcada'> & { observacoes?: string }) => Promise<void>;
  onReject: (dto: Omit<RejectCreditRequestDTO, 'creditRequestId' | 'usuarioId' | 'usuarioNome' | 'alcada'> & { motivoRejeicao: string }) => Promise<void>;
  loading?: boolean;
}

function ApproveTab({ onApprove, loading }: { onApprove: (v: ApproveFormValues) => Promise<void>; loading?: boolean }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApproveFormValues>({
    resolver: zodResolver(approveSchema),
  });

  const obs = watch('observacoes') ?? '';

  return (
    <form onSubmit={handleSubmit(onApprove)} className="flex flex-col gap-4" noValidate>
      <AeroTextarea
        label="Observações (opcional)"
        placeholder="Comentários sobre a aprovação..."
        hint={`${obs.length}/500 caracteres`}
        error={errors.observacoes?.message}
        {...register('observacoes')}
      />
      <div className="flex justify-end">
        <AeroButton type="submit" loading={loading}>
          <CheckCircle size={15} /> Confirmar Aprovação
        </AeroButton>
      </div>
    </form>
  );
}

function RejectTab({ onReject, loading }: { onReject: (v: RejectFormValues) => Promise<void>; loading?: boolean }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
  });

  const motivo = watch('motivoRejeicao') ?? '';

  return (
    <form onSubmit={handleSubmit(onReject)} className="flex flex-col gap-4" noValidate>
      <AeroTextarea
        label="Motivo da Rejeição"
        placeholder="Descreva o motivo da rejeição (mínimo 10 caracteres)..."
        hint={`${motivo.length}/500 caracteres`}
        error={errors.motivoRejeicao?.message}
        required
        {...register('motivoRejeicao')}
      />
      <div className="flex justify-end">
        <AeroButton type="submit" variant="danger" loading={loading}>
          <XCircle size={15} /> Confirmar Rejeição
        </AeroButton>
      </div>
    </form>
  );
}

export function ApprovalForm({ request, onApprove, onReject, loading }: ApprovalFormProps) {
  const [tab, setTab] = useState<Tab>('approve');

  if (!['SOLICITADA', 'EM_ANALISE', 'EM_APROVACAO'].includes(request.status)) {
    return null;
  }

  return (
    <GlassCard>
      <h3 className="text-sm font-bold text-text mb-4">Ações</h3>

      {/* Tab toggle */}
      <div className="flex gap-1 mb-5 p-1 bg-white/20 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab('approve')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'approve'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-text/70 hover:text-text hover:bg-white/30'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle size={13} /> Aprovar
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab('reject')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'reject'
              ? 'bg-red-500 text-white shadow-sm'
              : 'text-text/70 hover:text-text hover:bg-white/30'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <XCircle size={13} /> Rejeitar
          </span>
        </button>
      </div>

      {tab === 'approve' ? (
        <ApproveTab onApprove={async (v) => onApprove(v)} loading={loading} />
      ) : (
        <RejectTab onReject={async (v) => onReject(v)} loading={loading} />
      )}
    </GlassCard>
  );
}
