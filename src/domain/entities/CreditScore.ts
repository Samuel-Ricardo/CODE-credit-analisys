export type RiskLevel =
  | "MUITO_BAIXO"
  | "BAIXO"
  | "MEDIO"
  | "ALTO"
  | "MUITO_ALTO";

export interface ScoreFactor {
  fator: string;
  impacto: number; // positive or negative points
  descricao: string;
}

export interface CreditScoreProps {
  id: string;
  customerId: string;
  score: number; // 300–850
  risco: RiskLevel;
  fatores: ScoreFactor[];
  calculadoEm: Date;
}

export class CreditScore {
  private readonly props: CreditScoreProps;

  private constructor(props: CreditScoreProps) {
    if (props.score < 300 || props.score > 850) {
      throw new Error(`Score inválido: ${props.score}. Esperado: 300–850.`);
    }
    this.props = { ...props };
  }

  static create(props: CreditScoreProps): CreditScore {
    return new CreditScore(props);
  }

  static riskFromScore(score: number): RiskLevel {
    if (score >= 750) return "MUITO_BAIXO";
    if (score >= 650) return "BAIXO";
    if (score >= 550) return "MEDIO";
    if (score >= 450) return "ALTO";
    return "MUITO_ALTO";
  }

  get id() { return this.props.id; }
  get customerId() { return this.props.customerId; }
  get score() { return this.props.score; }
  get risco() { return this.props.risco; }
  get fatores() { return this.props.fatores; }
  get calculadoEm() { return this.props.calculadoEm; }

  isApprovalRecommended(): boolean {
    return this.props.score >= 550;
  }

  getPercentual(): number {
    return ((this.props.score - 300) / (850 - 300)) * 100;
  }

  toPlain(): CreditScoreProps {
    return { ...this.props };
  }
}
