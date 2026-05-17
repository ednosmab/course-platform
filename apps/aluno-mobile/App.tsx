import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useMobileProgress } from './src/hooks/useMobileProgress';
import { BlockRenderer } from './src/components/BlockRenderer';
import { AnyBlock } from '@projeto/types';
import { CourseService, supabase } from '@projeto/core';
import { Wifi, WifiOff, CheckCircle, BookOpen, RefreshCw, AlertCircle } from 'lucide-react-native';

export default function App() {
  const { isOffline, setIsOffline, pendingCount, saveProgressMobile, syncPending } = useMobileProgress();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [videoPositions, setVideoPositions] = useState<Record<string, number>>({});

  const getErrorMessage = (err: any): string => {
    if (!err) return 'Erro desconhecido';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    if (typeof err === 'object') {
      const parts = [];
      if (err.message) parts.push(err.message);
      if (err.details) parts.push(err.details);
      if (err.hint) parts.push(`Dica: ${err.hint}`);
      if (err.code) parts.push(`Código: ${err.code}`);
      if (parts.length > 0) return parts.join(' | ');
      return JSON.stringify(err);
    }
    return String(err);
  };

  // 1. Carregamento inicial da trilha e estrutura do curso real do Supabase (com auto-seed se necessário)
  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando dados reais do curso no Supabase...');
      
      const courseId = '99999999-9999-9999-9999-999999999999';
      
      // Verifica se o curso existe no banco
      const { data: courseCheck, error: checkErr } = await supabase
        .from('courses')
        .select('id')
        .eq('id', courseId)
        .maybeSingle();

      if (checkErr) throw checkErr;

      // Se não existir, executa o auto-seed resiliente
      if (!courseCheck) {
        console.log('Curso não encontrado no Supabase. Executando seed de segurança...');
        
        // Seed Path
        const pathId = '88888888-8888-8888-8888-888888888888';
        await supabase.from('paths').upsert({
          id: pathId,
          title: 'Trilha Full Stack Developer',
          description: 'Aprenda do zero ao deploy com arquiteturas resilientes e modernas.',
          is_published: true
        });

        // Seed Course
        await supabase.from('courses').upsert({
          id: courseId,
          title: 'Desenvolvimento Web Full Stack',
          description: 'Torne-se um desenvolvedor completo, do frontend ao backend e DevOps.',
          is_published: true
        });

        // Link Path & Course
        await supabase.from('path_courses').upsert({
          path_id: pathId,
          course_id: courseId,
          order_index: 1
        });

        // Seed Module
        const moduleId = '00000000-0000-0000-0000-000000000000';
        await supabase.from('modules').upsert({
          id: moduleId,
          course_id: courseId,
          title: 'Módulo 1: Introdução Básica',
          order_index: 1
        });

        // Seed Lesson
        const defaultBlocks = [
          {
            id: 'block-text-1',
            type: 'text',
            content: 'Bem-vindo ao curso! Nesta aula estudaremos como a arquitetura do EAD está conectada.',
            styles: { align: 'left', fontSize: 'medium' }
          },
          {
            id: 'block-video-1',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            provider: 'youtube'
          },
          {
            id: 'block-quiz-1',
            type: 'quiz',
            question: 'Qual banco de dados relacional é utilizado no Supabase?',
            options: [
              { id: 'opt-pg-1', text: 'PostgreSQL', isCorrect: true, feedback: 'Correto! O Supabase é construído sobre o PostgreSQL.' },
              { id: 'opt-pg-2', text: 'MongoDB', isCorrect: false, feedback: 'Incorreto! MongoDB é NoSQL.' }
            ]
          }
        ] as AnyBlock[];

        await supabase.from('lessons').upsert({
          id: '11111111-1111-1111-1111-111111111111',
          module_id: moduleId,
          title: '1. Introdução à Plataforma Híbrida',
          order_index: 1,
          is_published: true,
          blocks: defaultBlocks
        });

        console.log('Seed de segurança executado com sucesso!');
      }

      const struct = await CourseService.getCourseStructure(courseId);
      setCourse(struct.course);
      
      const allLessons = struct.modules.flatMap(mod => mod.lessons);
      setLessons(allLessons);
      
      if (allLessons.length > 0) {
        setActiveLessonId(allLessons[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do curso:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, []);

  // 2. Carregar os blocos atualizados da aula ativa em tempo real ao selecionar ou recarregar
  const refreshActiveLesson = async () => {
    if (!activeLessonId) return;
    try {
      setRefreshing(true);
      setError(null);
      console.log(`Carregando blocos atualizados para a aula: ${activeLessonId}`);
      const { data: lessonData, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', activeLessonId)
        .single();

      if (error) throw error;

      setLessons(prev => prev.map(les => {
        if (les.id === activeLessonId) {
          return {
            ...les,
            blocks: lessonData.blocks || []
          };
        }
        return les;
      }));
    } catch (err) {
      console.error('Erro ao recarregar blocos da aula ativa:', err);
      setError(getErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshActiveLesson();
  }, [activeLessonId]);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  const handleVideoProgress = async (progressSec: number, durationSec: number) => {
    if (!activeLessonId) return;

    setVideoPositions((prev) => ({
      ...prev,
      [activeLessonId]: progressSec,
    }));

    await saveProgressMobile(activeLessonId, progressSec, durationSec);

    const percent = progressSec / durationSec;
    if (percent >= 0.85 && !completions[activeLessonId]) {
      setCompletions((prev) => ({
        ...prev,
        [activeLessonId]: true,
      }));
    }
  };

  const handleManualComplete = () => {
    if (!activeLessonId) return;
    setCompletions((prev) => ({
      ...prev,
      [activeLessonId]: !prev[activeLessonId],
    }));
  };

  const toggleNetwork = async () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    if (!nextState) {
      await syncPending();
      await loadCourseData();
    }
  };

  // Renderização de erro amigável para o aluno
  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <StatusBar barStyle="light-content" />
        <AlertCircle size={48} color="#f43f5e" />
        <Text style={{ color: '#f43f5e', fontSize: 16, fontWeight: '700', marginTop: 16, textAlign: 'center', fontFamily: 'System' }}>
          Erro ao Conectar ao Supabase
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, textAlign: 'center', lineHeight: 18, fontFamily: 'System' }}>
          {error}
        </Text>
        <TouchableOpacity onPress={loadCourseData} style={[styles.toggleBtn, { marginTop: 24, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#1e293b' }]}>
          <Text style={styles.toggleBtnText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading || !activeLesson) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#818cf8" />
        <Text style={{ color: '#94a3b8', marginTop: 16, fontSize: 13, fontWeight: '600', fontFamily: 'System' }}>
          Carregando plataforma de alunos real...
        </Text>
      </SafeAreaView>
    );
  }

  const completedCount = Object.values(completions).filter(Boolean).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.networkBanner, isOffline ? styles.networkOffline : styles.networkOnline]}>
        <View style={styles.networkInfo}>
          {isOffline ? (
            <>
              <WifiOff size={16} color="#ec4899" />
              <Text style={styles.networkText}>Modo Offline Ativo | {pendingCount} na fila</Text>
            </>
          ) : (
            <>
              <Wifi size={16} color="#818cf8" />
              <Text style={styles.networkText}>Modo Online Conectado</Text>
            </>
          )}
        </View>
        <TouchableOpacity style={styles.toggleBtn} onPress={toggleNetwork}>
          <Text style={styles.toggleBtnText}>Alternar Rede</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.courseTag}>Plataforma de Alunos</Text>
            
            {/* Botão de Pull-to-Refresh do CMS */}
            <TouchableOpacity onPress={refreshActiveLesson} disabled={refreshing} style={styles.refreshBtn}>
              {refreshing ? (
                <ActivityIndicator size="small" color="#818cf8" />
              ) : (
                <RefreshCw size={14} color="#818cf8" />
              )}
              <Text style={styles.refreshBtnText}>Sincronizar CMS</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.courseTitle}>{course?.title || 'Trilha Full Stack Developer'}</Text>
          <Text style={styles.courseDesc}>{course?.description || 'Aprenda do zero ao deploy com arquiteturas resilientes e modernas.'}</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>{progressPercent}% concluído ({completedCount}/{lessons.length} aulas)</Text>
          </View>
        </View>

        <View style={styles.playerCard}>
          <Text style={styles.lessonHeaderTitle}>{activeLesson.title}</Text>
          
          <BlockRenderer
            blocks={activeLesson.blocks || []}
            onVideoProgress={handleVideoProgress}
            savedPosition={videoPositions[activeLessonId || ''] || 0}
          />

          <TouchableOpacity 
            style={[styles.completeBtn, completions[activeLessonId || ''] && styles.completeBtnActive]}
            onPress={handleManualComplete}
          >
            <CheckCircle size={16} color={completions[activeLessonId || ''] ? '#818cf8' : '#cbd5e1'} />
            <Text style={[styles.completeBtnText, completions[activeLessonId || ''] && styles.completeBtnTextActive]}>
              {completions[activeLessonId || ''] ? 'Aula Concluída' : 'Marcar como Concluída'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.curriculumContainer}>
          <Text style={styles.sectionTitle}>Currículo do Curso</Text>
          
          {lessons.map((les) => {
            const isSelected = les.id === activeLessonId;
            const isDone = completions[les.id];

            return (
              <TouchableOpacity
                key={les.id}
                onPress={() => setActiveLessonId(les.id)}
                style={[styles.lessonRow, isSelected && styles.lessonRowSelected]}
              >
                <View style={styles.lessonRowLeft}>
                  {isDone ? (
                    <CheckCircle size={16} color="#818cf8" />
                  ) : (
                    <BookOpen size={16} color="#64748b" />
                  )}
                  <Text style={[styles.lessonRowText, isSelected && styles.lessonRowTextSelected]}>
                    {les.title}
                  </Text>
                </View>
                {videoPositions[les.id] > 0 && (
                  <View style={styles.resumeTag}>
                    <Text style={styles.resumeTagText}>{Math.floor(videoPositions[les.id])}s</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#030712',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  networkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  networkOnline: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  networkOffline: {
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  networkText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  toggleBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toggleBtnText: {
    color: '#cbd5e1',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  header: {
    gap: 6,
  },
  courseTag: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshBtnText: {
    color: '#818cf8',
    fontSize: 9,
    fontWeight: '700',
  },
  courseTitle: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700',
  },
  courseDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 12,
    gap: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  progressText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '500',
  },
  playerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    gap: 16,
  },
  lessonHeaderTitle: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  completeBtnActive: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  completeBtnText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  completeBtnTextActive: {
    color: '#818cf8',
  },
  curriculumContainer: {
    gap: 10,
  },
  sectionTitle: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
  },
  lessonRowSelected: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.02)',
  },
  lessonRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  lessonRowText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  lessonRowTextSelected: {
    color: '#f1f5f9',
    fontWeight: '600',
  },
  resumeTag: {
    backgroundColor: '#1e293b',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  resumeTagText: {
    color: '#a78bfa',
    fontSize: 9,
    fontWeight: '600',
  },
});
