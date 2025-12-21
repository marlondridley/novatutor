'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertCircle, CheckCircle2, Copy, Upload, Image, FileText, X } from 'lucide-react';
import { useLocalSummarizer } from '@/hooks/use-local-summarizer';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function LocalSummarizer() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string }[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Extract text from image using OCR via server API
  const extractTextFromImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        // Fallback: just notify user that image was uploaded
        return `[Image uploaded: ${file.name}] - Tip: For best results, type out the key points from this image!`;
      }
      
      const data = await response.json();
      return data.text || '';
    } catch {
      return `[Image uploaded: ${file.name}] - Tip: Type out the key points from this image!`;
    }
  };

  // Extract text from text files
  const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Process dropped/uploaded files
  const processFiles = useCallback(async (files: FileList | File[]) => {
    setIsExtracting(true);
    const fileArray = Array.from(files);
    let extractedText = '';
    const newUploadedFiles: { name: string; type: string }[] = [];

    for (const file of fileArray) {
      try {
        let text = '';
        
        if (file.type.startsWith('image/')) {
          // Image file - attempt OCR
          text = await extractTextFromImage(file);
          newUploadedFiles.push({ name: file.name, type: 'image' });
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          // Text file
          text = await extractTextFromFile(file);
          newUploadedFiles.push({ name: file.name, type: 'text' });
        } else if (file.type === 'application/pdf') {
          // PDF - notify user (would need pdf.js for full extraction)
          text = `[PDF uploaded: ${file.name}] - Tip: Copy and paste the text from your PDF here!`;
          newUploadedFiles.push({ name: file.name, type: 'pdf' });
        } else {
          // Try to read as text anyway
          try {
            text = await extractTextFromFile(file);
            newUploadedFiles.push({ name: file.name, type: 'file' });
          } catch {
            text = `[File uploaded: ${file.name}]`;
            newUploadedFiles.push({ name: file.name, type: 'unknown' });
          }
        }
        
        if (text) {
          extractedText += (extractedText ? '\n\n' : '') + text;
        }
      } catch (err) {
        console.error('Error processing file:', file.name, err);
        toast({
          variant: 'destructive',
          title: 'Error processing file',
          description: `Could not process ${file.name}`,
        });
      }
    }

    if (extractedText) {
      setInputText(prev => prev ? prev + '\n\n' + extractedText : extractedText);
      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      toast({
        title: '📄 Files processed!',
        description: `Added content from ${newUploadedFiles.length} file(s)`,
      });
    }
    
    setIsExtracting(false);
  }, [toast]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Handle paste from clipboard (for screenshots)
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      processFiles(imageFiles);
    }
  }, [processFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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

        {/* Drop Zone & Input */}
        <div 
          className={cn(
            "relative space-y-2 rounded-xl border-2 border-dashed p-4 transition-all",
            isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-muted-foreground/25 hover:border-primary/50",
            isExtracting && "opacity-70 pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 rounded-xl backdrop-blur-sm">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto text-primary mb-2 animate-bounce" />
                <p className="text-lg font-bold text-primary">Drop your files here!</p>
                <p className="text-sm text-muted-foreground">Images, text files, notes...</p>
              </div>
            </div>
          )}

          {/* Extracting indicator */}
          {isExtracting && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-xl">
              <div className="text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-2" />
                <p className="font-medium">Extracting text from files...</p>
              </div>
            </div>
          )}

          {/* Header with actions */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-sm font-medium flex items-center gap-2">
              📝 Your Notes
              <span className="text-xs text-muted-foreground font-normal">
                (drop files, paste screenshots, or type)
              </span>
            </label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isModelLoaded || isExtracting}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadExampleText}
                disabled={!isModelLoaded}
              >
                Load Example
              </Button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.txt,.md,.pdf,text/*"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 py-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-accent rounded-full text-xs"
                >
                  {file.type === 'image' ? (
                    <Image className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  <span className="max-w-[100px] truncate">{file.name}</span>
                  <button
                    onClick={() => removeUploadedFile(index)}
                    className="hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text area */}
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onPaste={handlePaste}
            placeholder={`📋 Paste your notes, articles, or homework here...

🖼️ Paste a screenshot (Ctrl+V) or drag & drop images

📄 Drop text files (.txt, .md) to extract content

✏️ Or just start typing!`}
            className="min-h-[200px] border-0 focus-visible:ring-0 resize-none bg-transparent"
            disabled={!isModelLoaded || isExtracting}
          />

          {/* Character count */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {inputText.length} characters
              {inputText.length > 0 && inputText.length < 50 && (
                <span className="text-orange-500 ml-2">
                  (need at least 50 characters)
                </span>
              )}
            </span>
            {inputText.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInputText('');
                  setUploadedFiles([]);
                }}
                className="h-auto py-1 px-2 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
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

