import { useEffect, useState } from 'react';
import { getCacheSample, getCacheStats, invalidateCache } from '../services/apiClient';
import { useAuth } from '../state/AuthContext';

export function CachePage() {
  const { token } = useAuth();
  const [sample, setSample] = useState(null);
  const [stats, setStats] = useState({});

  async function loadStats() {
    const data = await getCacheStats(token);
    setStats(data);
  }

  useEffect(() => {
    loadStats();
  }, [token]);

  return (
    <section>
      <h1>Caché Redis</h1>
      <div className="row-actions">
        <button type="button" onClick={async () => { const data = await getCacheSample(token); setSample(data); await loadStats(); }}>
          Probar endpoint cacheado
        </button>
        <button type="button" onClick={async () => { await invalidateCache(token); await loadStats(); }}>
          Invalidar cache
        </button>
      </div>
      {sample ? (
        <p>
          Hit: {sample.cacheHit ? 'Sí' : 'No'} | Sin caché ~400ms vs con caché ~40ms
        </p>
      ) : null}
      <p>
        Hit ratio: {stats.hit_ratio || 0}% | Hits: {stats.hits || 0} | Misses: {stats.misses || 0}
      </p>
    </section>
  );
}
