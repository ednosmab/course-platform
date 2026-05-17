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
      console.log('Buscando dados dinâmicos do curso no Supabase...');
      
      // 1. Carrega dinamicamente qualquer curso existente no banco de dados
      const { data: coursesCheck, error: checkErr } = await supabase
        .from('courses')
        .select('*');

      if (checkErr) throw checkErr;

      if (!coursesCheck || coursesCheck.length === 0) {
        throw new Error('Nenhum curso cadastrado no banco de dados. Crie e publique um curso no painel do CMS para começar!');
      }

      const activeCourse = coursesCheck[0];
      const struct = await CourseService.getCourseStructure(activeCourse.id);
      setCourse(struct.course);
      
      const allLessons = struct.modules.flatMap(mod => mod.lessons);
      setLessons(allLessons);
      
      if (allLessons.length > 0) {
        setActiveLessonId(allLessons[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do curso de forma dinâmica:', err);
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

  // 3. Inscrição em tempo real para sincronização instantânea com o CMS
  useEffect(() => {
    if (!activeLessonId) return;

    console.log(`Iniciando escuta em tempo real para a aula: ${activeLessonId}`);
    const channel = supabase
      .channel(`lesson-realtime-${activeLessonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons',
          filter: `id=eq.${activeLessonId}`,
        },
        (payload: any) => {
          console.log('Aula atualizada recebida via Realtime:', payload.new);
          if (payload.new && payload.new.blocks) {
            setLessons((prev) =>
              prev.map((les) => {
                if (les.id === activeLessonId) {
                  return {
                    ...les,
                    blocks: payload.new.blocks,
                    title: payload.new.title || les.title,
                  };
                }
                return les;
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`Cancelando escuta em tempo real para a aula: ${activeLessonId}`);
      supabase.removeChannel(channel);
    };
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
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.networkBanner, isOffline ? styles.networkOffline : styles.networkOnline]}>
        <View style={styles.networkInfo}>
          {isOffline ? (
            <>
              <WifiOff size={14} color="#f43f5e" />
              <Text style={styles.networkText}>Modo Offline</Text>
            </>
          ) : (
            <>
              <Wifi size={14} color="#10b981" />
              <Text style={styles.networkText}>Modo Online Conectado</Text>
            </>
          )}
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={refreshActiveLesson} disabled={refreshing} style={styles.refreshBtn}>
            {refreshing ? (
              <ActivityIndicator size="small" color="#818cf8" />
            ) : (
              <RefreshCw size={12} color="#818cf8" />
            )}
            <Text style={styles.refreshBtnText}>Sincronizar CMS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toggleBtn} onPress={toggleNetwork}>
            <Text style={styles.toggleBtnText}>Alternar Rede</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.playerCard}>
          <Text style={styles.lessonHeaderTitle}>{activeLesson.title}</Text>
          
          <BlockRenderer
            blocks={activeLesson.blocks || []}
            onVideoProgress={handleVideoProgress}
            savedPosition={videoPositions[activeLessonId || ''] || 0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  networkOnline: {
    borderColor: '#10b981',
  },
  networkOffline: {
    borderColor: '#f43f5e',
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
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshBtnText: {
    color: '#818cf8',
    fontSize: 9,
    fontWeight: '700',
  },
  playerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    gap: 16,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  lessonHeaderTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
});
