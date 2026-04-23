import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";
import { Customer, CustomerProps } from "@/domain/entities/Customer";
import { LocalStorageAdapter } from "../adapters/LocalStorageAdapter";
import { MOCK_CUSTOMERS } from "../mock-data/customers";

interface StoredCustomer extends Omit<CustomerProps, "dataCadastro"> {
  dataCadastro: string;
}

const STORE_KEY = "customers";

function hydrate(s: StoredCustomer): Customer {
  return Customer.create({ ...s, dataCadastro: new Date(s.dataCadastro) });
}

function dehydrate(c: Customer): StoredCustomer {
  return { ...c.toPlain(), dataCadastro: c.dataCadastro.toISOString() };
}

export class MockCustomerRepository implements ICustomerRepository {
  private readonly storage = new LocalStorageAdapter();

  private getAll(): Customer[] {
    const stored = this.storage.get<StoredCustomer[]>(STORE_KEY);
    if (stored && stored.length > 0) return stored.map(hydrate);

    const seed = MOCK_CUSTOMERS.map(Customer.create);
    this.storage.set(STORE_KEY, seed.map(dehydrate));
    return seed;
  }

  private saveAll(customers: Customer[]): void {
    this.storage.set(STORE_KEY, customers.map(dehydrate));
  }

  async findById(id: string): Promise<Customer | null> {
    return this.getAll().find((c) => c.id === id) ?? null;
  }

  async findByDocumento(documento: string): Promise<Customer | null> {
    const clean = documento.replace(/\D/g, "");
    return this.getAll().find((c) => c.documento === clean) ?? null;
  }

  async findAll(): Promise<Customer[]> {
    return this.getAll();
  }

  async save(customer: Customer): Promise<Customer> {
    const all = this.getAll();
    all.push(customer);
    this.saveAll(all);
    return customer;
  }

  async update(customer: Customer): Promise<Customer> {
    const all = this.getAll();
    const idx = all.findIndex((c) => c.id === customer.id);
    if (idx === -1) throw new Error(`Customer not found: ${customer.id}`);
    all[idx] = customer;
    this.saveAll(all);
    return customer;
  }

  async search(query: string): Promise<Customer[]> {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (c) =>
        c.nomeRazaoSocial.toLowerCase().includes(q) ||
        c.documento.includes(q),
    );
  }
}
