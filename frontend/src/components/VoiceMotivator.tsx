import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Volume2, VolumeX } from 'lucide-react';

const motivationalMessages = [
  "You're doing great! Keep up the amazing work!",
  "Stay focused! Every minute of study brings you closer to your goals.",
  "Remember why you started. You've got this!",
  "Your dedication is impressive. Keep pushing forward!",
  "Break time is coming soon. Stay strong!",
  "You're building your future with every study session.",
  "Great job staying focused! Your hard work will pay off.",
  "Keep going! Success is just around the corner.",
  "You're making excellent progress. Don't give up now!",
  "Your commitment to learning is truly admirable."
];

const breakMessages = [
  "Time for a break! You've earned it. Stretch and relax.",
  "Great work session! Take a moment to rest your mind.",
  "Break time! Stand up, move around, and recharge.",
  "Excellent focus! Now give your brain a well-deserved rest.",
  "You did it! Enjoy your break and come back refreshed."
];

interface VoiceMotivatorProps {
  enabled: boolean;
  onToggle: () => void;
}

export function VoiceMotivator({ enabled, onToggle }: VoiceMotivatorProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const speak = (message: string) => {
    if (!enabled || !speechSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    setCurrentMessage(message);
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      setTimeout(() => setCurrentMessage(''), 2000);
    };
  };

  const speakRandomMotivation = () => {
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    speak(message);
  };

  const speakBreakMessage = () => {
    const message = breakMessages[Math.floor(Math.random() * breakMessages.length)];
    speak(message);
  };

  // Expose these methods for parent components
  useEffect(() => {
    (window as any).voiceMotivator = {
      speakRandomMotivation,
      speakBreakMessage
    };
  }, [enabled]);

  if (!speechSupported) {
    return (
      <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
        <div className="text-sm text-yellow-800 dark:text-yellow-200">
          Voice motivation is not supported in your browser.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span>Voice Motivation</span>
            <Button onClick={onToggle} variant="ghost" size="sm">
              {enabled ? (
                <Volume2 className="h-4 w-4 text-green-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {currentMessage && (
            <div className="text-sm text-muted-foreground italic">
              "{currentMessage}"
            </div>
          )}
        </div>
        
        <Button onClick={speakRandomMotivation} disabled={!enabled} size="sm">
          Motivate Me
        </Button>
      </div>
    </Card>
  );
}
