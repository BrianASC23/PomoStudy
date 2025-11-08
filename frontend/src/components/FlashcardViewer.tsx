import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
}

export function FlashcardViewer({ flashcards }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (flashcards.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No flashcards available. Add some in the configuration menu!
      </Card>
    );
  }

  const currentCard = flashcards[currentIndex];

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Card {currentIndex + 1} of {flashcards.length}
      </div>
      
      <Card 
        className="p-8 min-h-[200px] flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={flipCard}
      >
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            {isFlipped ? 'Answer' : 'Question'}
          </div>
          <div className="text-xl">
            {isFlipped ? currentCard.back : currentCard.front}
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-2">
        <Button onClick={prevCard} variant="outline" size="sm">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button onClick={flipCard} variant="outline" size="sm">
          <RotateCw className="h-4 w-4 mr-2" />
          Flip Card
        </Button>
        
        <Button onClick={nextCard} variant="outline" size="sm">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
