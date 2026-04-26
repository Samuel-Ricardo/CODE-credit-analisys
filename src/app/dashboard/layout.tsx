import { DashboardLayout } from '@/presentation/components/layout/DashboardLayout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      title="VV Análise de Crédito"
      subtitle="Painel de controle"
    >
      {children}
    </DashboardLayout>
  );
}
