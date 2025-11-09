import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { X, Plus, ChevronDown } from 'lucide-react';
import type { Flashcard } from './FlashcardViewer';
import type { VoiceSettings } from '../types/settings';
import { FlashcardUpload } from '../components/FlashcardUpload';

interface ConfigurationPanelProps {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  flashcards: Flashcard[];
  voiceSettings: VoiceSettings;
  onWorkDurationChange: (value: number) => void;
  onShortBreakDurationChange: (value: number) => void;
  onLongBreakDurationChange: (value: number) => void;
  onFlashcardsChange: (flashcards: Flashcard[]) => void;
  onAudioUpload: (audioUrl: string) => void;
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
}

const voiceOptions = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
];

export function ConfigurationPanel({
  workDuration,
  shortBreakDuration,
  longBreakDuration,
  flashcards,
  voiceSettings,
  onWorkDurationChange,
  onShortBreakDurationChange,
  onLongBreakDurationChange,
  onFlashcardsChange,
  onAudioUpload,
  onVoiceSettingsChange,
}: ConfigurationPanelProps) {
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [bulkImport, setBulkImport] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleAddFlashcard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newCardFront.trim(),
      back: newCardBack.trim(),
    };

    onFlashcardsChange([...flashcards, newCard]);
    setNewCardFront('');
    setNewCardBack('');
  };

  const handleRemoveFlashcard = (id: string) => {
    onFlashcardsChange(flashcards.filter(card => card.id !== id));
  };

  const handleBulkImport = () => {
    if (!bulkImport.trim()) return;

    const lines = bulkImport.split('\n');
    const newCards: Flashcard[] = [];

    lines.forEach(line => {
      const parts = line.split('|');
      if (parts.length >= 2) {
        newCards.push({
          id: Date.now().toString() + Math.random(),
          front: parts[0].trim(),
          back: parts[1].trim(),
        });
      }
    });

    if (newCards.length > 0) {
      onFlashcardsChange([...flashcards, ...newCards]);
      setBulkImport('');
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file');
        e.target.value = '';
        return;
      }
      
      // Create object URL for the uploaded file
      const url = URL.createObjectURL(file);
      onAudioUpload(url);
      
      // Clear the input to allow uploading the same file again
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="work-duration">Work Duration (minutes)</Label>
              <Input
                id="work-duration"
                type="number"
                min="1"
                max="120"
                value={workDuration}
                onChange={(e) => onWorkDurationChange(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-break">Short Break (minutes)</Label>
              <Input
                id="short-break"
                type="number"
                min="1"
                max="60"
                value={shortBreakDuration}
                onChange={(e) => onShortBreakDurationChange(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long-break">Long Break (minutes)</Label>
              <Input
                id="long-break"
                type="number"
                min="1"
                max="60"
                value={longBreakDuration}
                onChange={(e) => onLongBreakDurationChange(Number(e.target.value))}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              After 4 work sessions, you'll get a long break.
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards" className="space-y-4">
          <Card className="p-4 space-y-4">
          <div className="mt-8">
            <FlashcardUpload flashcards={flashcards} onFlashcardsChange={onFlashcardsChange} />
          </div>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio-upload">Upload Background Audio</Label>
              <Input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
              />
              <div className="text-sm text-muted-foreground">
                Upload MP3, WAV, or other audio files for background/white noise
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card className="p-4 space-y-6">
            {/* Voice ID Selection */}
            <div className="space-y-2">
              <Label htmlFor="voice-id">Voice</Label>
              <Select
                value={voiceSettings.voiceId}
                onValueChange={(value) =>
                  onVoiceSettingsChange({ ...voiceSettings, voiceId: value })
                }
              >
                <SelectTrigger id="voice-id">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Speed Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="speed">Speed</Label>
                <span className="text-sm text-muted-foreground">
                  {voiceSettings.speed.toFixed(2)}x
                </span>
              </div>
              <Slider
                id="speed"
                value={[voiceSettings.speed]}
                onValueChange={(value) =>
                  onVoiceSettingsChange({ ...voiceSettings, speed: value[0] })
                }
                min={0.5}
                max={2.0}
                step={0.1}
              />
            </div>

            {/* Advanced Settings */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-2"
                >
                  <span className="text-sm">Advanced Settings</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      advancedOpen ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {/* Stability Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="stability">Stability</Label>
                    <span className="text-sm text-muted-foreground">
                      {voiceSettings.stability.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    id="stability"
                    value={[voiceSettings.stability]}
                    onValueChange={(value) =>
                      onVoiceSettingsChange({ ...voiceSettings, stability: value[0] })
                    }
                    min={0}
                    max={1}
                    step={0.05}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values make the voice more consistent
                  </p>
                </div>

                {/* Similarity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="similarity">Similarity</Label>
                    <span className="text-sm text-muted-foreground">
                      {voiceSettings.similarity.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    id="similarity"
                    value={[voiceSettings.similarity]}
                    onValueChange={(value) =>
                      onVoiceSettingsChange({ ...voiceSettings, similarity: value[0] })
                    }
                    min={0}
                    max={1}
                    step={0.05}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values make the output more similar to the original voice
                  </p>
                </div>

                {/* Style Exaggeration Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="style">Style Exaggeration</Label>
                    <span className="text-sm text-muted-foreground">
                      {voiceSettings.styleExaggeration.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    id="style"
                    value={[voiceSettings.styleExaggeration]}
                    onValueChange={(value) =>
                      onVoiceSettingsChange({
                        ...voiceSettings,
                        styleExaggeration: value[0],
                      })
                    }
                    min={0}
                    max={1}
                    step={0.05}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values amplify the speaking style
                  </p>
                </div>

                {/* Speaker Boost Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="speaker-boost">Speaker Boost</Label>
                    <p className="text-xs text-muted-foreground">
                      Enhance voice clarity and presence
                    </p>
                  </div>
                  <Switch
                    id="speaker-boost"
                    checked={voiceSettings.speakerBoost}
                    onCheckedChange={(checked) =>
                      onVoiceSettingsChange({ ...voiceSettings, speakerBoost: checked })
                    }
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
