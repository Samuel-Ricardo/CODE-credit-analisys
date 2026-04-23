/**
 * In-memory repository implementations for use-case tests.
 * Zero external dependencies — no localStorage, no randomness.
 */
import {
  ICreditRequestRepository,
  CreditRequestFilters,
  PaginatedResult,
} from '@/domain/repositories/ICreditRequestRepository';
import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { IApprovalRepository } from '@/domain/repositories/IApprovalRepository';
import { ICreditScoringService } from '@/domain/services/ICreditScoringService';
import { CreditRequest } from '@/domain/entities/CreditRequest';
import { Customer } from '@/domain/entities/Customer';
import { Approval } from '@/domain/entities/Approval';
import { CreditScore } from '@/domain/entities/CreditScore';
import { Money } from '@/domain/value-objects/Money';

// ─── Credit Request ───────────────────────────────────────────────────────────
export class InMemoryCreditRequestRepository implements ICreditRequestRepository {
  public store: CreditRequest[] = [];

  async findById(id: string): Promise<CreditRequest | null> {
    return this.store.find((r) => r.id === id) ?? null;
  }

  async findAll(filters?: CreditRequestFilters): Promise<PaginatedResult<CreditRequest>> {
    let items = [...this.store];

    if (filters?.status?.length) {
      items = items.filter((r) => filters.status!.includes(r.status));
    }
    if (filters?.customerId) {
      items = items.filter((r) => r.customerId === filters.customerId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.numeroSolicitacao.toLowerCase().includes(q) ||
          r.customerId.toLowerCase().includes(q),
      );
    }

    const total = items.length;
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const start = (page - 1) * limit;

    return { items: items.slice(start, start + limit), total, page, limit };
  }

  async findByCustomerId(customerId: string): Promise<CreditRequest[]> {
    return this.store.filter((r) => r.customerId === customerId);
  }

  async save(request: CreditRequest): Promise<CreditRequest> {
    this.store.push(request);
    return request;
  }

  async update(request: CreditRequest): Promise<CreditRequest> {
    const idx = this.store.findIndex((r) => r.id === request.id);
    if (idx === -1) throw new Error(`Request not found: ${request.id}`);
    this.store[idx] = request;
    return request;
  }

  async count(filters?: CreditRequestFilters): Promise<number> {
    const { total } = await this.findAll({ ...filters, limit: 99999 });
    return total;
  }
}

// ─── Customer ─────────────────────────────────────────────────────────────────
export class InMemoryCustomerRepository implements ICustomerRepository {
  public store: Customer[] = [];

  async findById(id: string): Promise<Customer | null> {
    return this.store.find((c) => c.id === id) ?? null;
  }

  async findByDocumento(documento: string): Promise<Customer | null> {
    const clean = documento.replace(/\D/g, '');
    return this.store.find((c) => c.documento === clean) ?? null;
  }

  async findAll(): Promise<Customer[]> {
    return [...this.store];
  }

  async save(customer: Customer): Promise<Customer> {
    this.store.push(customer);
    return customer;
  }

  async update(customer: Customer): Promise<Customer> {
    const idx = this.store.findIndex((c) => c.id === customer.id);
    if (idx === -1) throw new Error(`Customer not found: ${customer.id}`);
    this.store[idx] = customer;
    return customer;
  }

  async search(query: string): Promise<Customer[]> {
    const q = query.toLowerCase();
    return this.store.filter(
      (c) =>
        c.nomeRazaoSocial.toLowerCase().includes(q) ||
        c.documento.includes(q),
    );
  }
}

// ─── Approval ─────────────────────────────────────────────────────────────────
export class InMemoryApprovalRepository implements IApprovalRepository {
  public store: Approval[] = [];

  async findById(id: string): Promise<Approval | null> {
    return this.store.find((a) => a.id === id) ?? null;
  }

  async findByCreditRequestId(creditRequestId: string): Promise<Approval[]> {
    return this.store.filter((a) => a.creditRequestId === creditRequestId);
  }

  async save(approval: Approval): Promise<Approval> {
    this.store.push(approval);
    return approval;
  }
}

// ─── Scoring Service (deterministic stub) ─────────────────────────────────────
export class StubCreditScoringService implements ICreditScoringService {
  constructor(private fixedScore = 700) {}

  async calculateScore(customer: Customer, valorSolicitado: Money): Promise<CreditScore> {
    return CreditScore.create({
      id: 'score-stub',
      customerId: customer.id,
      score: this.fixedScore,
      risco: CreditScore.riskFromScore(this.fixedScore),
      fatores: [],
      calculadoEm: new Date(),
    });
  }
}
