import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export class CacheService {
  get<T>(key: string): T | undefined {
    return cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): void {
    if (ttl) {
      cache.set(key, value, ttl);
    } else {
      cache.set(key, value);
    }
  }

  del(key: string): void {
    cache.del(key);
  }

  flush(): void {
    cache.flushAll();
  }

  getStats() {
    return {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
    };
  }
}
