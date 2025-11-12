'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { useLocalSummarizer } from '@/hooks/use-local-summarizer';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export function LocalSummarizer() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const { summarize, isLoading, isModelLoaded, progress, error } = useLocalSummarizer();
  const { toast } = useToast();

  const handleSummarize = async () => {
    try {
      const result = await summarize(inputText);
      setSummary(result);
    } catch (err: any) {
      console.error('Summarization error:', err);
      toast({
        variant: 'destructive',
        title: 'Summarization failed',
        description: err.message,
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: 'Copied!',
      description: 'Summary copied to clipboard',
    });
  };

  const loadExampleText = () => {
    const example = `The distributive property is a fundamental concept in algebra that allows us to multiply a number by a sum or difference. When we have an expression like a(b + c), we can distribute the multiplication of 'a' across both 'b' and 'c', resulting in ab + ac. This property is extremely useful in simplifying complex algebraic expressions and solving equations. For example, if we have 3(x + 4), we can distribute the 3 to get 3x + 12. The distributive property works with both addition and subtraction, and it's one of the most frequently used properties in mathematics. It helps us break down complicated problems into smaller, more manageable parts. Understanding this property is crucial for success in algebra and higher-level mathematics.`;
    setInputText(example);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          ✨ Smart Summarizer
        </CardTitle>
        <CardDescription>
          Privately summarize your notes — everything happens on your device, not our servers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Model Loading Status */}
        {!isModelLoaded && isLoading && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              <p className="font-medium mb-2">Loading AI model ({progress}%)</p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                First time only — this will be cached for future use (~45MB)
              </p>
            </AlertDescription>
          </Alert>
        )}

        {isModelLoaded && (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Model ready! Your text never leaves your device. 🔒
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Your Text</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadExampleText}
              disabled={!isModelLoaded}
            >
              Load Example
            </Button>
          </div>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your notes, article, or any text you want summarized (min 50 characters)..."
            className="min-h-[200px]"
            disabled={!isModelLoaded}
          />
          <p className="text-xs text-muted-foreground">
            {inputText.length} characters
            {inputText.length > 0 && inputText.length < 50 && (
              <span className="text-orange-500 ml-2">
                (need at least 50 characters)
              </span>
            )}
          </p>
        </div>

        {/* Summarize Button */}
        <Button
          onClick={handleSummarize}
          disabled={!isModelLoaded || isLoading || inputText.length < 50}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Summarize ✨
            </>
          )}
        </Button>

        {/* Output */}
        {summary && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">✨ Summary</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border">
              <p className="text-sm whitespace-pre-wrap">{summary}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Tip: You can copy this summary to your Cornell Notes or Learning Journal!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

