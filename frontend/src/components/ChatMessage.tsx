import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { useState } from 'react';

export type MessageType = 'text' | 'flashcard' | 'timer' | 'motivation';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: MessageType;
  timestamp: Date;
  flashcard?: {
    front: string;
    back: string;
  };
}

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] bg-blue-500 text-white rounded-2xl px-4 py-3">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant messages
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%]">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {message.type === 'flashcard' && message.flashcard && (
            <Card 
              className="mt-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="text-center">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  {isFlipped ? 'Answer' : 'Question'}
                </div>
                <div>
                  {isFlipped ? message.flashcard.back : message.flashcard.front}
                </div>
                <div className="mt-3 flex justify-center">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(!isFlipped);
                    }} 
                    variant="outline" 
                    size="sm"
                  >
                    <RotateCw className="h-3 w-3 mr-2" />
                    Flip Card
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1 px-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
