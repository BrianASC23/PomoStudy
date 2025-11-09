import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import { Onboarding } from './pages/Onboarding';
import type { Flashcard } from './components/FlashcardViewer';
import type { StudySettings } from './types/settings';

import type { AudioConfig } from './api/audioApi';
import {
  defaultAudioConfig,
  fetchPomodoroStartAudio,
  fetchPomodoroEndAudio
} from './api/audioApi';

const defaultFlashcards: Flashcard[] = [
  {
    id: '1',
    front: 'What is the Pomodoro Technique?',
    back: 'A time management method using 25-minute focused work intervals followed by short breaks.'
  },
  {
    id: '2',
    front: 'What is spaced repetition?',
    back: 'A learning technique that incorporates increasing intervals of time between reviews of previously learned material.'
  },
  {
    id: '3',
    front: 'Why are breaks important when studying?',
    back: 'Breaks help prevent mental fatigue, improve focus, and enhance long-term retention of information.'
  }
];

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  });

  const [settings, setSettings] = useState<StudySettings>(() => {
    const saved = localStorage.getItem('studyCompanionSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure voiceSettings exists for backwards compatibility
      if (!parsed.voiceSettings) {
        parsed.voiceSettings = {
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          speed: 1.0,
          stability: 0.5,
          similarity: 0.75,
          styleExaggeration: 0.0,
          speakerBoost: true,
        };
      }
      return parsed;
    }
    return {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      flashcards: defaultFlashcards,
      audioUrl: null,
      voiceEnabled: true,
      studyVibe: 'rain',
      voiceSettings: {
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        speed: 1.0,
        stability: 0.5,
        similarity: 0.75,
        styleExaggeration: 0.0,
        speakerBoost: true,
      },
    };
  });

  const [audioStartUrl, setAudioStartUrl] = useState<string | null>(null);
  const [audioEndUrl, setAudioEndUrl] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<'home' | 'settings'>('home');

  useEffect(() => {
    localStorage.setItem('studyCompanionSettings', JSON.stringify(settings));
  }, [settings]);

  // Fetch audio when voiceSettings change
  useEffect(() => {
    let isActive = true;
    async function updateAudio() {
      const config: AudioConfig = settings.voiceSettings || defaultAudioConfig;
      const [start, end] = await Promise.all([
        fetchPomodoroStartAudio(config),
        fetchPomodoroEndAudio(config)
      ]);
      if (isActive) {
        setAudioStartUrl(start);
        setAudioEndUrl(end);
      }
    }
    updateAudio();
    return () => { isActive = false; };
  }, [
    settings.voiceSettings?.voiceId,
    settings.voiceSettings?.speed,
    settings.voiceSettings?.stability,
    settings.voiceSettings?.similarity,
    settings.voiceSettings?.styleExaggeration,
    settings.voiceSettings?.speakerBoost,
  ]);

  const handleOnboardingComplete = (onboardingSettings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    studyVibe: string;
  }) => {
    setSettings({
      ...settings,
      ...onboardingSettings,
    });
    setHasCompletedOnboarding(true);
    localStorage.setItem('hasCompletedOnboarding', 'true');
  };

  const navigate = (page: 'home' | 'settings') => {
    setCurrentPage(page);
  };

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      {currentPage === 'home' && (
        <Home
          settings={settings}
          onSettingsChange={setSettings}
          onNavigate={navigate}
          audioStartUrl={audioStartUrl}
          audioEndUrl={audioEndUrl}
        />
      )}
      {currentPage === 'settings' && (
        <Settings
          settings={settings}
          onSettingsChange={setSettings}
          onNavigate={navigate}
        />
      )}
    </>
  );
}