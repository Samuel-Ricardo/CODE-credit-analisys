'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="aero-bg min-h-screen flex">
      {/* Decorative Aero orbs */}
      <div
        aria-hidden
        className="aero-orb fixed w-150 h-150 -top-40 -left-40 bg-sky-300/20 pointer-events-none"
      />
      <div
        aria-hidden
        className="aero-orb fixed w-125 h-125 -bottom-32 -right-32 bg-orange-300/20 pointer-events-none"
      />

      {/* Layout */}
      <div className="relative flex w-full p-3 md:p-4 gap-4">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main column */}
        <div className="flex flex-col flex-1 min-w-0 gap-4">
          <Header
            title={title}
            subtitle={subtitle}
            onMenuToggle={() => setMobileOpen(true)}
          />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
