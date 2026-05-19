import { supabase } from '../supabase';
import { StudentProgress, StudentProgressSchema } from '@projeto/types';

// Cache em memória para agrupamento e gerenciamento de debounce por aluno/aula
interface DebounceCache {
  [key: string]: {
    timer: ReturnType<typeof setTimeout> | null;
    lastPlayedSeconds: number;
    percentageWatched: number;
  };
}

const progressCache: DebounceCache = {};

export const ProgressService = {
  /**
   * Obtém o registro de progresso ativo do aluno para uma aula específica (Auto-Resume).
   */
  async getLessonProgress(userId: string, lessonId: string): Promise<StudentProgress | null> {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (error || !data) return null;

    const parsed = StudentProgressSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Erro de validação no progresso do aluno:', parsed.error);
      return data as StudentProgress;
    }

    return parsed.data;
  },

  /**
   * Persiste o progresso de forma imediata (Core Writer).
   * Aplica estritamente a REGRA DE 85% para marcação de conclusão automática da aula.
   */
  async saveProgressImmediate(
    userId: string,
    lessonId: string,
    lastPlayedSeconds: number,
    percentageWatched: number
  ): Promise<StudentProgress> {
    // Regra dos 85% de conclusão automática de vídeos
    const isCompleted = percentageWatched >= 85;
    const completedAt = isCompleted ? new Date().toISOString() : null;

    const payload = {
      user_id: userId,
      lesson_id: lessonId,
      last_played_seconds: lastPlayedSeconds,
      percentage_watched: percentageWatched,
      completed: isCompleted,
      ...(isCompleted ? { completed_at: completedAt } : {}),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('student_progress')
      .upsert(payload, { onConflict: 'user_id,lesson_id' })
      .select('*')
      .single();

    if (error) throw error;

    return StudentProgressSchema.parse(data);
  },

  /**
   * Persiste o progresso utilizando um DEBOUNCE inteligente de 5 segundos.
   * Altamente recomendado para players de vídeo ativos, minimizando requests concorrentes
   * sob cargas pesadas (até 10.000 usuários simultâneos no pico).
   */
  saveProgressDebounced(
    userId: string,
    lessonId: string,
    lastPlayedSeconds: number,
    percentageWatched: number,
    onSuccess?: (progress: StudentProgress) => void
  ) {
    const cacheKey = `${userId}:${lessonId}`;

    if (!progressCache[cacheKey]) {
      progressCache[cacheKey] = {
        timer: null,
        lastPlayedSeconds,
        percentageWatched,
      };
    } else {
      // Atualizar dados em cache com as marcas temporais mais recentes
      progressCache[cacheKey].lastPlayedSeconds = lastPlayedSeconds;
      progressCache[cacheKey].percentageWatched = Math.max(
        progressCache[cacheKey].percentageWatched,
        percentageWatched
      );
    }

    // Cancelar agendamento pendente anterior
    if (progressCache[cacheKey].timer) {
      clearTimeout(progressCache[cacheKey].timer!);
    }

    // Agendar nova requisição para rodar após 5 segundos de estabilidade
    progressCache[cacheKey].timer = setTimeout(async () => {
      try {
        const cached = progressCache[cacheKey];
        delete progressCache[cacheKey]; // Limpar cache preventivamente para evitar condições de corrida

        const progress = await this.saveProgressImmediate(
          userId,
          lessonId,
          cached.lastPlayedSeconds,
          cached.percentageWatched
        );

        if (onSuccess) {
          onSuccess(progress);
        }
      } catch (err) {
        console.error('Erro ao processar progresso debounced no Supabase:', err);
      }
    }, 5000);
  }
};
