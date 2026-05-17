import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { useMobileProgress } from './src/hooks/useMobileProgress';
import { BlockRenderer } from './src/components/BlockRenderer';
import { AnyBlock } from '@projeto/types';
import { Wifi, WifiOff, CheckCircle, BookOpen } from 'lucide-react-native';

const mockCourse = {
  title: 'Trilha Full Stack Developer',
  description: 'Aprenda do zero ao deploy com arquiteturas resilientes e modernas.',
  lessons: [
    {
      id: 'lesson-1',
      title: '1. Introdução à Plataforma Híbrida',
      duration: 120,
      blocks: [
        {
          id: 'b1',
          type: 'text',
          content: 'Bem-vindo à trilha premium! Nesta aula, discutiremos a importância de arquitetar aplicativos resilientes que funcionam offline-first e suportam alta escala.',
          styles: { align: 'left', fontSize: 'medium' }
        },
        {
          id: 'b2',
          type: 'video',
          url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
          provider: 'youtube'
        },
        {
          id: 'b3',
          type: 'quiz',
          question: 'Qual é a regra padrão para marcação automática de conclusão de vídeo nesta plataforma?',
          options: [
            { id: 'opt1', text: 'Assistir a pelo menos 50% do vídeo.', isCorrect: false, feedback: 'Tente novamente! A regra de negócios é mais exigente.' },
            { id: 'opt2', text: 'Assistir a pelo menos 85% do vídeo.', isCorrect: true, feedback: 'Excelente! A regra dos 85% garante a retenção do aprendizado do aluno de forma robusta!' },
            { id: 'opt3', text: 'Apenas clicar no botão Concluir.', isCorrect: false, feedback: 'Não! O progresso é sincronizado de forma inteligente.' }
          ]
        }
      ] as AnyBlock[]
    },
    {
      id: 'lesson-2',
      title: '2. Banco de Dados & LGPD Security',
      duration: 180,
      blocks: [
        {
          id: 'b4',
          type: 'text',
          content: 'A segurança de dados sob a LGPD exige que todos os acessos a dados pessoais no banco sejam protegidos rigorosamente. Aqui estudaremos as políticas RLS no PostgreSQL.',
          styles: { align: 'left', fontSize: 'medium' }
        },
        {
          id: 'b5',
          type: 'quiz',
          question: 'Onde são declaradas fisicamente as regras de segurança LGPD no Supabase?',
          options: [
            { id: 'opt4', text: 'Nas Row Level Security (RLS) policies no banco de dados.', isCorrect: true, feedback: 'Correto! As RLS policies protegem as linhas diretamente no banco de dados contra vazamentos!' },
            { id: 'opt5', text: 'Apenas no código Javascript do frontend.', isCorrect: false, feedback: 'Incorreto! O frontend pode ser burlado, a segurança deve residir no banco.' }
          ]
        }
      ] as AnyBlock[]
    }
  ]
};

export default function App() {
  const { isOffline, setIsOffline, pendingCount, saveProgressMobile, syncPending } = useMobileProgress();
  const [activeLessonId, setActiveLessonId] = useState('lesson-1');
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [videoPositions, setVideoPositions] = useState<Record<string, number>>({
    'lesson-1': 15,
  });

  const activeLesson = mockCourse.lessons.find((l) => l.id === activeLessonId) || mockCourse.lessons[0];

  const handleVideoProgress = async (progressSec: number, durationSec: number) => {
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
    }
  };

  const completedCount = Object.values(completions).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / mockCourse.lessons.length) * 100);

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
          <Text style={styles.courseTag}>Plataforma de Alunos</Text>
          <Text style={styles.courseTitle}>{mockCourse.title}</Text>
          <Text style={styles.courseDesc}>{mockCourse.description}</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>{progressPercent}% concluído ({completedCount}/{mockCourse.lessons.length} aulas)</Text>
          </View>
        </View>

        <View style={styles.playerCard}>
          <Text style={styles.lessonHeaderTitle}>{activeLesson.title}</Text>
          
          <BlockRenderer
            blocks={activeLesson.blocks}
            onVideoProgress={handleVideoProgress}
            savedPosition={videoPositions[activeLessonId] || 0}
          />

          <TouchableOpacity 
            style={[styles.completeBtn, completions[activeLessonId] && styles.completeBtnActive]}
            onPress={handleManualComplete}
          >
            <CheckCircle size={16} color={completions[activeLessonId] ? '#818cf8' : '#cbd5e1'} />
            <Text style={[styles.completeBtnText, completions[activeLessonId] && styles.completeBtnTextActive]}>
              {completions[activeLessonId] ? 'Aula Concluída' : 'Marcar como Concluída'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.curriculumContainer}>
          <Text style={styles.sectionTitle}>Currículo do Curso</Text>
          
          {mockCourse.lessons.map((les) => {
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
