'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  CheckSquare,
  Settings,
  Wallet,
  PlusCircle,
  X,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',                   icon: <LayoutDashboard size={18} /> },
  { label: 'Solicitacoes', href: '/dashboard/solicitacoes',      icon: <FileText size={18} />, badge: 3 },
  { label: 'Nova Analise', href: '/dashboard/solicitacoes/nova', icon: <PlusCircle size={18} /> },
  { label: 'Aprovacoes',   href: '/dashboard/aprovacoes',        icon: <CheckSquare size={18} /> },
  { label: 'Relatorios',   href: '/dashboard/relatorios',        icon: <BarChart3 size={18} /> },
];

const bottomItems: NavItem[] = [
  { label: 'Configuracoes', href: '/dashboard/configuracoes', icon: <Settings size={18} /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (href: string) => {
    router.push(href);
    onClose?.();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div
      className="h-full flex flex-col px-3 py-5"
      style={{
        background: 'linear-gradient(160deg, #E65100 0%, #F57C00 35%, #FB8C00 65%, #FF9800 100%)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-md flex items-center justify-center glass-dark shrink-0">
          <Wallet size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-[15px] leading-tight tracking-tight">VV Credito</p>
          <p className="text-white/60 text-[11px]">Analise de Credito</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-white/70 hover:text-white md:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Menu</p>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className={clsx('nav-item w-full text-left', active && 'active')}
            >
              <span className={clsx('shrink-0', active ? 'text-white' : 'text-white/60')}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[11px] font-bold bg-white/20 text-white rounded-full px-2 py-0.5 min-w-5 text-center">
                  {item.badge}
                </span>
              )}
              {active && <ChevronRight size={14} className="text-white/50" />}
            </button>
          );
        })}
      </nav>

      <div className="h-px bg-white/15 mx-2 my-3" />

      <nav className="flex flex-col gap-1">
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className={clsx('nav-item w-full text-left', active && 'active')}
            >
              <span className={clsx('shrink-0', active ? 'text-white' : 'text-white/60')}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-4 mx-1 p-3 glass-dark rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-sm shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium leading-tight truncate">Ana Ferreira</p>
            <p className="text-white/50 text-[11px] truncate">Analista Senior</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      <aside
        className="hidden md:flex flex-col shrink-0"
        style={{ width: DRAWER_WIDTH }}
      >
        <div className="h-full rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(245,124,0,0.25)]">
          <SidebarContent />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside
            className="absolute left-2 top-2 bottom-2 rounded-3xl overflow-hidden shadow-2xl"
            style={{ width: DRAWER_WIDTH }}
          >
            <SidebarContent onClose={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}


