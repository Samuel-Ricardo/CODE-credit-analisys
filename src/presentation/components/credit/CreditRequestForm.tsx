'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import { AeroInput, AeroSelect, AeroTextarea } from '@/presentation/components/ui/AeroInput';
import { CPF } from '@/domain/value-objects/CPF';
import { CNPJ } from '@/domain/value-objects/CNPJ';
import type { CreateCreditRequestDTO } from '@/application/dtos/CreditRequestDTO';

const schema = z.object({
  customerTipo: z.enum(['PF', 'PJ']),
  customerDocumento: z.string().min(11, 'Documento obrigatório').refine(
    (val) => {
      const clean = val.replace(/\D/g, '');
      return CPF.isValid(clean) || CNPJ.isValid(clean);
    },
    'CPF ou CNPJ inválido',
  ),
  customerNome: z.string().min(3, 'Nome obrigatório'),
  customerEmail: z.string().email('E-mail inválido'),
  customerTelefone: z.string().min(8, 'Telefone obrigatório'),
  customerRenda: z.coerce.number().positive('Informe a renda mensal'),
  valorSolicitado: z.coerce.number().positive('Valor obrigatório').min(500, 'Mínimo R$ 500'),
  bandeiraId: z.string().min(1, 'Selecione a bandeira'),
  modalidade: z.string().min(1, 'Selecione a modalidade'),
  finalidade: z.string().min(3, 'Informe a finalidade'),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const BANDEIRAS = [
  { value: 'bandeira-visa',      label: 'Visa' },
  { value: 'bandeira-master',    label: 'Mastercard' },
  { value: 'bandeira-hipercard', label: 'Hipercard' },
  { value: 'bandeira-elo',       label: 'Elo' },
];

const MODALIDADES = [
  { value: 'CREDITO_PESSOAL',  label: 'Crédito Pessoal' },
  { value: 'CREDITO_PARCELADO',label: 'Crédito Parcelado' },
  { value: 'CAPITAL_GIRO',     label: 'Capital de Giro' },
  { value: 'FINANCIAMENTO',    label: 'Financiamento' },
];

interface CreditRequestFormProps {
  onSubmit: (dto: CreateCreditRequestDTO) => Promise<void>;
  loading?: boolean;
}

export function CreditRequestForm({ onSubmit, loading }: CreditRequestFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { customerTipo: 'PF' },
  });

  const tipo = watch('customerTipo');

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit({
      ...values,
      customerCep: undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      {/* Section: Customer */}
      <GlassCard>
        <h2 className="text-sm font-bold text-text mb-5 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
          Dados do Cliente
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tipo */}
          <div className="sm:col-span-2 flex gap-3">
            {(['PF', 'PJ'] as const).map((t) => (
              <label
                key={t}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  value={t}
                  {...register('customerTipo')}
                  className="accent-orange-500"
                />
                <span className="text-sm font-medium text-text/80">
                  {t === 'PF' ? 'Pessoa Física (CPF)' : 'Pessoa Jurídica (CNPJ)'}
                </span>
              </label>
            ))}
          </div>

          <AeroInput
            label={tipo === 'PF' ? 'CPF' : 'CNPJ'}
            placeholder={tipo === 'PF' ? '000.000.000-00' : '00.000.000/0001-00'}
            error={errors.customerDocumento?.message}
            required
            {...register('customerDocumento')}
          />

          <AeroInput
            label={tipo === 'PF' ? 'Nome Completo' : 'Razão Social'}
            placeholder="Nome do cliente"
            error={errors.customerNome?.message}
            required
            {...register('customerNome')}
          />

          <AeroInput
            label="E-mail"
            type="email"
            placeholder="email@exemplo.com"
            error={errors.customerEmail?.message}
            required
            {...register('customerEmail')}
          />

          <AeroInput
            label="Telefone"
            placeholder="(11) 99999-9999"
            error={errors.customerTelefone?.message}
            required
            {...register('customerTelefone')}
          />

          <AeroInput
            label="Renda Mensal (R$)"
            type="number"
            placeholder="5000"
            error={errors.customerRenda?.message}
            required
            {...register('customerRenda')}
          />
        </div>
      </GlassCard>

      {/* Section: Credit */}
      <GlassCard>
        <h2 className="text-sm font-bold text-text mb-5 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">2</span>
          Dados da Solicitação
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AeroInput
            label="Valor Solicitado (R$)"
            type="number"
            placeholder="50000"
            error={errors.valorSolicitado?.message}
            required
            {...register('valorSolicitado')}
          />

          <AeroSelect
            label="Bandeira"
            options={BANDEIRAS}
            error={errors.bandeiraId?.message}
            required
            {...register('bandeiraId')}
          />

          <AeroSelect
            label="Modalidade"
            options={MODALIDADES}
            error={errors.modalidade?.message}
            required
            {...register('modalidade')}
          />

          <AeroInput
            label="Finalidade"
            placeholder="Descreva a finalidade do crédito"
            error={errors.finalidade?.message}
            required
            {...register('finalidade')}
          />

          <div className="sm:col-span-2">
            <AeroTextarea
              label="Observações"
              placeholder="Informações adicionais..."
              {...register('observacoes')}
            />
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <AeroButton type="submit" size="lg" loading={loading}>
          Enviar Solicitação
        </AeroButton>
      </div>
    </form>
  );
}
