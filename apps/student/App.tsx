import React, { useState, useEffect } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, config, Theme, Spinner, YStack } from '@projeto/ui';
import { AuthService } from '@projeto/core';
import { StudentDashboard } from './src/screens/StudentDashboard';
import { LessonPlayer } from './src/screens/LessonPlayer';
import { CourseLessons } from './src/screens/CourseLessons';
import { Certificates } from './src/screens/Certificates';
import { StudentLogin } from './src/screens/StudentLogin';

export default function App() {
  const [screen, setScreen] = useState<'loading' | 'login' | 'dashboard' | 'player' | 'courseLessons' | 'certificates'>('loading');
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const session = await AuthService.getSession();
      if (session) {
        setScreen('dashboard');
      } else {
        setScreen('login');
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && screen !== 'loading') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'player') {
        setScreen('player');
      }
    }
  }, [screen]);

  const handlePlay = (id: string) => {
    setCourseId(id);
    setScreen('player');
  };

  const handleNavigateToCourseLessons = (id: string) => {
    setCourseId(id);
    setScreen('courseLessons');
  };

  const handleNavigateToCertificates = () => {
    setScreen('certificates');
  };

  const handleSelectLesson = (lessonId: string) => {
    setScreen('player');
  };

  if (screen === 'loading') {
    return (
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={null}>
          <YStack f={1} ai="center" jc="center">
            <Spinner size="large" color="$primary" />
          </YStack>
        </TamaguiProvider>
      </SafeAreaProvider>
    );
  }

  if (screen === 'login') {
    return (
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={null}>
          <SafeAreaView style={{ flex: 1 }}>
            <StudentLogin onLoginSuccess={() => setScreen('dashboard')} />
          </SafeAreaView>
        </TamaguiProvider>
      </SafeAreaProvider>
    );
  }

  if (screen === 'player') {
    return (
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={null}>
          <Theme name="cloudWhite">
            <SafeAreaView style={{ flex: 1 }}>
              <LessonPlayer courseId={courseId} onBack={() => setScreen('dashboard')} />
            </SafeAreaView>
          </Theme>
        </TamaguiProvider>
      </SafeAreaProvider>
    );
  }

  if (screen === 'courseLessons' && courseId) {
    return (
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={null}>
          <Theme name="cloudWhite">
            <SafeAreaView style={{ flex: 1 }}>
              <CourseLessons
                courseId={courseId}
                onSelectLesson={handleSelectLesson}
                onBack={() => setScreen('dashboard')}
                onViewCertificate={() => setScreen('certificates')}
              />
            </SafeAreaView>
          </Theme>
        </TamaguiProvider>
      </SafeAreaProvider>
    );
  }

  if (screen === 'certificates') {
    return (
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={null}>
          <Theme name="cloudWhite">
            <SafeAreaView style={{ flex: 1 }}>
              <Certificates onBack={() => setScreen('dashboard')} />
            </SafeAreaView>
          </Theme>
        </TamaguiProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme={null}>
        <Theme name="cloudWhite">
          <SafeAreaView style={{ flex: 1 }}>
            <StudentDashboard
              onPlay={handlePlay}
              onNavigateToCourseLessons={handleNavigateToCourseLessons}
              onNavigateToCertificates={handleNavigateToCertificates}
              onLogout={() => setScreen('login')}
            />
          </SafeAreaView>
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
