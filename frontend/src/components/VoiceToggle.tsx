import { Button } from './ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VoiceToggleProps {
  enabled: boolean;
  onToggle: () => void;
  currentMessage?: string;
}

export function VoiceToggle({ enabled, onToggle, currentMessage }: VoiceToggleProps) {
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  if (!speechSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Button 
        onClick={onToggle} 
        variant={enabled ? "default" : "outline"}
        size="sm"
        className="gap-2"
      >
        {enabled ? (
          <>
            <Volume2 className="h-4 w-4" />
            Voice On
          </>
        ) : (
          <>
            <VolumeX className="h-4 w-4" />
            Voice Off
          </>
        )}
      </Button>
      {enabled && currentMessage && (
        <div className="text-sm text-muted-foreground italic max-w-md truncate">
          "{currentMessage}"
        </div>
      )}
    </div>
  );
}
