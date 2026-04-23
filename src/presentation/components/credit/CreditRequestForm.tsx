'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GlassCard } from '@/presentation/components/ui/GlassCard';
import { AeroButton } from '@/presentation/components/ui/AeroButton';
import { AeroInput, AeroSelect, AeroTextarea } from '@/presentation/components/ui/AeroInput';
import {
  createCreditRequestSchema,
  type CreateCreditRequestFormValues,
} from '@/application/validation/schemas';
import { maskCPF, maskCNPJ, maskPhone, maskCEP } from '@/lib/masks';
import type { CreateCreditRequestDTO } from '@/application/dtos/CreditRequestDTO';

const BANDEIRAS = [
  { value: 'bandeira-visa',      label: 'Visa' },
  { value: 'bandeira-master',    label: 'Mastercard' },
  { value: 'bandeira-hipercard', label: 'Hipercard' },
  { value: 'bandeira-elo',       label: 'Elo' },
];

const MODALIDADES = [
  { value: 'CREDITO_PESSOAL',   label: 'Crédito Pessoal' },
  { value: 'CREDITO_PARCELADO', label: 'Crédito Parcelado' },
  { value: 'CAPITAL_GIRO',      label: 'Capital de Giro' },
  { value: 'FINANCIAMENTO',     label: 'Financiamento' },
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
    control,
    resetField,
    formState: { errors },
  } = useForm<CreateCreditRequestFormValues>({
    resolver: zodResolver(createCreditRequestSchema),
    defaultValues: { customerTipo: 'PF' },
  });

  const tipo = watch('customerTipo');

  // Reset document field when tipo switches so stale value doesn't persist
  useEffect(() => {
    resetField('customerDocumento');
  }, [tipo, resetField]);

  const handleFormSubmit = async (values: CreateCreditRequestFormValues) => {
    await onSubmit({
      ...values,
      customerDocumento: values.customerDocumento.replace(/\D/g, ''),
      customerCep: values.customerCep || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6" noValidate>
      {/* Section 1: Customer */}
      <GlassCard>
        <h2 className="text-sm font-bold text-text mb-5 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
          Dados do Cliente
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tipo selector */}
          <div className="sm:col-span-2 flex gap-3">
            {(['PF', 'PJ'] as const).map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={t} {...register('customerTipo')} className="accent-orange-500" />
                <span className="text-sm font-medium text-text/80">
                  {t === 'PF' ? 'Pessoa Física (CPF)' : 'Pessoa Jurídica (CNPJ)'}
                </span>
              </label>
            ))}
          </div>

          {/* CPF / CNPJ with mask */}
          <Controller
            name="customerDocumento"
            control={control}
            render={({ field }) => (
              <AeroInput
                label={tipo === 'PF' ? 'CPF' : 'CNPJ'}
                placeholder={tipo === 'PF' ? '000.000.000-00' : '00.000.000/0001-00'}
                error={errors.customerDocumento?.message}
                hint={tipo === 'PF' ? '11 dígitos' : '14 dígitos'}
                required
                value={field.value ?? ''}
                onChange={(e) =>
                  field.onChange(tipo === 'PF' ? maskCPF(e.target.value) : maskCNPJ(e.target.value))
                }
                onBlur={field.onBlur}
              />
            )}
          />

          <AeroInput
            label={tipo === 'PF' ? 'Nome Completo' : 'Razão Social'}
            placeholder={tipo === 'PF' ? 'Nome do cliente' : 'Razão social da empresa'}
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

          {/* Telefone with mask */}
          <Controller
            name="customerTelefone"
            control={control}
            render={({ field }) => (
              <AeroInput
                label="Telefone"
                placeholder="(11) 99999-9999"
                hint="Com DDD"
                error={errors.customerTelefone?.message}
                required
                value={field.value ?? ''}
                onChange={(e) => field.onChange(maskPhone(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />

          <AeroInput
            label="Renda Mensal (R$)"
            type="number"
            placeholder="5000"
            hint="Valor bruto em reais"
            error={errors.customerRenda?.message}
            required
            min={100}
            {...register('customerRenda')}
          />

          {/* CEP optional with mask */}
          <Controller
            name="customerCep"
            control={control}
            render={({ field }) => (
              <AeroInput
                label="CEP (opcional)"
                placeholder="00000-000"
                error={errors.customerCep?.message}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(maskCEP(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
        </div>
      </GlassCard>

      {/* Section 2: Credit request */}
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
            hint="Mínimo R$ 500 · Máximo R$ 10.000.000"
            error={errors.valorSolicitado?.message}
            required
            min={500}
            max={10000000}
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
            placeholder="Ex: Expansão do negócio, capital de giro..."
            hint="Mínimo 10 caracteres"
            error={errors.finalidade?.message}
            required
            {...register('finalidade')}
          />

          <div className="sm:col-span-2">
            <AeroTextarea
              label="Observações"
              placeholder="Informações adicionais sobre a solicitação..."
              hint="Opcional · Máximo 1000 caracteres"
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
