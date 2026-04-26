import {
  ICreditRequestRepository,
  CreditRequestFilters,
  PaginatedResult,
} from "@/domain/repositories/ICreditRequestRepository";
import { CreditRequest, CreditRequestProps } from "@/domain/entities/CreditRequest";
import { Money } from "@/domain/value-objects/Money";
import { LocalStorageAdapter } from "../adapters/LocalStorageAdapter";
import { RAW_MOCK_REQUESTS, makeMockRequest } from "../mock-data/credit-requests";

/** Serialisable shape (Money as a plain number) used in localStorage */
interface StoredRequest extends Omit<CreditRequestProps, "valorSolicitado" | "valorAprovado" | "dataInclusao" | "dataConclusao"> {
  valorSolicitado: number;
  valorAprovado?: number;
  dataInclusao: string;
  dataConclusao?: string;
}

const STORE_KEY = "credit_requests";

function hydrate(stored: StoredRequest): CreditRequest {
  return CreditRequest.create({
    ...stored,
    valorSolicitado: Money.fromReais(stored.valorSolicitado),
    valorAprovado: stored.valorAprovado != null ? Money.fromReais(stored.valorAprovado) : undefined,
    dataInclusao: new Date(stored.dataInclusao),
    dataConclusao: stored.dataConclusao ? new Date(stored.dataConclusao) : undefined,
  });
}

function dehydrate(req: CreditRequest): StoredRequest {
  return {
    id: req.id,
    numeroSolicitacao: req.numeroSolicitacao,
    customerId: req.customerId,
    valorSolicitado: req.valorSolicitado.value,
    valorAprovado: req.valorAprovado?.value,
    bandeiraId: req.bandeiraId,
    modalidade: req.modalidade,
    finalidade: req.finalidade,
    status: req.status,
    alcadaRequerida: req.alcadaRequerida,
    responsavelAnaliseId: req.responsavelAnaliseId,
    dataInclusao: req.dataInclusao.toISOString(),
    dataConclusao: req.dataConclusao?.toISOString(),
    motivoRejeicao: req.motivoRejeicao,
    observacoes: req.observacoes,
    scoreCredito: req.scoreCredito,
  };
}

export class MockCreditRequestRepository implements ICreditRequestRepository {
  private readonly storage = new LocalStorageAdapter();

  private getAll(): CreditRequest[] {
    const stored = this.storage.get<StoredRequest[]>(STORE_KEY);
    if (stored && stored.length > 0) return stored.map(hydrate);

    // Seed with mock data on first access
    const seed = RAW_MOCK_REQUESTS.map((r) => CreditRequest.create(makeMockRequest(r)));
    this.storage.set(STORE_KEY, seed.map(dehydrate));
    return seed;
  }

  private saveAll(requests: CreditRequest[]): void {
    this.storage.set(STORE_KEY, requests.map(dehydrate));
  }

  async findById(id: string): Promise<CreditRequest | null> {
    return this.getAll().find((r) => r.id === id) ?? null;
  }

  async findAll(filters?: CreditRequestFilters): Promise<PaginatedResult<CreditRequest>> {
    let items = this.getAll();

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

    return {
      items: items.slice(start, start + limit),
      total,
      page,
      limit,
    };
  }

  async findByCustomerId(customerId: string): Promise<CreditRequest[]> {
    return this.getAll().filter((r) => r.customerId === customerId);
  }

  async save(request: CreditRequest): Promise<CreditRequest> {
    const all = this.getAll();
    all.push(request);
    this.saveAll(all);
    return request;
  }

  async update(request: CreditRequest): Promise<CreditRequest> {
    const all = this.getAll();
    const idx = all.findIndex((r) => r.id === request.id);
    if (idx === -1) throw new Error(`Request not found: ${request.id}`);
    all[idx] = request;
    this.saveAll(all);
    return request;
  }

  async count(filters?: CreditRequestFilters): Promise<number> {
    const { total } = await this.findAll({ ...filters, limit: 9999 });
    return total;
  }
}
