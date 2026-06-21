import { useState, useEffect } from 'react';
import { mediaCacheService } from '../services/mediaCacheService';

interface UseCachedImageResult {
  localPath: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook que resolve o path local de uma imagem cacheada.
 * Se a imagem não estiver em cache, retorna null (usa URL remota).
 */
export function useCachedImage(url: string | undefined): UseCachedImageResult {
  const [state, setState] = useState<UseCachedImageResult>({
    localPath: null,
    loading: !!url,
    error: null,
  });

  useEffect(() => {
    if (!url) {
      setState({ localPath: null, loading: false, error: null });
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const path = await mediaCacheService.getCachedImage(url);
        if (!cancelled) {
          setState({ localPath: path, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ localPath: null, loading: false, error: String(err) });
        }
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [url]);

  return state;
}
