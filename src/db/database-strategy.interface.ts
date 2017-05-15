
export const DATABASE_STRATEGY = Symbol('DatabaseStrategy');

export interface DatabaseStrategy {
  create<T extends { id: string | null }>(data: T): Promise<T>;
  update<T extends { id: string | null }>(data: T): Promise<T>;
  retrieve<T extends { id: string | null }>(id: string): Promise<T>;
}
