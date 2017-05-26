
export const DATABASE_STRATEGY = Symbol('DatabaseStrategy');

export interface DatabaseStrategy {
  create<T>(data: T): Promise<T>;
  update<T>(data: T): Promise<T>;
  retrieve<T>(id: string): Promise<T>;
}
