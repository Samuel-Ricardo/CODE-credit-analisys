import { ICreditRequestRepository } from "@/domain/repositories/ICreditRequestRepository";
import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";
import { ICreditScoringService } from "@/domain/services/ICreditScoringService";
import { CreditRequest } from "@/domain/entities/CreditRequest";
import { Customer } from "@/domain/entities/Customer";
import { Money } from "@/domain/value-objects/Money";
import { CPF } from "@/domain/value-objects/CPF";
import { CNPJ } from "@/domain/value-objects/CNPJ";
import { InvalidDocumentError } from "@/domain/errors/DomainError";
import {
  CreateCreditRequestDTO,
  CreditRequestSummaryDTO,
} from "../dtos/CreditRequestDTO";
import { CreditScore } from "@/domain/entities/CreditScore";

export class CreateCreditRequestUseCase {
  constructor(
    private readonly creditRequestRepo: ICreditRequestRepository,
    private readonly customerRepo: ICustomerRepository,
    private readonly scoringService: ICreditScoringService,
  ) {}

  async execute(dto: CreateCreditRequestDTO): Promise<CreditRequestSummaryDTO> {
    const cleanDoc = dto.customerDocumento.replace(/\D/g, "");

    const isValid =
      dto.customerTipo === "PF"
        ? CPF.isValid(cleanDoc)
        : CNPJ.isValid(cleanDoc);

    if (!isValid) throw new InvalidDocumentError(dto.customerDocumento);

    let customer = await this.customerRepo.findByDocumento(cleanDoc);

    if (!customer) {
      customer = Customer.create({
        id: crypto.randomUUID(),
        tipo: dto.customerTipo,
        documento: cleanDoc,
        nomeRazaoSocial: dto.customerNome,
        email: dto.customerEmail,
        telefone: dto.customerTelefone,
        renda: dto.customerRenda,
        endereco: {
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          uf: "",
          cep: dto.customerCep ?? "",
        },
        ativo: true,
        dataCadastro: new Date(),
      });
      await this.customerRepo.save(customer);
    }

    const valorMoney = Money.fromReais(dto.valorSolicitado);
    const score = await this.scoringService.calculateScore(customer, valorMoney);
    const alcada = CreditRequest.determineApprovalTier(dto.valorSolicitado);

    const total = await this.creditRequestRepo.count();
    const numero = `SOL-${new Date().getFullYear()}-${String(total + 1).padStart(5, "0")}`;

    const request = CreditRequest.create({
      id: crypto.randomUUID(),
      numeroSolicitacao: numero,
      customerId: customer.id,
      valorSolicitado: valorMoney,
      bandeiraId: dto.bandeiraId,
      modalidade: dto.modalidade,
      finalidade: dto.finalidade,
      status: "SOLICITADA",
      alcadaRequerida: alcada,
      dataInclusao: new Date(),
      scoreCredito: score.score,
      observacoes: dto.observacoes,
    });

    const saved = await this.creditRequestRepo.save(request);
    return this.toSummaryDTO(saved, customer, score);
  }

  private toSummaryDTO(
    req: CreditRequest,
    customer: Customer,
    score: CreditScore,
  ): CreditRequestSummaryDTO {
    return {
      id: req.id,
      numeroSolicitacao: req.numeroSolicitacao,
      customerNome: customer.nomeRazaoSocial,
      customerDocumento: customer.documentoFormatado,
      customerTipo: customer.tipo,
      valorSolicitado: req.valorSolicitado.value,
      valorAprovado: req.valorAprovado?.value,
      status: req.status,
      alcadaRequerida: req.alcadaRequerida,
      scoreCredito: score.score,
      risco: score.risco,
      dataInclusao: req.dataInclusao,
      dataConclusao: req.dataConclusao,
    };
  }
}
