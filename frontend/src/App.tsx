import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import type { Flashcard } from './components/FlashcardViewer';

interface StudySettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  flashcards: Flashcard[];
  audioUrl: string | null;
  voiceEnabled: boolean;
}

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
  const [settings, setSettings] = useState<StudySettings>(() => {
    const saved = localStorage.getItem('studyCompanionSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      flashcards: defaultFlashcards,
      audioUrl: null,
      voiceEnabled: true,
    };
  });

  const [currentPage, setCurrentPage] = useState<'home' | 'settings'>('home');

  useEffect(() => {
    localStorage.setItem('studyCompanionSettings', JSON.stringify(settings));
  }, [settings]);

  const navigate = (page: 'home' | 'settings') => {
    setCurrentPage(page);
  };

  return (
    <>
      {currentPage === 'home' && (
        <Home 
          settings={settings} 
          onSettingsChange={setSettings}
          onNavigate={navigate}
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
