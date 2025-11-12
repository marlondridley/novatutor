"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  Loader2,
  BookOpen,
  Lightbulb,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface CornellNote {
  id?: string;
  subject: string;
  topic: string;
  cue_column: string[];
  note_body: string;
  summary: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

interface CornellNoteEditorProps {
  noteId?: string;
  onSave?: () => void;
}

export function CornellNoteEditor({ noteId, onSave }: CornellNoteEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [note, setNote] = useState<CornellNote>({
    subject: "",
    topic: "",
    cue_column: [""],
    note_body: "",
    summary: "",
    tags: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [suggestingCues, setSuggestingCues] = useState(false);

  // Load existing note if noteId provided
  useEffect(() => {
    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  const fetchNote = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}`);
      if (response.ok) {
        const data = await response.json();
        setNote(data.note);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load note",
        });
      }
    } catch (error) {
      console.error("Error fetching note:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save debounce
  useEffect(() => {
    if (!noteId || autoSaveStatus === 'saved') return;

    const timeoutId = setTimeout(() => {
      handleSave(true);
    }, 2000); // Auto-save after 2 seconds of no changes

    return () => clearTimeout(timeoutId);
  }, [note, noteId, autoSaveStatus]);

  const handleSave = async (isAutoSave = false) => {
    if (!note.subject || !note.topic) {
      if (!isAutoSave) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please provide a subject and topic",
        });
      }
      return;
    }

    setSaving(true);
    setAutoSaveStatus('saving');

    try {
      const url = noteId ? `/api/notes/${noteId}` : '/api/notes';
      const method = noteId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });

      if (response.ok) {
        const data = await response.json();
        setAutoSaveStatus('saved');
        
        if (!noteId) {
          // New note created, redirect to edit mode
          router.push(`/journal/${data.note.id}`);
        }
        
        if (!isAutoSave) {
          toast({
            title: "✅ Saved!",
            description: "Great work staying organized.",
          });
        }
        
        if (onSave) onSave();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error("Error saving note:", error);
      setAutoSaveStatus('unsaved');
      if (!isAutoSave) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save note",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSuggestCues = async () => {
    if (!note.topic) {
      toast({
        variant: "destructive",
        title: "Topic Required",
        description: "Please add a topic before generating cue questions",
      });
      return;
    }

    setSuggestingCues(true);
    try {
      const response = await fetch('/api/notes/suggest-cues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: note.topic, 
          noteBody: note.note_body 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNote(prev => ({
          ...prev,
          cue_column: [...prev.cue_column.filter(c => c), ...data.cues],
        }));
        setAutoSaveStatus('unsaved');
        toast({
          title: "✨ Cues Generated!",
          description: "Use these to guide your learning",
        });
      }
    } catch (error) {
      console.error("Error suggesting cues:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate cue questions",
      });
    } finally {
      setSuggestingCues(false);
    }
  };

  const updateCue = (index: number, value: string) => {
    const newCues = [...note.cue_column];
    newCues[index] = value;
    setNote(prev => ({ ...prev, cue_column: newCues }));
    setAutoSaveStatus('unsaved');
  };

  const addCue = () => {
    setNote(prev => ({ 
      ...prev, 
      cue_column: [...prev.cue_column, ""] 
    }));
    setAutoSaveStatus('unsaved');
  };

  const removeCue = (index: number) => {
    setNote(prev => ({
      ...prev,
      cue_column: prev.cue_column.filter((_, i) => i !== index),
    }));
    setAutoSaveStatus('unsaved');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with subject/topic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            🧠 Cornell Notes — Learn it. Question it. Summarize it.
          </CardTitle>
          <CardDescription>
            Take notes the smart way: cues on the left, main notes on the right, summary at the bottom
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="e.g., Math, Science, History"
                value={note.subject}
                onChange={(e) => {
                  setNote(prev => ({ ...prev, subject: e.target.value }));
                  setAutoSaveStatus('unsaved');
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Topic</label>
              <Input
                placeholder="e.g., Quadratic Equations, Photosynthesis"
                value={note.topic}
                onChange={(e) => {
                  setNote(prev => ({ ...prev, topic: e.target.value }));
                  setAutoSaveStatus('unsaved');
                }}
              />
            </div>
          </div>

          {/* Auto-save indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {autoSaveStatus === 'saving' && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Auto-saved
                </>
              )}
              {autoSaveStatus === 'unsaved' && (
                <>
                  <div className="h-2 w-2 rounded-full bg-gray-400" />
                  Unsaved changes
                </>
              )}
            </div>
            <Button onClick={() => handleSave(false)} disabled={saving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cornell 3-column layout */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Cue Column (Left) */}
        <Card className="md:col-span-1 bg-slate-50 dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Cue Column
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSuggestCues}
                disabled={suggestingCues}
              >
                {suggestingCues ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
              </Button>
            </div>
            <CardDescription className="text-xs">
              Key questions & hints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {note.cue_column.map((cue, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Write key questions or hints here..."
                  value={cue}
                  onChange={(e) => updateCue(index, e.target.value)}
                  className="text-sm"
                />
                {note.cue_column.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCue(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCue} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Cue
            </Button>
          </CardContent>
        </Card>

        {/* Note-Taking Area (Right) */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notes
            </CardTitle>
            <CardDescription className="text-xs">
              Main notes, examples, diagrams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Take your main notes, examples, or diagrams..."
              value={note.note_body}
              onChange={(e) => {
                setNote(prev => ({ ...prev, note_body: e.target.value }));
                setAutoSaveStatus('unsaved');
              }}
              rows={15}
              className="resize-none font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Summary Section (Bottom) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🪞 Summary (Reflect)</CardTitle>
          <CardDescription className="text-xs">
            In a few sentences, describe what you learned today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            placeholder="What clicked for you? What do you still need to work on?"
            value={note.summary}
            onChange={(e) => {
              setNote(prev => ({ ...prev, summary: e.target.value }));
              setAutoSaveStatus('unsaved');
            }}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground italic">
            💭 Reflection prompt: What's one thing you'd like to understand better next time?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

