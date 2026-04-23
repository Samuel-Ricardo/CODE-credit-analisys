'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { RepositoryFactory } from '@/infrastructure/factories/RepositoryFactory';
import { CreateCreditRequestUseCase } from '@/application/use-cases/CreateCreditRequestUseCase';
import { ApproveCreditUseCase } from '@/application/use-cases/ApproveCreditUseCase';
import { ListCreditRequestsUseCase } from '@/application/use-cases/ListCreditRequestsUseCase';
import { GetDashboardStatsUseCase } from '@/application/use-cases/GetDashboardStatsUseCase';
import type { CreateCreditRequestDTO, ApproveCreditRequestDTO, CreditRequestSummaryDTO } from '@/application/dtos/CreditRequestDTO';
import type { DashboardStatsDTO } from '@/application/dtos/DashboardStatsDTO';
import type { CreditRequestFilters } from '@/domain/repositories/ICreditRequestRepository';

interface CreditContextValue {
  // State
  requests: CreditRequestSummaryDTO[];
  dashboardStats: DashboardStatsDTO | null;
  loading: boolean;
  error: string | null;
  // Actions
  loadRequests: (filters?: CreditRequestFilters) => Promise<void>;
  loadDashboard: () => Promise<void>;
  createRequest: (dto: CreateCreditRequestDTO) => Promise<CreditRequestSummaryDTO>;
  approveRequest: (dto: ApproveCreditRequestDTO) => Promise<CreditRequestSummaryDTO>;
}

const CreditContext = createContext<CreditContextValue | null>(null);

export function CreditProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<CreditRequestSummaryDTO[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lazy-initialised use-case instances (Factory + DI)
  const getUseCases = useCallback(() => {
    const creditRepo   = RepositoryFactory.getCreditRequestRepository();
    const customerRepo = RepositoryFactory.getCustomerRepository();
    const approvalRepo = RepositoryFactory.getApprovalRepository();
    const scoring      = RepositoryFactory.getScoringService();

    return {
      listRequests:   new ListCreditRequestsUseCase(creditRepo, customerRepo),
      createRequest:  new CreateCreditRequestUseCase(creditRepo, customerRepo, scoring),
      approveRequest: new ApproveCreditUseCase(creditRepo, customerRepo, approvalRepo),
      getDashboard:   new GetDashboardStatsUseCase(creditRepo),
    };
  }, []);

  const loadRequests = useCallback(async (filters?: CreditRequestFilters) => {
    setLoading(true);
    setError(null);
    try {
      const { listRequests } = getUseCases();
      const result = await listRequests.execute({ filters });
      setRequests(result.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  }, [getUseCases]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { getDashboard } = getUseCases();
      const stats = await getDashboard.execute();
      setDashboardStats(stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, [getUseCases]);

  const createRequest = useCallback(async (dto: CreateCreditRequestDTO): Promise<CreditRequestSummaryDTO> => {
    setLoading(true);
    setError(null);
    try {
      const { createRequest: uc } = getUseCases();
      const result = await uc.execute(dto);
      setRequests((prev) => [result, ...prev]);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar solicitação';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [getUseCases]);

  const approveRequest = useCallback(async (dto: ApproveCreditRequestDTO): Promise<CreditRequestSummaryDTO> => {
    setLoading(true);
    setError(null);
    try {
      const { approveRequest: uc } = getUseCases();
      const result = await uc.execute(dto);
      setRequests((prev) => prev.map((r) => r.id === result.id ? result : r));
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao aprovar solicitação';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [getUseCases]);

  return (
    <CreditContext.Provider value={{
      requests, dashboardStats, loading, error,
      loadRequests, loadDashboard, createRequest, approveRequest,
    }}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCreditContext(): CreditContextValue {
  const ctx = useContext(CreditContext);
  if (!ctx) throw new Error('useCreditContext must be used inside <CreditProvider>');
  return ctx;
}
