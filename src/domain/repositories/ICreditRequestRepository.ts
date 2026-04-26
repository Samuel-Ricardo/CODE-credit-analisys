import { CreditRequest, CreditRequestStatus } from "../entities/CreditRequest";

export interface CreditRequestFilters {
  status?: CreditRequestStatus[];
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ICreditRequestRepository {
  findById(id: string): Promise<CreditRequest | null>;
  findAll(filters?: CreditRequestFilters): Promise<PaginatedResult<CreditRequest>>;
  findByCustomerId(customerId: string): Promise<CreditRequest[]>;
  save(request: CreditRequest): Promise<CreditRequest>;
  update(request: CreditRequest): Promise<CreditRequest>;
  count(filters?: CreditRequestFilters): Promise<number>;
}
