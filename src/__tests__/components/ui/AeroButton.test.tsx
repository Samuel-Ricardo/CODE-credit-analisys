import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AeroButton } from '@/presentation/components/ui/AeroButton';

describe('AeroButton', () => {
  // ─── Rendering ────────────────────────────────────────────────────────────
  describe('rendering', () => {
    it('renders children text', () => {
      render(<AeroButton>Salvar</AeroButton>);
      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });

    it('renders a <button> element by default', () => {
      render(<AeroButton>Clique</AeroButton>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  // ─── Variants ─────────────────────────────────────────────────────────────
  describe('variant styles', () => {
    it('applies btn-aero class for primary variant (default)', () => {
      const { container } = render(<AeroButton variant="primary">Primário</AeroButton>);
      expect(container.firstChild).toHaveClass('btn-aero');
    });

    it('applies btn-ghost class for ghost variant', () => {
      const { container } = render(<AeroButton variant="ghost">Ghost</AeroButton>);
      expect(container.firstChild).toHaveClass('btn-ghost');
    });

    it('applies danger styles for danger variant', () => {
      const { container } = render(<AeroButton variant="danger">Danger</AeroButton>);
      // Should contain red gradient class
      const btn = container.firstChild as HTMLElement;
      expect(btn.className).toMatch(/red/);
    });
  });

  // ─── Sizes ────────────────────────────────────────────────────────────────
  describe('size classes', () => {
    it('applies sm size class', () => {
      const { container } = render(<AeroButton size="sm">Small</AeroButton>);
      expect(container.firstChild).toHaveClass('px-4');
    });

    it('applies md size class (default)', () => {
      const { container } = render(<AeroButton size="md">Medium</AeroButton>);
      expect(container.firstChild).toHaveClass('px-6');
    });

    it('applies lg size class', () => {
      const { container } = render(<AeroButton size="lg">Large</AeroButton>);
      expect(container.firstChild).toHaveClass('px-8');
    });
  });

  // ─── Loading state ────────────────────────────────────────────────────────
  describe('loading state', () => {
    it('renders a spinner when loading=true', () => {
      const { container } = render(<AeroButton loading>Carregando</AeroButton>);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('disables the button when loading', () => {
      render(<AeroButton loading>Carregando</AeroButton>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies reduced opacity when loading', () => {
      const { container } = render(<AeroButton loading>...</AeroButton>);
      expect(container.firstChild).toHaveClass('opacity-50');
    });

    it('does not render a spinner when not loading', () => {
      const { container } = render(<AeroButton>Normal</AeroButton>);
      expect(container.querySelector('svg')).not.toBeInTheDocument();
    });
  });

  // ─── Disabled state ───────────────────────────────────────────────────────
  describe('disabled state', () => {
    it('disables the button when disabled=true', () => {
      render(<AeroButton disabled>Desabilitado</AeroButton>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies opacity class when disabled', () => {
      const { container } = render(<AeroButton disabled>Desabilitado</AeroButton>);
      expect(container.firstChild).toHaveClass('opacity-50');
    });
  });

  // ─── Click handler ────────────────────────────────────────────────────────
  describe('click handling', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<AeroButton onClick={handler}>Clique</AeroButton>);
      await user.click(screen.getByRole('button'));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handler = vi.fn();
      render(<AeroButton onClick={handler} disabled>Desabilitado</AeroButton>);
      await user.click(screen.getByRole('button'));
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ─── Custom className ─────────────────────────────────────────────────────
  it('accepts and applies a custom className', () => {
    const { container } = render(<AeroButton className="my-custom-class">Botão</AeroButton>);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
