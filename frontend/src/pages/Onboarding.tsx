import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Brain, Clock, Video, Waves, Cloud, Wind, Coffee } from 'lucide-react';

interface OnboardingProps {
  onComplete: (settings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    studyVibe: string;
    audioUrl: string;
    backgroundVideo: string;
  }) => void;
}

const studyVibes = [
  {
    id: 'rain',
    name: 'Rainy Day',
    description: 'Cozy cafe with rain sounds',
    icon: Cloud,
    audioUrl: 'rainnoise.mp3',
    backgroundVideo: 'rainwallpaper.mp4',
  },
  {
    id: 'waves',
    name: 'Ocean Waves',
    description: 'Study by the seaside',
    icon: Waves,
    audioUrl: 'oceannoise.mp3',
    backgroundVideo: 'oceanwallpaper.mp4',
  },
  {
    id: 'cafe',
    name: 'Cafe Ambience',
    description: 'Busy coffee shop atmosphere',
    icon: Coffee,
    audioUrl: 'coffeenoise.mp3',
    backgroundVideo: 'coffeewallpaper.mp4',
  },
  {
    id: 'whitenoise',
    name: 'White Noise',
    description: 'Calm white noise background',
    icon: Wind,
    audioUrl: 'whitenoise.mp3',
    backgroundVideo: 'whitenoisewallpaper.mp4',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [selectedVibe, setSelectedVibe] = useState('rain');

  const handleComplete = () => {
    const selectedVibeData = studyVibes.find(vibe => vibe.id === selectedVibe);
    onComplete({
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      studyVibe: selectedVibe,
      audioUrl: selectedVibeData?.audioUrl || '',
      backgroundVideo: selectedVibeData?.backgroundVideo || '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      >
        <source src="rain-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <Card className="w-full max-w-2xl p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2">Welcome to AI Study Companion</h1>
          <p className="text-muted-foreground">
            Let's set up your perfect study environment
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`h-2 w-20 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
          <div className={`h-2 w-20 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
        </div>

        {/* Step 1: Pomodoro Settings */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-3 text-blue-500" />
              <h2 className="mb-2">Configure Your Timer</h2>
              <p className="text-muted-foreground">
                Set your ideal focus and break durations
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm">Focus Duration</label>
                  <span className="text-sm tabular-nums">{workDuration} minutes</span>
                </div>
                <Slider
                  value={[workDuration]}
                  onValueChange={(value) => setWorkDuration(value[0])}
                  min={5}
                  max={60}
                  step={5}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm">Short Break</label>
                  <span className="text-sm tabular-nums">{shortBreakDuration} minutes</span>
                </div>
                <Slider
                  value={[shortBreakDuration]}
                  onValueChange={(value) => setShortBreakDuration(value[0])}
                  min={3}
                  max={15}
                  step={1}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm">Long Break</label>
                  <span className="text-sm tabular-nums">{longBreakDuration} minutes</span>
                </div>
                <Slider
                  value={[longBreakDuration]}
                  onValueChange={(value) => setLongBreakDuration(value[0])}
                  min={10}
                  max={30}
                  step={5}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} size="lg">
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Study Vibe */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <Video className="w-12 h-12 mx-auto mb-3 text-blue-500" />
              <h2 className="mb-2">Choose Your Study Vibe</h2>
              <p className="text-muted-foreground">
                Select a background atmosphere to help you focus
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {studyVibes.map((vibe) => {
                const Icon = vibe.icon;
                return (
                  <button
                    key={vibe.id}
                    onClick={() => setSelectedVibe(vibe.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedVibe === vibe.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${
                      selectedVibe === vibe.id ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <div className="mb-1">{vibe.name}</div>
                    <p className="text-xs text-muted-foreground">{vibe.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleComplete} size="lg">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}