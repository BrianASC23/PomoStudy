import { useState, useEffect, useRef } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { VoiceToggle } from '../components/VoiceToggle';
import { Button } from '../components/ui/button';
import { Settings, Brain, Play, Pause, RotateCcw, MessageCircle, X } from 'lucide-react';
import type { Flashcard } from '../components/FlashcardViewer';
import type { ChatMessage } from '../components/ChatMessage';
import type { StudySettings } from '../types/settings';
import { BackgroundAudio } from '../components/BackgroundAudio';

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

// Update these to use the actual video paths from your onboarding
const studyVibeVideos: Record<string, string> = {
  rain: '../../public/rainwallpaper.mp4',
  waves: '../../public/oceanwallpaper.mp4',
  cafe: '../../public/coffeewallpaper.mp4',
  whitenoise: '../../public/whitenoisewallpaper.mp4',
};

interface HomeProps {
  settings: StudySettings;
  onSettingsChange: (settings: StudySettings) => void;
  onNavigate: (page: 'home' | 'settings') => void;
  audioStartUrl?: string | null;
  audioEndUrl?: string | null;
}

export function Home({ settings, onSettingsChange, onNavigate, audioStartUrl, audioEndUrl }: HomeProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentVoiceMessage, setCurrentVoiceMessage] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(settings.workDuration * 60);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startAudioRef = useRef<HTMLAudioElement>(null);
  const endAudioRef = useRef<HTMLAudioElement>(null);

  // --- Play Audio Helper ---
  const playAudio = (ref: React.RefObject<HTMLAudioElement>) => {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => { });
    }
  };

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

  // Update video source when studyVibe changes
  useEffect(() => {
    if (videoRef.current) {
      const videoUrl = studyVibeVideos[settings.studyVibe] || studyVibeVideos.rain;
      videoRef.current.src = videoUrl;
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, but the video will be ready
        console.log('Autoplay was prevented');
      });
    }
  }, [settings.studyVibe]);

  // Autostart timer on enter
  useEffect(() => {
    if (!timerActive) {
      setTimerActive(true);
      if (startAudioRef.current) playAudio(startAudioRef);
    }
    // eslint-disable-next-line
  }, []);

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
  };

  const handleTimerComplete = () => {
    setTimerActive(false);

    if (sessionType === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);

      // Play END audio for work phase
      if (endAudioRef.current) playAudio(endAudioRef);

      if (newCount % 4 === 0) {
        setSessionType('break');
        setTimerSeconds(settings.longBreakDuration * 60);
        addMessage(`🎉 Amazing work! You've completed 4 focus sessions. Time for a well-deserved ${settings.longBreakDuration}-minute long break!`, 'timer');
        setTimeout(() => {
          setTimerActive(true);
          if (startAudioRef.current) playAudio(startAudioRef);
        }, 1000);
      } else {
        setSessionType('break');
        setTimerSeconds(settings.shortBreakDuration * 60);
        addMessage(`✨ Great job! Focus session complete. Take a ${settings.shortBreakDuration}-minute break to recharge.`, 'timer');
        setTimeout(() => {
          setTimerActive(true);
          if (startAudioRef.current) playAudio(startAudioRef);
        }, 1000);
      }
    } else {
      // Just finished a break, play break-end audio
      if (endAudioRef.current) playAudio(endAudioRef);

      setSessionType('work');
      setTimerSeconds(settings.workDuration * 60);
      addMessage(`💪 Break's over! Ready to crush another ${settings.workDuration}-minute focus session? Let's do this!`, 'timer');
      setTimeout(() => {
        setTimerActive(true);
        if (startAudioRef.current) playAudio(startAudioRef);
      }, 1000);
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
          if (startAudioRef.current) playAudio(startAudioRef);
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
          if (startAudioRef.current) playAudio(startAudioRef);
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

  const handlePlayPause = () => {
    setTimerActive(!timerActive);
    if (!timerActive) {
      if (startAudioRef.current) playAudio(startAudioRef);
    }
  };

  const handleRestart = () => {
    setTimerActive(false);
    if (sessionType === 'work') {
      setTimerSeconds(settings.workDuration * 60);
    } else {
      setTimerSeconds(settings.shortBreakDuration * 60);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const videoUrl = studyVibeVideos[settings.studyVibe] || studyVibeVideos.rain;

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Hidden audio elements for phase transitions */}
      <audio ref={startAudioRef} src={audioStartUrl || undefined} hidden />
      <audio ref={endAudioRef} src={audioEndUrl || undefined} hidden />

      {/* Top Navigation Bar */}
      <div className="border-b bg-background/95 backdrop-blur z-10">
        <div className="px-4 py-2 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm">AI Study Companion</span>
          </div>

          {/* Center - Session Info, Timer & Controls */}
          <div className="flex items-center gap-4">
            {/* Session Type Badge */}
            <div className={`px-2 py-1 rounded-full text-xs ${sessionType === 'work'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}>
              {sessionType === 'work' ? '🎯 Focus' : '☕ Break'} • Session {sessionCount + 1}
            </div>

            {/* Timer Display */}
            <div className="text-xl tabular-nums">
              {formatTime(timerSeconds)}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="h-8 w-8 p-0"
              >
                {timerActive ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestart}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right - Settings */}
          <Button variant="outline" size="sm" onClick={() => onNavigate('settings')}>
            <Settings className="mr-2 h-3 w-3" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Video Background */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          key={settings.studyVibe} // Add key to force re-render when vibe changes
        />

        {/* Overlay gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* Voice Toggle - Bottom Left */}
        <div className="absolute bottom-6 left-6 z-20">
          <VoiceToggle
            enabled={settings.voiceEnabled}
            onToggle={() => onSettingsChange({ ...settings, voiceEnabled: !settings.voiceEnabled })}
            currentMessage={currentVoiceMessage}
          />
        </div>

        {/* Background Audio Controls - Bottom Center */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-80">
          <BackgroundAudio audioUrl={settings.audioUrl} />
        </div>

        {/* Chat Toggle Button - when chat is closed */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="absolute bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all z-20"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}

        {/* Chat Panel - Right Side */}
        {chatOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-background/95 backdrop-blur border-l shadow-2xl flex flex-col z-20">
            {/* Chat Header */}
            <div className="border-b p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span>Study Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 overflow-hidden">
              <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}