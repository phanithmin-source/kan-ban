export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;

  set(
    key: string,
    value: unknown,
    ttlSeconds: number
  ): Promise<void>;

  invalidate(...keys: string[]): Promise<void>;

  invalidateByPrefix(prefix: string): Promise<void>;
}