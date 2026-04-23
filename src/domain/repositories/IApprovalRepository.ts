import { Approval } from "../entities/Approval";

export interface IApprovalRepository {
  findById(id: string): Promise<Approval | null>;
  findByCreditRequestId(creditRequestId: string): Promise<Approval[]>;
  save(approval: Approval): Promise<Approval>;
}
