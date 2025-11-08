import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PomodoroTimerProps {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  onSessionComplete: (sessionType: 'work' | 'break') => void;
}

export function PomodoroTimer({ 
  workDuration, 
  shortBreakDuration, 
  longBreakDuration,
  onSessionComplete 
}: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    // Reset timer when durations change
    if (!isRunning) {
      const duration = sessionType === 'work' ? workDuration : 
                      sessionType === 'shortBreak' ? shortBreakDuration : 
                      longBreakDuration;
      setTimeLeft(duration * 60);
    }
  }, [workDuration, shortBreakDuration, longBreakDuration, sessionType, isRunning]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    if (sessionType === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      onSessionComplete('work');
      
      // Every 4 work sessions, take a long break
      if (newCount % 4 === 0) {
        setSessionType('longBreak');
        setTimeLeft(longBreakDuration * 60);
      } else {
        setSessionType('shortBreak');
        setTimeLeft(shortBreakDuration * 60);
      }
    } else {
      onSessionComplete('break');
      setSessionType('work');
      setTimeLeft(workDuration * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const duration = sessionType === 'work' ? workDuration : 
                    sessionType === 'shortBreak' ? shortBreakDuration : 
                    longBreakDuration;
    setTimeLeft(duration * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getSessionLabel = () => {
    if (sessionType === 'work') return 'Focus Time';
    if (sessionType === 'shortBreak') return 'Short Break';
    return 'Long Break';
  };

  const getSessionColor = () => {
    if (sessionType === 'work') return 'bg-blue-500';
    if (sessionType === 'shortBreak') return 'bg-green-500';
    return 'bg-purple-500';
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className={`px-4 py-2 rounded-full ${getSessionColor()} text-white`}>
          {getSessionLabel()}
        </div>
        
        <div className="text-6xl tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Session {sessionCount + 1} • {sessionCount % 4 === 3 ? 'Long break next' : `${3 - (sessionCount % 4)} until long break`}
        </div>

        <div className="flex gap-2">
          <Button onClick={toggleTimer} size="lg">
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Start
              </>
            )}
          </Button>
          
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
