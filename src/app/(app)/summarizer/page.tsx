"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LocalSummarizer } from '@/components/local-summarizer';
import { FocusHelp } from '@/components/focus-help';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Star, Lock, Zap, BookOpen, Plus, Search, Calendar, Tag, Trash2, Eye, Focus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CornellNote {
  id: string;
  subject: string;
  topic: string;
  cue_column: string[];
  note_body: string;
  summary: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function SmartToolsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [notes, setNotes] = useState<CornellNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [selectedSubject]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      let url = '/api/notes';
      const params = new URLSearchParams();
      
      if (selectedSubject) {
        params.append('subject', selectedSubject);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchNotes();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== id));
        toast({
          title: "Note Deleted",
          description: "Your note has been removed",
        });
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete note",
      });
    }
  };

  const subjects = Array.from(new Set(notes.map(note => note.subject)));

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          Smart Tools
        </h1>
        <p className="text-muted-foreground">
          Summarize notes, manage your learning journal, and turn information into action.
        </p>
      </div>

      {/* Use Cases - Always Visible */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ Ways to Use This
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 md:grid-cols-2">
            <li className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <strong>Summarize Cornell Notes</strong>
                <p className="text-sm text-muted-foreground">
                  Condense your notes area into the summary section
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <strong>Condense Textbooks</strong>
                <p className="text-sm text-muted-foreground">
                  Turn long chapters into quick review summaries
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong>Turn Instructions into Action</strong>
                <p className="text-sm text-muted-foreground">
                  Extract action items from homework instructions
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <strong>Extract Key Points</strong>
                <p className="text-sm text-muted-foreground">
                  Pull main ideas from articles and research
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <strong>Create Study Guides</strong>
                <p className="text-sm text-muted-foreground">
                  Build quick review materials from your journal
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="summarizer" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summarizer" className="gap-2">
            <Zap className="h-4 w-4" />
            Smart Summarizer
          </TabsTrigger>
          <TabsTrigger value="journal" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Learning Journal
          </TabsTrigger>
          <TabsTrigger value="focus" className="gap-2">
            <Focus className="h-4 w-4" />
            Stay on Track
          </TabsTrigger>
        </TabsList>

        {/* SMART SUMMARIZER TAB */}
        <TabsContent value="summarizer" className="space-y-6 mt-6">
          {/* Feature Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <Lock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">100% Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your text never leaves your device. Everything runs locally in your browser.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Summaries in seconds after the AI model loads once (then it's cached).
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <GraduationCap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Uses advanced machine learning to extract key ideas and create concise summaries.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Summarizer Component */}
          <LocalSummarizer />
        </TabsContent>

        {/* LEARNING JOURNAL TAB */}
        <TabsContent value="journal" className="space-y-6 mt-6">
          {/* Search and Filter Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Search notes by topic, content, or summary..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={() => router.push('/journal/new')} className="md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
              </div>

              {/* Subject Filter */}
              {subjects.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  <Button
                    variant={selectedSubject === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSubject(null)}
                  >
                    All Subjects
                  </Button>
                  {subjects.map(subject => (
                    <Button
                      key={subject}
                      variant={selectedSubject === subject ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSubject(subject)}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Grid */}
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading your notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Notes Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your learning journey by creating your first Cornell Note
                </p>
                <Button onClick={() => router.push('/journal/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Note
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.map(note => (
                <Card key={note.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="secondary" className="mb-2">
                          {note.subject}
                        </Badge>
                        <CardTitle className="text-base">{note.topic}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(note.updated_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {note.summary || note.note_body.substring(0, 150) + "..."}
                    </div>

                    {/* Cue Count */}
                    {note.cue_column.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        {note.cue_column.filter(c => c).length} cue questions
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/journal/${note.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View & Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{note.topic}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(note.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* STAY ON TRACK TAB */}
        <TabsContent value="focus" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Focus className="h-6 w-6 text-primary" />
                Stay on Track
              </CardTitle>
              <CardDescription>
                Feeling distracted? Try one of these quick activities to regain your focus and get back to learning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FocusHelp />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
