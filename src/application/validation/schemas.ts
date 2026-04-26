import { z } from 'zod';
import { CPF } from '@/domain/value-objects/CPF';
import { CNPJ } from '@/domain/value-objects/CNPJ';

// ── Reusable primitives ───────────────────────────────────────

/** Brazilian phone: (XX) XXXX-XXXX or (XX) XXXXX-XXXX */
const phonePtBR = z
  .string()
  .min(1, 'Telefone obrigatório')
  .regex(
    /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    'Telefone inválido. Ex: (11) 99999-9999',
  );

/** Optional CEP with mask: 00000-000 */
const cepBR = z
  .string()
  .optional()
  .refine(
    (val) => !val || val === '' || /^\d{5}-\d{3}$/.test(val),
    'CEP inválido. Ex: 01310-100',
  );

const moneyMin = (label: string, min: number, max?: number) => {
  let schema = z.coerce
    .number({ invalid_type_error: `${label} deve ser um número válido` })
    .positive(`${label} deve ser maior que zero`)
    .min(min, `${label} mínimo: R$ ${min.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  if (max !== undefined) {
    schema = schema.max(
      max,
      `${label} máximo: R$ ${max.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ) as typeof schema;
  }
  return schema;
};

// ── Credit Request Form Schema ────────────────────────────────

export const createCreditRequestSchema = z
  .object({
    customerTipo: z.enum(['PF', 'PJ'], {
      required_error: 'Selecione o tipo de pessoa',
    }),

    customerDocumento: z
      .string()
      .min(1, 'Documento obrigatório'),

    customerNome: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .max(120, 'Nome muito longo (máximo 120 caracteres)'),

    customerEmail: z
      .string()
      .min(1, 'E-mail obrigatório')
      .email('E-mail inválido'),

    customerTelefone: phonePtBR,

    customerRenda: moneyMin('Renda mensal', 100, 100_000_000),

    customerCep: cepBR,

    valorSolicitado: moneyMin('Valor solicitado', 500, 10_000_000),

    bandeiraId: z.string().min(1, 'Selecione a bandeira'),

    modalidade: z.string().min(1, 'Selecione a modalidade'),

    finalidade: z
      .string()
      .min(10, 'Descreva a finalidade com pelo menos 10 caracteres')
      .max(500, 'Finalidade muito longa (máximo 500 caracteres)'),

    observacoes: z
      .string()
      .max(1000, 'Observações muito longas (máximo 1000 caracteres)')
      .optional(),
  })
  // Cross-field: validate document against tipo
  .superRefine((data, ctx) => {
    const clean = data.customerDocumento.replace(/\D/g, '');
    if (!clean) return;

    if (data.customerTipo === 'PF') {
      if (!CPF.isValid(clean)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CPF inválido. Verifique os dígitos informados',
          path: ['customerDocumento'],
        });
      }
    } else {
      if (!CNPJ.isValid(clean)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CNPJ inválido. Verifique os dígitos informados',
          path: ['customerDocumento'],
        });
      }
    }
  });

export type CreateCreditRequestFormValues = z.infer<typeof createCreditRequestSchema>;

// ── Approve Schema ────────────────────────────────────────────

export const approveSchema = z.object({
  observacoes: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .optional(),
});

export type ApproveFormValues = z.infer<typeof approveSchema>;

// ── Reject Schema ─────────────────────────────────────────────

export const rejectSchema = z.object({
  motivoRejeicao: z
    .string()
    .min(10, 'Informe o motivo com pelo menos 10 caracteres')
    .max(500, 'Motivo muito longo (máximo 500 caracteres)'),
});

export type RejectFormValues = z.infer<typeof rejectSchema>;
