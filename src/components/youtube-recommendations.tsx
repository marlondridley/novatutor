/**
 * 📺 YouTube Educational Video Recommendations
 * 
 * Shows helpful educational videos for each learning topic
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration?: string;
}

interface YouTubeRecommendationsProps {
  topic: string;
  subject?: string;
  maxResults?: number;
}

export function YouTubeRecommendations({ 
  topic, 
  subject = '', 
  maxResults = 3 
}: YouTubeRecommendationsProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [topic, subject]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVideos = async () => {
    if (!topic) return;
    
    setLoading(true);
    setError(null);

    try {
      // Build search query
      const searchQuery = `${subject} ${topic} educational tutorial for kids`.trim();
      
      // Call YouTube API via our backend endpoint (with subject for better filtering)
      const response = await fetch(
        `/api/youtube-search?q=${encodeURIComponent(topic)}&subject=${encodeURIComponent(subject)}&maxResults=${maxResults}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err: any) {
      console.error('YouTube search error:', err);
      setError('Could not load video recommendations');
      
      // Fallback: Generate YouTube search URLs manually
      const fallbackVideos: YouTubeVideo[] = [
        {
          id: `search-${Date.now()}-1`,
          title: `Learn ${topic}`,
          thumbnail: '/placeholder-video.png',
          channelTitle: 'Search on YouTube',
          duration: '---'
        }
      ];
      setVideos(fallbackVideos);
    } finally {
      setLoading(false);
    }
  };

  const openVideo = (videoId: string) => {
    if (videoId.startsWith('search-')) {
      // Fallback: Open YouTube search
      const searchQuery = `${subject} ${topic} educational tutorial for kids`.trim();
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, '_blank');
    } else {
      // Open specific video
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-red-500" />
            📺 Helpful Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!videos.length && !error) return null;

  return (
    <Card className="border-2 border-red-200 bg-red-50/30 dark:bg-red-950/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <Play className="h-5 w-5" />
          📺 Helpful Videos
        </CardTitle>
        <CardDescription>
          Watch these to learn more about {topic}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="text-sm text-muted-foreground p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            {error} - Click below to search on YouTube
          </div>
        )}
        
        <div className="grid gap-3 md:grid-cols-3">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => openVideo(video.id)}
              className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-red-400 transition-all hover:shadow-lg bg-white dark:bg-gray-900"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                {video.thumbnail !== '/placeholder-video.png' ? (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-red-500" />
                  </div>
                )}
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>

                {/* Duration badge */}
                {video.duration && video.duration !== '---' && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Video info */}
              <div className="p-2 text-left">
                <h4 className="text-xs font-semibold line-clamp-2 mb-1 group-hover:text-red-600 dark:group-hover:text-red-400">
                  {video.title}
                </h4>
                <p className="text-[10px] text-muted-foreground truncate">
                  {video.channelTitle}
                </p>
              </div>

              {/* External link icon */}
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const searchQuery = `${subject} ${topic} educational tutorial for kids`.trim();
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, '_blank');
          }}
          className="w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Search More on YouTube
        </Button>
      </CardContent>
    </Card>
  );
}

