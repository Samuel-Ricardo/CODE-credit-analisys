import { ICreditRequestRepository } from "@/domain/repositories/ICreditRequestRepository";
import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";
import { IApprovalRepository } from "@/domain/repositories/IApprovalRepository";
import { Approval } from "@/domain/entities/Approval";
import {
  CreditRequestNotFoundError,
  InsufficientApprovalTierError,
} from "@/domain/errors/DomainError";
import {
  ApproveCreditRequestDTO,
  CreditRequestSummaryDTO,
} from "../dtos/CreditRequestDTO";
import { CreditScore } from "@/domain/entities/CreditScore";

export class ApproveCreditUseCase {
  constructor(
    private readonly creditRequestRepo: ICreditRequestRepository,
    private readonly customerRepo: ICustomerRepository,
    private readonly approvalRepo: IApprovalRepository,
  ) {}

  async execute(dto: ApproveCreditRequestDTO): Promise<CreditRequestSummaryDTO> {
    const request = await this.creditRequestRepo.findById(dto.creditRequestId);
    if (!request) throw new CreditRequestNotFoundError(dto.creditRequestId);

    if (!request.canBeApprovedBy(dto.alcada)) {
      throw new InsufficientApprovalTierError();
    }

    const approval = Approval.create({
      id: crypto.randomUUID(),
      creditRequestId: request.id,
      usuarioId: dto.usuarioId,
      usuarioNome: dto.usuarioNome,
      alcada: dto.alcada,
      acao: "APROVADO",
      observacoes: dto.observacoes,
      statusAnterior: request.status,
      statusNovo: "APROVADA",
      dataAcao: new Date(),
    });

    await this.approvalRepo.save(approval);

    const updated = request.withStatus("APROVADA", {
      valorAprovado: request.valorSolicitado,
      dataConclusao: new Date(),
    });

    const saved = await this.creditRequestRepo.update(updated);
    const customer = await this.customerRepo.findById(saved.customerId);

    return {
      id: saved.id,
      numeroSolicitacao: saved.numeroSolicitacao,
      customerNome: customer?.nomeRazaoSocial ?? "—",
      customerDocumento: customer?.documentoFormatado ?? "—",
      customerTipo: customer?.tipo ?? "PF",
      valorSolicitado: saved.valorSolicitado.value,
      valorAprovado: saved.valorAprovado?.value,
      status: saved.status,
      alcadaRequerida: saved.alcadaRequerida,
      scoreCredito: saved.scoreCredito,
      risco: saved.scoreCredito
        ? CreditScore.riskFromScore(saved.scoreCredito)
        : undefined,
      dataInclusao: saved.dataInclusao,
      dataConclusao: saved.dataConclusao,
    };
  }
}
