/**
 * Test Factories — deterministic builders for domain objects.
 * All CPF/CNPJ values used here are mathematically valid.
 */
import { CreditRequest, CreditRequestProps, CreditRequestStatus, ApprovalTier } from '@/domain/entities/CreditRequest';
import { Customer, CustomerProps, CustomerType } from '@/domain/entities/Customer';
import { Approval, ApprovalAction } from '@/domain/entities/Approval';
import { CreditScore } from '@/domain/entities/CreditScore';
import { Money } from '@/domain/value-objects/Money';

// ─── Known-valid documents ───────────────────────────────────────────────────
/** Verified valid CPF: 529.982.247-25 */
export const VALID_CPF_RAW = '52998224725';
export const VALID_CPF_FORMATTED = '529.982.247-25';

/** Verified valid CPF #2: 111.444.777-35 */
export const VALID_CPF_2_RAW = '11144477735';

/** Invalid CPF (wrong last digit) */
export const INVALID_CPF = '52998224726';

/** Verified valid CNPJ: 11.222.333/0001-81 */
export const VALID_CNPJ_RAW = '11222333000181';
export const VALID_CNPJ_FORMATTED = '11.222.333/0001-81';

/** Invalid CNPJ (wrong check digit) */
export const INVALID_CNPJ = '11222333000182';

// ─── Counter for unique IDs ───────────────────────────────────────────────────
let _counter = 0;
function uid(prefix = 'id') {
  return `${prefix}-${++_counter}`;
}

// ─── Customer factory ─────────────────────────────────────────────────────────
interface PartialCustomerProps {
  id?: string;
  tipo?: CustomerType;
  documento?: string;
  nomeRazaoSocial?: string;
  email?: string;
  telefone?: string;
  renda?: number;
  dataCadastro?: Date;
  ativo?: boolean;
}

export function makeCustomer(overrides: PartialCustomerProps = {}): Customer {
  const tipo = overrides.tipo ?? 'PF';
  return Customer.create({
    id: overrides.id ?? uid('customer'),
    tipo,
    documento: overrides.documento ?? (tipo === 'PF' ? VALID_CPF_RAW : VALID_CNPJ_RAW),
    nomeRazaoSocial: overrides.nomeRazaoSocial ?? 'Ana Silva',
    email: overrides.email ?? 'ana@teste.com.br',
    telefone: overrides.telefone ?? '(11) 99999-0001',
    renda: overrides.renda ?? 10000,
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01310-100',
    },
    ativo: overrides.ativo ?? true,
    dataCadastro: overrides.dataCadastro ?? new Date('2023-01-01T00:00:00Z'),
  });
}

export function makePJCustomer(overrides: PartialCustomerProps = {}): Customer {
  return makeCustomer({ tipo: 'PJ', documento: VALID_CNPJ_RAW, nomeRazaoSocial: 'Empresa XYZ Ltda', renda: 500000, ...overrides });
}

// ─── CreditRequest factory ─────────────────────────────────────────────────────
interface PartialRequestProps {
  id?: string;
  customerId?: string;
  valorSolicitado?: number;
  status?: CreditRequestStatus;
  alcadaRequerida?: ApprovalTier;
  /** Pass null to explicitly set scoreCredito to undefined */
  scoreCredito?: number | null;
  bandeiraId?: string;
  modalidade?: string;
  finalidade?: string;
  dataInclusao?: Date;
  criadoEm?: Date;
  atualizadoEm?: Date;
  motivoRejeicao?: string;
}

export function makeCreditRequest(overrides: PartialRequestProps = {}): CreditRequest {
  const valor = overrides.valorSolicitado ?? 5000;
  return CreditRequest.create({
    id: overrides.id ?? uid('request'),
    numeroSolicitacao: `SOL-2025-00001`,
    customerId: overrides.customerId ?? uid('customer'),
    valorSolicitado: Money.fromReais(valor),
    bandeiraId: overrides.bandeiraId ?? 'bandeira-visa',
    modalidade: overrides.modalidade ?? 'CREDITO_PESSOAL',
    finalidade: overrides.finalidade ?? 'Capital de giro para negócio',
    status: overrides.status ?? 'SOLICITADA',
    alcadaRequerida: overrides.alcadaRequerida ?? CreditRequest.determineApprovalTier(valor),
    dataInclusao: overrides.dataInclusao ?? new Date('2025-01-15T10:00:00Z'),
    scoreCredito: overrides.scoreCredito === null ? undefined : (overrides.scoreCredito ?? 700),
  });
}

// ─── Approval factory ─────────────────────────────────────────────────────────
export function makeApproval(overrides: Partial<{
  id: string;
  creditRequestId: string;
  usuarioId: string;
  usuarioNome: string;
  alcada: ApprovalTier;
  acao: ApprovalAction;
  observacoes: string;
  statusAnterior: string;
  statusNovo: string;
  dataAcao: Date;
}> = {}): Approval {
  return Approval.create({
    id: overrides.id ?? uid('approval'),
    creditRequestId: overrides.creditRequestId ?? uid('request'),
    usuarioId: overrides.usuarioId ?? uid('user'),
    usuarioNome: overrides.usuarioNome ?? 'Carlos Gerente',
    alcada: overrides.alcada ?? 'GERENTE',
    acao: overrides.acao ?? 'APROVADO',
    observacoes: overrides.observacoes,
    statusAnterior: overrides.statusAnterior ?? 'SOLICITADA',
    statusNovo: overrides.statusNovo ?? 'APROVADA',
    dataAcao: overrides.dataAcao ?? new Date(),
  });
}

// ─── CreditScore factory ───────────────────────────────────────────────────────
export function makeCreditScore(score = 700): CreditScore {
  return CreditScore.create({
    id: uid('score'),
    customerId: uid('customer'),
    score,
    risco: CreditScore.riskFromScore(score),
    fatores: [],
    calculadoEm: new Date(),
  });
}
