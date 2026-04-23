/**
 * Factory Pattern: single source of truth for creating infrastructure dependencies.
 * Allows swapping mock implementations for real ones without touching the application layer.
 */
import { MockCreditRequestRepository } from "../repositories/MockCreditRequestRepository";
import { MockCustomerRepository } from "../repositories/MockCustomerRepository";
import { MockApprovalRepository } from "../repositories/MockApprovalRepository";
import { MockCreditScoringService } from "../services/MockCreditScoringService";

// Singleton instances for client-side use
let creditRequestRepo: MockCreditRequestRepository | null = null;
let customerRepo: MockCustomerRepository | null = null;
let approvalRepo: MockApprovalRepository | null = null;
let scoringService: MockCreditScoringService | null = null;

export const RepositoryFactory = {
  getCreditRequestRepository(): MockCreditRequestRepository {
    if (!creditRequestRepo) creditRequestRepo = new MockCreditRequestRepository();
    return creditRequestRepo;
  },

  getCustomerRepository(): MockCustomerRepository {
    if (!customerRepo) customerRepo = new MockCustomerRepository();
    return customerRepo;
  },

  getApprovalRepository(): MockApprovalRepository {
    if (!approvalRepo) approvalRepo = new MockApprovalRepository();
    return approvalRepo;
  },

  getScoringService(): MockCreditScoringService {
    if (!scoringService) scoringService = new MockCreditScoringService();
    return scoringService;
  },
};
