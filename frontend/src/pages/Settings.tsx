import { ConfigurationPanel } from '../components/ConfigurationPanel';
import { Button } from '../components/ui/button';
import { ArrowLeft, Brain } from 'lucide-react';
import type { Flashcard } from '../components/FlashcardViewer';

interface StudySettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  flashcards: Flashcard[];
  audioUrl: string | null;
  voiceEnabled: boolean;
}

interface SettingsProps {
  settings: StudySettings;
  onSettingsChange: (settings: StudySettings) => void;
  onNavigate: (page: 'home' | 'settings') => void;
}

export function Settings({ settings, onSettingsChange, onNavigate }: SettingsProps) {

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo & Back Button */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('home')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2>Settings</h2>
              <div className="text-xs text-muted-foreground">
                Configure your study companion
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto p-6">
        <ConfigurationPanel
          workDuration={settings.workDuration}
          shortBreakDuration={settings.shortBreakDuration}
          longBreakDuration={settings.longBreakDuration}
          flashcards={settings.flashcards}
          onWorkDurationChange={(value) =>
            onSettingsChange({ ...settings, workDuration: value })
          }
          onShortBreakDurationChange={(value) =>
            onSettingsChange({ ...settings, shortBreakDuration: value })
          }
          onLongBreakDurationChange={(value) =>
            onSettingsChange({ ...settings, longBreakDuration: value })
          }
          onFlashcardsChange={(flashcards) =>
            onSettingsChange({ ...settings, flashcards })
          }
          onAudioUpload={(audioUrl) =>
            onSettingsChange({ ...settings, audioUrl })
          }
        />
      </div>
    </div>
  );
}
