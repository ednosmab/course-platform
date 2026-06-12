# 🎬 SKILL: VIDEO STREAMING CDN

## 🎯 Objetivo
Distribuir vídeos de forma eficiente e escalável usando CDN especializado, com streaming adaptativo (HLS) para diferentes velocidades de internet.

---

## 📋 Quando Usar Esta Skill
- Integrar Bunny.net ou Cloudflare Stream
- Configurar URLs assinadas para proteção
- Implementar adaptive bitrate (ABR)
- Otimizar entrega de vídeo para internet móvel

---

## 🏗️ Arquitetura

```
[CMS Admin] → Upload → [CDN Provider] → Transcode (HLS)
                                            ↓
[App Aluno] ← Player ← [CDN Edge] ← Chunks (.m3u8 + .ts)
```

---

## 🛠️ Implementação

### 1. Integração com Bunny.net

```typescript
// packages/core/src/infrastructure/video-cdn.ts

interface VideoCDNConfig {
  apiKey: string;
  libraryId: string;
  baseUrl: string;
}

const config: VideoCDNConfig = {
  apiKey: process.env.BUNNY_API_KEY!,
  libraryId: process.env.BUNNY_LIBRARY_ID!,
  baseUrl: 'https://video.bunnycdn.com',
};

/**
 * Upload de vídeo para Bunny.net
 */
export async function uploadVideo(
  file: File,
  title: string
): Promise<{ videoId: string; playbackUrl: string }> {
  // 1. Criar entrada do vídeo
  const createResponse = await fetch(
    `${config.baseUrl}/libraries/${config.libraryId}/videos`,
    {
      method: 'PUT',
      headers: {
        AccessKey: config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    }
  );

  const { guid: videoId } = await createResponse.json();

  // 2. Upload do arquivo
  await fetch(
    `${config.baseUrl}/libraries/${config.libraryId}/videos/${videoId}`,
    {
      method: 'PUT',
      headers: {
        AccessKey: config.apiKey,
        'Content-Type': 'application/octet-stream',
      },
      body: file,
    }
  );

  // 3. URL de playback (HLS)
  const playbackUrl = `https://vz-${config.libraryId}.b-cdn.net/${videoId}/playlist.m3u8`;

  return { videoId, playbackUrl };
}

/**
 * Gerar URL assinada com expiração
 */
export function getSignedVideoUrl(
  videoId: string,
  expiresInMinutes = 60
): string {
  const expiration = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;

  // Bunny.net usa query param com token
  return `https://vz-${config.libraryId}.b-cdn.net/${videoId}/playlist.m3u8?token=${expiration}`;
}
```

### 2. Integração com Cloudflare Stream (Alternativa)

```typescript
// packages/core/src/infrastructure/video-cloudflare.ts

interface CloudflareConfig {
  accountId: string;
  apiToken: string;
}

const cfConfig: CloudflareConfig = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
};

/**
 * Upload de vídeo para Cloudflare Stream
 */
export async function uploadVideoCloudflare(
  file: File,
  title: string
): Promise<{ videoId: string; playbackUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('meta', JSON.stringify({ name: title }));

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfConfig.accountId}/stream`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfConfig.apiToken}`,
      },
      body: formData,
    }
  );

  const { result } = await response.json();

  return {
    videoId: result.uid,
    playbackUrl: result.playback.hls,
  };
}
```

### 3. Player com Adaptive Bitrate

```typescript
// apps/student/src/components/VideoPlayer.tsx
import { Video, AVPlaybackStatus } from 'expo-av';
import { useRef, useState } from 'react';

interface VideoPlayerProps {
  playbackUrl: string;
  onProgress?: (positionMs: number) => void;
  onCompletion?: () => void;
}

/**
 * Player de vídeo com suporte a HLS
 * Detecta automaticamente a melhor qualidade para a conexão
 */
export function VideoPlayer({
  playbackUrl,
  onProgress,
  onCompletion,
}: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();

  const handlePlaybackStatusUpdate = (newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);

    if (newStatus.isLoaded) {
      // Reporta progresso a cada 5 segundos
      if (newStatus.positionMillis % 5000 === 0) {
        onProgress?.(newStatus.positionMillis);
      }

      // Detecta conclusão
      if (newStatus.didJustFinish) {
        onCompletion?.();
      }
    }
  };

  return (
    <Video
      ref={videoRef}
      source={{ uri: playbackUrl }}
      useNativeControls
      resizeMode="contain"
      onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      style={{ width: '100%', aspectRatio: 16 / 9 }}
    />
  );
}
```

### 4. Cache de Vídeos Offline (Cache Storage API)

```typescript
// apps/student/src/utils/video-cache.ts

const CACHE_NAME = 'video-cache-v1';
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB

/**
 * Baixar vídeo para cache local
 */
export async function cacheVideoForOffline(
  videoUrl: string,
  videoId: string
): Promise<void> {
  const cache = await caches.open(CACHE_NAME);

  // Verifica se já está em cache
  const existingResponse = await cache.match(videoUrl);
  if (existingResponse) return;

  // Baixa o vídeo
  const response = await fetch(videoUrl);
  if (!response.ok) throw new Error('Failed to download video');

  // Verifica espaço disponível
  await enforceCacheSizeLimit();

  // Salva no cache
  await cache.put(videoUrl, response);
}

/**
 * Verificar se vídeo está em cache
 */
export async function isVideoCached(videoUrl: string): Promise<boolean> {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(videoUrl);
  return !!response;
}

/**
 * Limitar tamanho do cache (500MB)
 */
async function enforceCacheSizeLimit(): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();

  let totalSize = 0;
  const responsesToDelete: Request[] = [];

  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;

      if (totalSize > MAX_CACHE_SIZE) {
        responsesToDelete.push(request);
      }
    }
  }

  // Remove vídeos mais antigos
  for (const request of responsesToDelete) {
    await cache.delete(request);
  }
}
```

---

## 📊 Configurações de Qualidade

| Qualidade | Resolução | Bitrate | Quando Usar |
|---|---|---|---|
| 360p | 640x360 | 800 kbps | Internet lenta (2G/3G) |
| 480p | 854x480 | 1.5 Mbps | Internet média (3G/4G) |
| 720p | 1280x720 | 3 Mbps | Internet boa (4G/WiFi) |
| 1080p | 1920x1080 | 6 Mbps | Internet excelente (WiFi) |

---

## ⚠️ Regras de Ouro

1. **URLs assinadas** — sempre usar expiração de 1 hora
2. **HLS obrigatório** — adaptive bitrate para internet móvel
3. **Cache local** — permitir download para offline com limite de 500MB
4. **Monitorar uso de banda** — alertar se exceder quota
5. **Fallback 360p** — sempre oferecer opção de baixa qualidade

---

## 📂 Onde Aplicar

- `packages/core/src/infrastructure/video-cdn.ts`
- `apps/student/src/components/VideoPlayer.tsx`
- `apps/student/src/utils/video-cache.ts`

---

## 🔗 Documentos Relacionados

- `docs/roadmaps/scalability-plan.md` — Plano de escalabilidade
- `docs/skills/supabase_storage.md` — Storage para thumbnails/PDFs
- `docs/layers/apps/mobile_player_plan.md` — Plano do player mobile
