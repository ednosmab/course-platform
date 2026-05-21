import React, { useState, useEffect } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, config } from '@projeto/ui';
import { StudentDashboard } from './src/screens/StudentDashboard';
import { LessonPlayer } from './src/screens/LessonPlayer';

export default function App() {
  const [screen, setScreen] = useState<'dashboard' | 'player'>('dashboard');
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'player') {
        setScreen('player');
      }
    }
  }, []);

  const handlePlay = (id: string) => {
    setCourseId(id);
    setScreen('player');
  };

  if (screen === 'player') {
    return (
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={null}>
          <SafeAreaView style={{ flex: 1 }}>
            <LessonPlayer courseId={courseId} onBack={() => setScreen('dashboard')} />
          </SafeAreaView>
        </TamaguiProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme={null}>
        <SafeAreaView style={{ flex: 1 }}>
          <StudentDashboard onPlay={handlePlay} />
        </SafeAreaView>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
