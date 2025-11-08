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

  // Initialize audio element when audioUrl changes
  useEffect(() => {
    if (!audioUrl) {
      // Clean up if no audio URL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Set up event listeners
    const handleEnded = () => {
      // Restart playback when it ends (shouldn't happen with loop=true, but as backup)
      if (isPlaying) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }
    };

    const handleLoad = () => {
      // Auto-play if it was playing before URL change
      if (isPlaying) {
        audio.play().catch(console.error);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadeddata', handleLoad);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadeddata', handleLoad);
      audio.pause();
    };
  }, [audioUrl]); // Only depend on audioUrl

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Reset playing state when audio URL changes
  useEffect(() => {
    setIsPlaying(false);
  }, [audioUrl]);

  const togglePlayPause = async () => {
    if (!audioRef.current || !audioUrl) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling audio playback:', error);
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 0.5);
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
      
      {/* Display current status */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        {isPlaying ? 'Playing' : 'Paused'} • Background Audio
      </div>
    </Card>
  );
}