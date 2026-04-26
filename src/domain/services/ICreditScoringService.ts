import { Customer } from "../entities/Customer";
import { CreditScore } from "../entities/CreditScore";
import { Money } from "../value-objects/Money";

export interface ICreditScoringService {
  calculateScore(customer: Customer, valorSolicitado: Money): Promise<CreditScore>;
}
