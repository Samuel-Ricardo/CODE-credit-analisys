import { ICreditRequestRepository, CreditRequestFilters } from "@/domain/repositories/ICreditRequestRepository";
import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";
import { CreditScore } from "@/domain/entities/CreditScore";
import { CreditRequestSummaryDTO } from "../dtos/CreditRequestDTO";
import { CreditRequest } from "@/domain/entities/CreditRequest";
import { Customer } from "@/domain/entities/Customer";

export interface ListCreditRequestsInput {
  filters?: CreditRequestFilters;
}

export interface ListCreditRequestsOutput {
  items: CreditRequestSummaryDTO[];
  total: number;
  page: number;
  limit: number;
}

export class ListCreditRequestsUseCase {
  constructor(
    private readonly creditRequestRepo: ICreditRequestRepository,
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(input: ListCreditRequestsInput = {}): Promise<ListCreditRequestsOutput> {
    const result = await this.creditRequestRepo.findAll(input.filters);

    const customerCache = new Map<string, Customer>();

    const items = await Promise.all(
      result.items.map(async (req) => {
        let customer = customerCache.get(req.customerId);
        if (!customer) {
          customer = (await this.customerRepo.findById(req.customerId)) ?? undefined;
          if (customer) customerCache.set(req.customerId, customer);
        }
        return this.toDTO(req, customer);
      }),
    );

    return { items, total: result.total, page: result.page, limit: result.limit };
  }

  private toDTO(req: CreditRequest, customer?: Customer): CreditRequestSummaryDTO {
    return {
      id: req.id,
      numeroSolicitacao: req.numeroSolicitacao,
      customerNome: customer?.nomeRazaoSocial ?? "—",
      customerDocumento: customer?.documentoFormatado ?? "—",
      customerTipo: customer?.tipo ?? "PF",
      valorSolicitado: req.valorSolicitado.value,
      valorAprovado: req.valorAprovado?.value,
      status: req.status,
      alcadaRequerida: req.alcadaRequerida,
      scoreCredito: req.scoreCredito,
      risco: req.scoreCredito ? CreditScore.riskFromScore(req.scoreCredito) : undefined,
      dataInclusao: req.dataInclusao,
      dataConclusao: req.dataConclusao,
    };
  }
}
