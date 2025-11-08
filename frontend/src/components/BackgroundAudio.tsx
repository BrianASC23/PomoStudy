import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface BackgroundAudioProps {
  audioUrl: string | null;
}

export function BackgroundAudio({ audioUrl }: BackgroundAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Reset playing state when audio URL changes
    setIsPlaying(false);
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.5);
    }
  };

  if (!audioUrl) {
    return (
      <Card className="p-4">
        <div className="text-center text-sm text-muted-foreground">
          No background audio loaded. Upload one in settings!
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex items-center gap-3">
        <Button onClick={togglePlayPause} variant="outline" size="sm">
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button onClick={toggleMute} variant="ghost" size="sm">
          {volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1">
          <Slider
            value={[volume]}
            onValueChange={(values) => setVolume(values[0])}
            max={1}
            step={0.01}
            className="flex-1"
          />
        </div>

        <span className="text-sm text-muted-foreground w-12 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </Card>
  );
}
