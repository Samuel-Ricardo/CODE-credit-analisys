import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApprovalForm } from '@/presentation/components/credit/ApprovalForm';
import type { CreditRequestSummaryDTO } from '@/application/dtos/CreditRequestDTO';
import { makeCreditRequest, makeCustomer } from '@/__tests__/helpers/factories';

function makeSummaryDTO(overrides: Partial<CreditRequestSummaryDTO> = {}): CreditRequestSummaryDTO {
  const req = makeCreditRequest();
  const customer = makeCustomer();
  return {
    id: req.id,
    numeroSolicitacao: 'SOL-2025-00001',
    status: 'SOLICITADA',
    valorSolicitado: req.valorSolicitado,
    valorAprovado: undefined,
    alcadaRequerida: 'LIDER',
    customerId: customer.id,
    customerNome: customer.nomeRazaoSocial,
    customerDocumento: customer.documento,
    customerEmail: customer.email ?? '',
    scoreCredito: 720,
    risco: 'BAIXO',
    criadoEm: req.criadoEm,
    atualizadoEm: req.atualizadoEm,
    finalidade: 'Compra de equipamentos',
    modalidade: 'CREDITO_PESSOAL',
    bandeiraId: 'visa',
    ...overrides,
  };
}

describe('ApprovalForm', () => {
  let onApprove: ReturnType<typeof vi.fn>;
  let onReject: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onApprove = vi.fn().mockResolvedValue(undefined);
    onReject = vi.fn().mockResolvedValue(undefined);
  });

  // ─── Render guard ─────────────────────────────────────────────────────────
  describe('render guard', () => {
    it('renders nothing when status is APROVADA', () => {
      const { container } = render(
        <ApprovalForm
          request={makeSummaryDTO({ status: 'APROVADA' })}
          onApprove={onApprove}
          onReject={onReject}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when status is REJEITADA', () => {
      const { container } = render(
        <ApprovalForm
          request={makeSummaryDTO({ status: 'REJEITADA' })}
          onApprove={onApprove}
          onReject={onReject}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when status is CANCELADA', () => {
      const { container } = render(
        <ApprovalForm
          request={makeSummaryDTO({ status: 'CANCELADA' })}
          onApprove={onApprove}
          onReject={onReject}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders for status SOLICITADA', () => {
      render(
        <ApprovalForm
          request={makeSummaryDTO({ status: 'SOLICITADA' })}
          onApprove={onApprove}
          onReject={onReject}
        />
      );
      expect(screen.getByText(/aprovar/i)).toBeInTheDocument();
    });

    it('renders for status EM_ANALISE', () => {
      render(
        <ApprovalForm
          request={makeSummaryDTO({ status: 'EM_ANALISE' })}
          onApprove={onApprove}
          onReject={onReject}
        />
      );
      expect(screen.getByText(/aprovar/i)).toBeInTheDocument();
    });

    it('renders for status EM_APROVACAO', () => {
      render(
        <ApprovalForm
          request={makeSummaryDTO({ status: 'EM_APROVACAO' })}
          onApprove={onApprove}
          onReject={onReject}
        />
      );
      expect(screen.getByText(/aprovar/i)).toBeInTheDocument();
    });
  });

  // ─── Tab switching ────────────────────────────────────────────────────────
  describe('tab switching', () => {
    it('shows approve form by default', () => {
      render(
        <ApprovalForm request={makeSummaryDTO()} onApprove={onApprove} onReject={onReject} />
      );
      expect(screen.getByPlaceholderText(/comentários sobre a aprovação/i)).toBeInTheDocument();
    });

    it('switches to reject form when Rejeitar tab is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ApprovalForm request={makeSummaryDTO()} onApprove={onApprove} onReject={onReject} />
      );

      await user.click(screen.getByRole('button', { name: /rejeitar/i }));

      expect(screen.getByPlaceholderText(/motivo da rejeição/i)).toBeInTheDocument();
    });

    it('switches back to approve form from reject tab', async () => {
      const user = userEvent.setup();
      render(
        <ApprovalForm request={makeSummaryDTO()} onApprove={onApprove} onReject={onReject} />
      );

      await user.click(screen.getByRole('button', { name: /rejeitar/i }));
      await user.click(screen.getByRole('button', { name: /aprovar/i }));

      expect(screen.getByPlaceholderText(/comentários sobre a aprovação/i)).toBeInTheDocument();
    });
  });

  // ─── Approval form submission ─────────────────────────────────────────────
  describe('approval submission', () => {
    it('calls onApprove when Confirmar Aprovação is submitted', async () => {
      const user = userEvent.setup();
      render(
        <ApprovalForm request={makeSummaryDTO()} onApprove={onApprove} onReject={onReject} />
      );

      await user.click(screen.getByRole('button', { name: /confirmar aprovação/i }));

      await waitFor(() => expect(onApprove).toHaveBeenCalledTimes(1));
    });

    it('passes observacoes value to onApprove', async () => {
      const user = userEvent.setup();
      render(
        <ApprovalForm request={makeSummaryDTO()} onApprove={onApprove} onReject={onReject} />
      );

      await user.type(screen.getByPlaceholderText(/comentários sobre a aprovação/i), 'Score excelente!');
      await user.click(screen.getByRole('button', { name: /confirmar aprovação/i }));

      await waitFor(() =>
        expect(onApprove).toHaveBeenCalledWith(expect.objectContaining({ observacoes: 'Score excelente!' }))
      );
    });
  });

  // ─── Reject form validation ───────────────────────────────────────────────
  describe('reject form validation', () => {
    it('shows error when reject motivo is too short (< 10 chars)', async () => {
      const user = userEvent.setup();
      render(
        <ApprovalForm request={makeSummaryDTO()} onApprove={onApprove} onReject={onReject} />
      );

      await user.click(screen.getByRole('button', { name: /rejeitar/i }));
      await user.type(screen.getByPlaceholderText(/motivo da rejeição/i), 'Curto');
      await user.click(screen.getByRole('button', { name: /confirmar rejeição/i }));

      await waitFor(() =>
        expect(screen.getByText(/10 caracteres/i)).toBeInTheDocument()
      );
      expect(onReject).not.toHaveBeenCalled();
    });

    it('calls onReject with a valid motivoRejeicao', async () => {
      const user = userEvent.setup();
      render(
        <ApprovalForm request={makeSummaryDTO()} onApprove={onApprove} onReject={onReject} />
      );

      await user.click(screen.getByRole('button', { name: /rejeitar/i }));
      await user.type(
        screen.getByPlaceholderText(/motivo da rejeição/i),
        'Renda insuficiente para o valor solicitado.'
      );
      await user.click(screen.getByRole('button', { name: /confirmar rejeição/i }));

      await waitFor(() =>
        expect(onReject).toHaveBeenCalledWith(
          expect.objectContaining({ motivoRejeicao: 'Renda insuficiente para o valor solicitado.' })
        )
      );
    });

    it('does not call onReject when motivo is empty', async () => {
      const user = userEvent.setup();
      render(
        <ApprovalForm request={makeSummaryDTO()} onApprove={onApprove} onReject={onReject} />
      );

      await user.click(screen.getByRole('button', { name: /rejeitar/i }));
      await user.click(screen.getByRole('button', { name: /confirmar rejeição/i }));

      await waitFor(() =>
        expect(screen.getByText(/10 caracteres/i)).toBeInTheDocument()
      );
      expect(onReject).not.toHaveBeenCalled();
    });
  });

  // ─── Loading state ────────────────────────────────────────────────────────
  describe('loading state', () => {
    it('disables submit buttons when loading=true', () => {
      render(
        <ApprovalForm request={makeSummaryDTO()} onApprove={onApprove} onReject={onReject} loading />
      );

      const submitBtn = screen.getByRole('button', { name: /confirmar aprovação/i });
      expect(submitBtn).toBeDisabled();
    });
  });
});
