import React, { useState } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, config } from '@projeto/ui';
import { StudentDashboard } from './src/screens/StudentDashboard';
import { LessonPlayer } from './src/screens/LessonPlayer';

export default function App() {
  const [screen, setScreen] = useState<'dashboard' | 'player'>('dashboard');

  if (screen === 'player') {
    return (
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={null}>
          <SafeAreaView style={{ flex: 1 }}>
            <LessonPlayer onBack={() => setScreen('dashboard')} />
          </SafeAreaView>
        </TamaguiProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme={null}>
        <SafeAreaView style={{ flex: 1 }}>
          <StudentDashboard onPlay={() => setScreen('player')} />
        </SafeAreaView>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
