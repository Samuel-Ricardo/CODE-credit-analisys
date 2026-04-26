export class DomainError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

export class CustomerNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Cliente não encontrado: ${id}`, "CUSTOMER_NOT_FOUND");
  }
}

export class CreditRequestNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Solicitação não encontrada: ${id}`, "CREDIT_REQUEST_NOT_FOUND");
  }
}

export class InvalidDocumentError extends DomainError {
  constructor(documento: string) {
    super(`Documento inválido: ${documento}`, "INVALID_DOCUMENT");
  }
}

export class InsufficientApprovalTierError extends DomainError {
  constructor() {
    super(
      "Alçada insuficiente para aprovar esta solicitação",
      "INSUFFICIENT_APPROVAL_TIER",
    );
  }
}

export class InvalidStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(
      `Transição de status inválida: ${from} → ${to}`,
      "INVALID_STATUS_TRANSITION",
    );
  }
}
