import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreditRequestForm } from '@/presentation/components/credit/CreditRequestForm';

function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  return async () => {
    await user.type(screen.getByPlaceholderText('000.000.000-00'), '52998224725');
    await user.type(screen.getByPlaceholderText(/nome do cliente/i), 'Ana Ferreira');
    await user.type(screen.getByPlaceholderText('email@exemplo.com'), 'ana@ferreira.com');
    await user.type(screen.getByPlaceholderText('(11) 99999-9999'), '11999990001');
    await user.type(screen.getByPlaceholderText('5000'), '8000');
    await user.type(screen.getByPlaceholderText('5000'), '8000');

    // Select Bandeira (first option after default empty)
    const bandeiraSelect = screen.getByLabelText(/bandeira/i);
    await user.selectOptions(bandeiraSelect, 'bandeira-visa');

    // Select Modalidade
    const modalidadeSelect = screen.getByLabelText(/modalidade/i);
    await user.selectOptions(modalidadeSelect, 'CREDITO_PESSOAL');

    await user.type(screen.getByPlaceholderText(/compra de equipamentos/i), 'Compra de notebooks para home office.');
    await user.type(screen.getByLabelText(/valor solicitado/i), '5000');
  };
}

describe('CreditRequestForm', () => {
  let onSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn().mockResolvedValue(undefined);
  });

  // ─── Rendering ────────────────────────────────────────────────────────────
  describe('rendering', () => {
    it('renders PF fields by default', () => {
      render(<CreditRequestForm onSubmit={onSubmit} />);
      expect(screen.getByPlaceholderText('000.000.000-00')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/nome do cliente/i)).toBeInTheDocument();
    });

    it('renders the Pessoa Física radio option as selected by default', () => {
      render(<CreditRequestForm onSubmit={onSubmit} />);
      const pfRadio = screen.getByRole('radio', { name: /pessoa física/i });
      expect(pfRadio).toBeChecked();
    });

    it('shows CPF label by default', () => {
      render(<CreditRequestForm onSubmit={onSubmit} />);
      expect(screen.getByText('CPF')).toBeInTheDocument();
    });
  });

  // ─── PF ↔ PJ switching ───────────────────────────────────────────────────
  describe('tipo switching', () => {
    it('switches document placeholder to CNPJ when PJ is selected', async () => {
      const user = userEvent.setup();
      render(<CreditRequestForm onSubmit={onSubmit} />);

      await user.click(screen.getByRole('radio', { name: /pessoa jurídica/i }));

      expect(screen.getByPlaceholderText('00.000.000/0001-00')).toBeInTheDocument();
    });

    it('changes label from CPF to CNPJ when PJ is selected', async () => {
      const user = userEvent.setup();
      render(<CreditRequestForm onSubmit={onSubmit} />);

      await user.click(screen.getByRole('radio', { name: /pessoa jurídica/i }));

      expect(screen.getByText('CNPJ')).toBeInTheDocument();
    });

    it('clears document field when tipo changes', async () => {
      const user = userEvent.setup();
      render(<CreditRequestForm onSubmit={onSubmit} />);

      await user.type(screen.getByPlaceholderText('000.000.000-00'), '529');
      await user.click(screen.getByRole('radio', { name: /pessoa jurídica/i }));

      // After switch the CNPJ field should be empty
      expect(screen.getByPlaceholderText('00.000.000/0001-00')).toHaveValue('');
    });
  });

  // ─── CPF masking ─────────────────────────────────────────────────────────
  describe('CPF masking', () => {
    it('applies CPF mask as the user types', async () => {
      const user = userEvent.setup();
      render(<CreditRequestForm onSubmit={onSubmit} />);

      await user.type(screen.getByPlaceholderText('000.000.000-00'), '52998224725');
      expect(screen.getByPlaceholderText('000.000.000-00')).toHaveValue('529.982.247-25');
    });
  });

  // ─── CNPJ masking ─────────────────────────────────────────────────────────
  describe('CNPJ masking', () => {
    it('applies CNPJ mask as the user types', async () => {
      const user = userEvent.setup();
      render(<CreditRequestForm onSubmit={onSubmit} />);

      await user.click(screen.getByRole('radio', { name: /pessoa jurídica/i }));
      await user.type(screen.getByPlaceholderText('00.000.000/0001-00'), '11222333000181');

      expect(screen.getByPlaceholderText('00.000.000/0001-00')).toHaveValue('11.222.333/0001-81');
    });
  });

  // ─── Phone masking ────────────────────────────────────────────────────────
  describe('phone masking', () => {
    it('applies phone mask as the user types', async () => {
      const user = userEvent.setup();
      render(<CreditRequestForm onSubmit={onSubmit} />);

      await user.type(screen.getByPlaceholderText('(11) 99999-9999'), '11999990001');
      expect(screen.getByPlaceholderText('(11) 99999-9999')).toHaveValue('(11) 99999-0001');
    });
  });

  // ─── Validation errors ────────────────────────────────────────────────────
  describe('validation on submit', () => {
    it('shows CPF validation error for invalid CPF', async () => {
      const user = userEvent.setup();
      render(<CreditRequestForm onSubmit={onSubmit} />);

      // Fill all required fields with a valid form, but wrong CPF
      await user.type(screen.getByPlaceholderText('000.000.000-00'), '52998224726'); // wrong last digit
      await user.type(screen.getByPlaceholderText(/nome do cliente/i), 'Ana Ferreira');
      await user.type(screen.getByPlaceholderText('email@exemplo.com'), 'ana@ferreira.com');
      await user.type(screen.getByPlaceholderText('(11) 99999-9999'), '11999990001');
      const rendaInput = screen.getByPlaceholderText('5000');
      await user.clear(rendaInput);
      await user.type(rendaInput, '8000');
      await user.selectOptions(screen.getByLabelText(/bandeira/i), 'bandeira-visa');
      await user.selectOptions(screen.getByLabelText(/modalidade/i), 'CREDITO_PESSOAL');
      const valorInput = screen.getByLabelText(/valor solicitado/i);
      await user.clear(valorInput);
      await user.type(valorInput, '5000');
      await user.type(screen.getByLabelText(/finalidade/i), 'Compra de notebooks para uso no escritório.');

      await user.click(screen.getByRole('button', { name: /enviar solicitação/i }));

      await waitFor(() =>
        expect(screen.getByText(/CPF inválido/i)).toBeInTheDocument()
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows name validation error when name is too short', async () => {
      const user = userEvent.setup();
      render(<CreditRequestForm onSubmit={onSubmit} />);

      await user.type(screen.getByPlaceholderText(/nome do cliente/i), 'AB');
      await user.click(screen.getByRole('button', { name: /enviar solicitação/i }));

      await waitFor(() =>
        expect(screen.getByText('Nome deve ter no mínimo 3 caracteres')).toBeInTheDocument()
      );
    });

    it('does not call onSubmit when form is invalid', async () => {
      const user = userEvent.setup();
      render(<CreditRequestForm onSubmit={onSubmit} />);

      // Submit without filling anything
      await user.click(screen.getByRole('button', { name: /enviar solicitação/i }));

      await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    });
  });

  // ─── Submit strips formatting ─────────────────────────────────────────────
  describe('submit payload', () => {
    it('strips formatting from CPF before calling onSubmit', async () => {
      const user = userEvent.setup();
      render(<CreditRequestForm onSubmit={onSubmit} />);

      // Fill minimal required fields with valid data
      await user.type(screen.getByPlaceholderText('000.000.000-00'), '52998224725');
      await user.type(screen.getByPlaceholderText(/nome do cliente/i), 'Ana Ferreira');
      await user.type(screen.getByPlaceholderText('email@exemplo.com'), 'ana@ferreira.com');
      await user.type(screen.getByPlaceholderText('(11) 99999-9999'), '11999990001');

      const rendaInput = screen.getByPlaceholderText('5000');
      await user.clear(rendaInput);
      await user.type(rendaInput, '8000');

      // Select bandeira and modalidade
      await user.selectOptions(screen.getByLabelText(/bandeira/i), 'bandeira-visa');
      await user.selectOptions(screen.getByLabelText(/modalidade/i), 'CREDITO_PESSOAL');

      // Fill valor solicitado
      const valorInput = screen.getByLabelText(/valor solicitado/i);
      await user.clear(valorInput);
      await user.type(valorInput, '5000');

      // Fill finalidade
      await user.type(screen.getByLabelText(/finalidade/i), 'Compra de notebooks para uso no escritório.');

      await user.click(screen.getByRole('button', { name: /enviar solicitação/i }));

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ customerDocumento: '52998224725' })
        )
      );
    });
  });

  // ─── Loading state ────────────────────────────────────────────────────────
  describe('loading state', () => {
    it('disables submit button when loading=true', () => {
      render(<CreditRequestForm onSubmit={onSubmit} loading />);
      expect(screen.getByRole('button', { name: /enviar solicitação/i })).toBeDisabled();
    });
  });
});
