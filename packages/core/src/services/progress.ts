import { supabase } from '../supabase';
import { StudentProgress, StudentProgressSchema } from '@projeto/types';
import { CertificateService } from './certificate';

interface DebounceCache {
  [key: string]: {
    timer: ReturnType<typeof setTimeout> | null;
    lastPlayedSeconds: number;
    percentageWatched: number;
  };
}

const progressCache: DebounceCache = {};

export const ProgressService = {
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

  async saveProgressImmediate(
    userId: string,
    lessonId: string,
    lastPlayedSeconds: number,
    percentageWatched: number
  ): Promise<StudentProgress> {
    const payload = {
      user_id: userId,
      lesson_id: lessonId,
      last_played_seconds: lastPlayedSeconds,
      percentage_watched: percentageWatched,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('student_progress')
      .upsert(payload, { onConflict: 'user_id,lesson_id' })
      .select('*')
      .single();

    if (error) throw error;

    const progress = StudentProgressSchema.parse(data);

    this.evaluateLessonCompletion(userId, lessonId).catch((err) => {
      console.error('Error evaluating lesson completion:', err);
    });

    return progress;
  },

  async submitTestScore(
    userId: string,
    lessonId: string,
    blockId: string,
    score: number,
  ): Promise<StudentProgress> {
    const clampedScore = Math.max(0, Math.min(100, score));

    const { data: current } = await supabase
      .from('student_progress')
      .select('tests_completed')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    const testsCompleted: Record<string, number> = (current?.tests_completed as Record<string, number>) ?? {};

    testsCompleted[blockId] = clampedScore;

    const { data, error } = await supabase
      .from('student_progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          tests_completed: testsCompleted,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' },
      )
      .select('*')
      .single();

    if (error) throw error;

    const progress = StudentProgressSchema.parse(data);

    const completionResult = await this.evaluateLessonCompletion(userId, lessonId);
    return completionResult ?? progress;
  },

  async evaluateLessonCompletion(
    userId: string,
    lessonId: string,
  ): Promise<StudentProgress | null> {
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('blocks')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lessonData?.blocks) return null;

    const blocks = lessonData.blocks as Array<Record<string, any>>;
    const testBlocks = blocks.filter((b) => b.layouts?.isTest === true);

    const { data: progressData, error: progressError } = await supabase
      .from('student_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (progressError) return null;
    if (!progressData) return null;

    const progress = StudentProgressSchema.parse(progressData);
    const testsCompleted = progress.tests_completed ?? {};

    const videoPassed = progress.percentage_watched >= 85;

    const allTestsPassed = testBlocks.every((block) => {
      const testScore = testsCompleted[block.id];
      return testScore !== undefined && testScore >= 70;
    });

    const isComplete = videoPassed && allTestsPassed;

    if (isComplete && !progress.completed) {
      const { data: updated, error: updateError } = await supabase
        .from('student_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .select('*')
        .single();

      if (updateError) return null;
      const result = StudentProgressSchema.parse(updated);

      CertificateService.checkAndIssue(userId, lessonId).catch((err) => {
        console.error('Error issuing certificate:', err);
      });

      return result;
    }

    return null;
  },

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
      progressCache[cacheKey].lastPlayedSeconds = lastPlayedSeconds;
      progressCache[cacheKey].percentageWatched = Math.max(
        progressCache[cacheKey].percentageWatched,
        percentageWatched
      );
    }

    if (progressCache[cacheKey].timer) {
      clearTimeout(progressCache[cacheKey].timer!);
    }

    progressCache[cacheKey].timer = setTimeout(async () => {
      try {
        const cached = progressCache[cacheKey];
        delete progressCache[cacheKey];

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
  },
};
