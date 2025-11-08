import { useState, useEffect, useRef } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { VoiceToggle } from '../components/VoiceToggle';
import { Button } from '../components/ui/button';
import { Settings, Brain } from 'lucide-react';
import type { Flashcard } from '../components/FlashcardViewer';
import type { ChatMessage } from '../components/ChatMessage';

interface StudySettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  flashcards: Flashcard[];
  audioUrl: string | null;
  voiceEnabled: boolean;
}

const motivationalMessages = [
  "You're doing great! Keep up the amazing work!",
  "Stay focused! Every minute of study brings you closer to your goals.",
  "Remember why you started. You've got this!",
  "Your dedication is impressive. Keep pushing forward!",
  "You're building your future with every study session.",
  "Great job staying focused! Your hard work will pay off.",
  "Keep going! Success is just around the corner.",
  "You're making excellent progress. Don't give up now!",
];

interface HomeProps {
  settings: StudySettings;
  onSettingsChange: (settings: StudySettings) => void;
  onNavigate: (page: 'home' | 'settings') => void;
}

export function Home({ settings, onSettingsChange, onNavigate }: HomeProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentVoiceMessage, setCurrentVoiceMessage] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(settings.workDuration * 60);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer logic
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, timerSeconds]);

  // Background audio
  useEffect(() => {
    if (settings.audioUrl && !audioRef.current) {
      audioRef.current = new Audio(settings.audioUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    
    if (audioRef.current && timerActive && sessionType === 'work') {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [timerActive, sessionType, settings.audioUrl]);

  const speak = (text: string) => {
    if (!settings.voiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    setCurrentVoiceMessage(text);
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      setTimeout(() => setCurrentVoiceMessage(''), 2000);
    };
  };

  const addMessage = (content: string, type: ChatMessage['type'] = 'text', flashcard?: { front: string; back: string }) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      role: 'assistant',
      content,
      type,
      timestamp: new Date(),
      flashcard,
    };
    setMessages((prev) => [...prev, newMessage]);
    
    if (settings.voiceEnabled) {
      speak(content);
    }
  };

  const handleTimerComplete = () => {
    setTimerActive(false);

    if (sessionType === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      
      if (newCount % 4 === 0) {
        setSessionType('break');
        setTimerSeconds(settings.longBreakDuration * 60);
        addMessage(`🎉 Amazing work! You've completed 4 focus sessions. Time for a well-deserved ${settings.longBreakDuration}-minute long break!`, 'timer');
      } else {
        setSessionType('break');
        setTimerSeconds(settings.shortBreakDuration * 60);
        addMessage(`✨ Great job! Focus session complete. Take a ${settings.shortBreakDuration}-minute break to recharge.`, 'timer');
      }
    } else {
      setSessionType('work');
      setTimerSeconds(settings.workDuration * 60);
      addMessage(`💪 Break's over! Ready to crush another ${settings.workDuration}-minute focus session? Let's do this!`, 'timer');
    }
  };

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      type: 'text',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Process user input and generate AI response
    setTimeout(() => {
      const lowerContent = content.toLowerCase();

      if (lowerContent.includes('start') || lowerContent.includes('begin') || lowerContent.includes('focus')) {
        if (!timerActive) {
          setTimerActive(true);
          setSessionType('work');
          setTimerSeconds(settings.workDuration * 60);
          addMessage(`🚀 Let's get started! Your ${settings.workDuration}-minute focus session is now active. I'll be here to keep you motivated!`, 'timer');
        } else {
          addMessage("You already have an active session! Keep going, you're doing great!", 'text');
        }
      } else if (lowerContent.includes('stop') || lowerContent.includes('pause')) {
        if (timerActive) {
          setTimerActive(false);
          addMessage("Session paused. Take a moment if you need it, but remember your goals! Type 'resume' when you're ready.", 'text');
        } else {
          addMessage("No active session to pause. Type 'start' when you want to begin!", 'text');
        }
      } else if (lowerContent.includes('resume') || lowerContent.includes('continue')) {
        if (!timerActive && timerSeconds > 0) {
          setTimerActive(true);
          addMessage("Welcome back! Resuming your session. Let's finish strong! 💪", 'text');
        } else {
          addMessage("Type 'start' to begin a new focus session!", 'text');
        }
      } else if (lowerContent.includes('flashcard') || lowerContent.includes('quiz') || lowerContent.includes('review')) {
        if (settings.flashcards.length > 0) {
          const randomCard = settings.flashcards[Math.floor(Math.random() * settings.flashcards.length)];
          addMessage("Here's a flashcard to review! Click on it to flip between question and answer.", 'flashcard', {
            front: randomCard.front,
            back: randomCard.back,
          });
        } else {
          addMessage("You don't have any flashcards yet. Add some in the settings menu!", 'text');
        }
      } else if (lowerContent.includes('motivate') || lowerContent.includes('encourage') || lowerContent.includes('help')) {
        const randomMotivation = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        addMessage(randomMotivation, 'motivation');
      } else if (lowerContent.includes('status') || lowerContent.includes('time')) {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        const statusMessage = timerActive 
          ? `⏱️ Current ${sessionType} session: ${minutes}:${String(seconds).padStart(2, '0')} remaining. You're on session ${sessionCount + 1}!`
          : "No active session. Type 'start' to begin a focus session!";
        addMessage(statusMessage, 'text');
      } else {
        const responses = [
          "I'm here to help you study! You can ask me to 'start' a session, show a 'flashcard', give you 'motivation', or check your 'status'.",
          "Let's make today productive! Try asking me to start a focus session or review a flashcard.",
          "I'm your study companion! I can help you with focus sessions, flashcards, and motivation. What would you like to do?",
        ];
        addMessage(responses[Math.floor(Math.random() * responses.length)], 'text');
      }
    }, 500);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2>AI Study Companion</h2>
              <div className="text-xs text-muted-foreground">
                Session {sessionCount + 1}
              </div>
            </div>
          </div>

          {/* Center - Timer Status & Voice Toggle */}
          <div className="flex-1 flex justify-center items-center gap-6">
            {/* Timer Display */}
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-full text-sm ${
                sessionType === 'work' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}>
                {sessionType === 'work' ? '🎯 Focus' : '☕ Break'}
              </div>
              <div className="text-2xl tabular-nums">
                {formatTime(timerSeconds)}
              </div>
            </div>
            
            {/* Voice Toggle */}
            <VoiceToggle
              enabled={settings.voiceEnabled}
              onToggle={() => onSettingsChange({ ...settings, voiceEnabled: !settings.voiceEnabled })}
              currentMessage={currentVoiceMessage}
            />
          </div>

          {/* Right - Settings */}
          <Button variant="outline" onClick={() => onNavigate('settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 max-w-4xl w-full mx-auto overflow-hidden">
        <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
