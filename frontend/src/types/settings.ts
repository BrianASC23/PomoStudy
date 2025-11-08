import type { Flashcard } from '../components/FlashcardViewer';

export interface VoiceSettings {
  voiceId: string;
  speed: number;
  stability: number;
  similarity: number;
  styleExaggeration: number;
  speakerBoost: boolean;
}

export interface StudySettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  flashcards: Flashcard[];
  audioUrl: string | null;
  voiceEnabled: boolean;
  studyVibe: string;
  voiceSettings: VoiceSettings;
}
