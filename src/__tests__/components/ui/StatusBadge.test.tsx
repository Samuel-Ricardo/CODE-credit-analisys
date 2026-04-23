import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, RiskBadge } from '@/presentation/components/ui/StatusBadge';
import type { CreditRequestStatus } from '@/domain/entities/CreditRequest';
import type { RiskLevel } from '@/domain/entities/CreditScore';

describe('StatusBadge', () => {
  const statusCases: Array<[CreditRequestStatus, string]> = [
    ['RASCUNHO', 'Rascunho'],
    ['SOLICITADA', 'Solicitada'],
    ['EM_ANALISE', 'Em Análise'],
    ['EM_APROVACAO', 'Em Aprovação'],
    ['APROVADA', 'Aprovada'],
    ['REJEITADA', 'Rejeitada'],
    ['CANCELADA', 'Cancelada'],
  ];

  it.each(statusCases)('renders correct label for status %s', (status, expectedLabel) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('applies an extra className when provided', () => {
    const { container } = render(<StatusBadge status="APROVADA" className="extra-class" />);
    expect(container.firstChild).toHaveClass('extra-class');
  });

  it('renders a dot indicator inside the badge', () => {
    const { container } = render(<StatusBadge status="APROVADA" />);
    // The dot is a span with rounded-full
    const dot = container.querySelector('.rounded-full');
    expect(dot).toBeInTheDocument();
  });
});

describe('RiskBadge', () => {
  const riskCases: Array<[RiskLevel, string]> = [
    ['MUITO_BAIXO', 'Muito Baixo'],
    ['BAIXO', 'Baixo'],
    ['MEDIO', 'Médio'],
    ['ALTO', 'Alto'],
    ['MUITO_ALTO', 'Muito Alto'],
  ];

  it.each(riskCases)('renders correct label for risk %s', (risk, expectedLabel) => {
    render(<RiskBadge risk={risk} />);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('applies an extra className when provided', () => {
    const { container } = render(<RiskBadge risk="ALTO" className="custom-risk" />);
    expect(container.firstChild).toHaveClass('custom-risk');
  });
});
