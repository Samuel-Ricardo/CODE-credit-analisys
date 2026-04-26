import { ICreditScoringService } from "@/domain/services/ICreditScoringService";
import { Customer } from "@/domain/entities/Customer";
import { CreditScore, ScoreFactor } from "@/domain/entities/CreditScore";
import { Money } from "@/domain/value-objects/Money";

/**
 * Strategy Pattern implementation: simulates credit scoring logic.
 * Each factor independently contributes to the final score.
 */
export class MockCreditScoringService implements ICreditScoringService {
  async calculateScore(customer: Customer, valorSolicitado: Money): Promise<CreditScore> {
    let baseScore = 600;
    const fatores: ScoreFactor[] = [];

    // Factor 1: Income capacity
    const incomeRatio = valorSolicitado.value / (customer.renda * 12);
    if (incomeRatio < 0.3) {
      baseScore += 80;
      fatores.push({ fator: "Capacidade de Pagamento", impacto: 80, descricao: "Renda muito acima do valor solicitado" });
    } else if (incomeRatio < 0.7) {
      baseScore += 40;
      fatores.push({ fator: "Capacidade de Pagamento", impacto: 40, descricao: "Renda adequada para o crédito" });
    } else if (incomeRatio > 1.5) {
      baseScore -= 80;
      fatores.push({ fator: "Capacidade de Pagamento", impacto: -80, descricao: "Valor solicitado acima da capacidade de renda" });
    } else {
      baseScore -= 20;
      fatores.push({ fator: "Capacidade de Pagamento", impacto: -20, descricao: "Relação renda/crédito no limite" });
    }

    // Factor 2: Customer tenure
    const tenureDays =
      (Date.now() - customer.dataCadastro.getTime()) / (1000 * 60 * 60 * 24);
    if (tenureDays > 730) {
      baseScore += 60;
      fatores.push({ fator: "Tempo de Relacionamento", impacto: 60, descricao: "Cliente com mais de 2 anos de relacionamento" });
    } else if (tenureDays > 365) {
      baseScore += 30;
      fatores.push({ fator: "Tempo de Relacionamento", impacto: 30, descricao: "Mais de 1 ano de relacionamento" });
    } else {
      fatores.push({ fator: "Tempo de Relacionamento", impacto: 0, descricao: "Relacionamento recente" });
    }

    // Factor 3: Customer type
    if (customer.isPessoaJuridica() && customer.renda > 100000) {
      baseScore += 50;
      fatores.push({ fator: "Porte da Empresa", impacto: 50, descricao: "Empresa de médio/grande porte" });
    }

    // Factor 4: Request value tier (simulates risk by size)
    if (valorSolicitado.value > 500000) {
      baseScore -= 30;
      fatores.push({ fator: "Valor Elevado", impacto: -30, descricao: "Crédito de alto valor requer análise aprofundada" });
    } else if (valorSolicitado.value <= 10000) {
      baseScore += 20;
      fatores.push({ fator: "Valor Baixo", impacto: 20, descricao: "Crédito de baixo valor, menor risco" });
    }

    // Clamp score to valid range
    const finalScore = Math.min(850, Math.max(300, baseScore));

    return CreditScore.create({
      id: crypto.randomUUID(),
      customerId: customer.id,
      score: finalScore,
      risco: CreditScore.riskFromScore(finalScore),
      fatores,
      calculadoEm: new Date(),
    });
  }
}
