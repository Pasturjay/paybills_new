type CacheEntry<T> = {
    value: T;
    expiry: number;
};

export class CacheService {
    private cache: Map<string, CacheEntry<any>> = new Map();

    /**
     * Get a value from the cache
     * @param key Cache key
     * @returns Value or null if not found/expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Set a value in the cache
     * @param key Cache key
     * @param value Value to store
     * @param ttlSeconds Time to live in seconds
     */
    set<T>(key: string, value: T, ttlSeconds: number = 300): void {
        this.cache.set(key, {
            value,
            expiry: Date.now() + (ttlSeconds * 1000)
        });
    }

    /**
     * Delete a key from cache
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }
}
