/**
 * Configuração dos vídeos de demonstração para o player offline.
 *
 * URLs apontam para o Supabase Storage (bucket público "videos-demo").
 * Estes vídeos são usados apenas para testes do fluxo offline-first.
 *
 * Para produção, substituir por CDN (Bunny.net, Mux, etc.)
 */

export const SUPABASE_STORAGE_BASE =
  'https://limqrpxdzxejvuqjiwpn.supabase.co/storage/v1/object/public/videos-demo';

export interface DemoVideo {
  /** ID da lição no banco de dados */
  lessonId: string;
  /** Título da aula */
  title: string;
  /** URL do vídeo no Supabase Storage */
  url: string;
  /** Módulo ao qual pertence */
  moduleId: string;
}

/**
 * Mapeamento de lessonId → URL do vídeo demo.
 *
 * Para usar: quando uma lição tiver um videoBlock no payload JSON,
 * o student app procura nesta config para obter a URL real.
 */
export const DEMO_VIDEOS: Record<string, DemoVideo> = {
  // Módulo 1 — Introdução
  'lesson-intro-1': {
    lessonId: 'lesson-intro-1',
    title: 'Introdução ao Curso',
    url: `${SUPABASE_STORAGE_BASE}/aula1-introducao.mp4`,
    moduleId: 'module-1',
  },
  'lesson-intro-2': {
    lessonId: 'lesson-intro-2',
    title: 'Conceitos Fundamentais',
    url: `${SUPABASE_STORAGE_BASE}/aula2-conceitos.mp4`,
    moduleId: 'module-1',
  },

  // Módulo 2 — Prática
  'lesson-pratica-1': {
    lessonId: 'lesson-pratica-1',
    title: 'Prática Guiada',
    url: `${SUPABASE_STORAGE_BASE}/aula3-pratica.mp4`,
    moduleId: 'module-2',
  },
  'lesson-pratica-2': {
    lessonId: 'lesson-pratica-2',
    title: 'Técnicas Avançadas',
    url: `${SUPABASE_STORAGE_BASE}/aula4-avancado.mp4`,
    moduleId: 'module-2',
  },

  // Módulo 3 — Projeto Final
  'lesson-projeto-1': {
    lessonId: 'lesson-projeto-1',
    title: 'Projeto Final',
    url: `${SUPABASE_STORAGE_BASE}/aula5-projeto.mp4`,
    moduleId: 'module-3',
  },
};

/**
 * Resolve a URL de um vídeo demo a partir do lessonId.
 *
 * @param lessonId - ID da lição a procurar
 * @returns URL do vídeo se encontrado, senão undefined
 */
export function getDemoVideoUrl(lessonId: string): string | undefined {
  return DEMO_VIDEOS[lessonId]?.url;
}
