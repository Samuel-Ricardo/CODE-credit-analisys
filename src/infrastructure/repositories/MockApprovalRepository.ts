import { IApprovalRepository } from "@/domain/repositories/IApprovalRepository";
import { Approval, ApprovalProps } from "@/domain/entities/Approval";
import { LocalStorageAdapter } from "../adapters/LocalStorageAdapter";

interface StoredApproval extends Omit<ApprovalProps, "dataAcao"> {
  dataAcao: string;
}

const STORE_KEY = "approvals";

function hydrate(s: StoredApproval): Approval {
  return Approval.create({ ...s, dataAcao: new Date(s.dataAcao) });
}

function dehydrate(a: Approval): StoredApproval {
  return { ...a.toPlain(), dataAcao: a.dataAcao.toISOString() };
}

export class MockApprovalRepository implements IApprovalRepository {
  private readonly storage = new LocalStorageAdapter();

  private getAll(): Approval[] {
    const stored = this.storage.get<StoredApproval[]>(STORE_KEY);
    return stored ? stored.map(hydrate) : [];
  }

  private saveAll(approvals: Approval[]): void {
    this.storage.set(STORE_KEY, approvals.map(dehydrate));
  }

  async findById(id: string): Promise<Approval | null> {
    return this.getAll().find((a) => a.id === id) ?? null;
  }

  async findByCreditRequestId(creditRequestId: string): Promise<Approval[]> {
    return this.getAll().filter((a) => a.creditRequestId === creditRequestId);
  }

  async save(approval: Approval): Promise<Approval> {
    const all = this.getAll();
    all.push(approval);
    this.saveAll(all);
    return approval;
  }
}
