import { Customer } from "../entities/Customer";

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByDocumento(documento: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  save(customer: Customer): Promise<Customer>;
  update(customer: Customer): Promise<Customer>;
  search(query: string): Promise<Customer[]>;
}
