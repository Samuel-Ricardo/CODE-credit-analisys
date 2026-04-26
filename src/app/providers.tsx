'use client';

import { CreditProvider } from '@/presentation/contexts/CreditContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <CreditProvider>{children}</CreditProvider>;
}
