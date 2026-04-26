'use client';

import { Menu, Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle: () => void;
}

export function Header({ title, subtitle, onMenuToggle }: HeaderProps) {
  return (
    <header className="glass rounded-3xl px-5 py-3.5 flex items-center gap-4">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-xl btn-ghost"
        aria-label="Abrir menu"
      >
        <Menu size={20} className="text-text" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold text-text leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-text-muted/70 truncate">{subtitle}</p>
        )}
      </div>

      {/* Search (decorative in demo) */}
      <div className="hidden sm:flex items-center gap-2 input-aero px-3 py-2 w-48">
        <Search size={14} className="text-text-muted/50 shrink-0" />
        <span className="text-sm text-text-muted/40">Buscar...</span>
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-xl btn-ghost" aria-label="Notificações">
        <Bell size={18} className="text-text" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border border-white/80" />
      </button>
    </header>
  );
}
