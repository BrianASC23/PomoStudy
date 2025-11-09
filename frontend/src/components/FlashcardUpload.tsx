import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardResponse {
  flashcards: Flashcard[];
  count: number;
  source: string;
  filename?: string;
}

export const FlashcardUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('count', count.toString());

    try {
      const response = await fetch('http://localhost:8001/api/generate-flashcards', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate flashcards');
      }

      const data: FlashcardResponse = await response.json();
      setFlashcards(data.flashcards);
      setSuccess(true);
      
      // Clear the file input after successful upload
      setFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSupportedFormats = () => {
    return 'PDF, PowerPoint (PPT/PPTX), Images (JPG, PNG, GIF, WEBP), Text (TXT, MD)';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Study Materials
          </CardTitle>
          <CardDescription>
            Upload your notes or study materials to generate flashcards automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.txt,.md"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="cursor-pointer"
                />
                {file && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {file.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: {getSupportedFormats()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Number of Flashcards</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 10)}
                disabled={loading}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Generate between 1 and 50 flashcards
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Flashcards...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Generate Flashcards
                </>
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully generated {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {flashcards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Flashcards ({flashcards.length})</CardTitle>
            <CardDescription>
              Review your flashcards below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flashcards.map((card, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">
                          Question {index + 1}:
                        </p>
                        <p className="font-medium">{card.question}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">
                          Answer:
                        </p>
                        <p className="text-sm">{card.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FlashcardUpload;
