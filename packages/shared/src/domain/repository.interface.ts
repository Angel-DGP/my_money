export interface IRepository<T, ID> {
  findById(id: ID, userId: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  exists(id: ID, userId: string): Promise<boolean>;
  softDelete(id: ID, userId: string, deletedBy: string): Promise<void>;
}
