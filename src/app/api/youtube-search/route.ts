/**
 * YouTube Search API Endpoint
 * 
 * Searches for educational videos using youtube-search-api
 * Filters to ONLY safe educational channels for kids
 */

import { NextRequest, NextResponse } from 'next/server';
import youtubesearchapi from 'youtube-search-api';
import { buildSafeChannelQuery, filterSafeVideos } from '@/lib/safe-youtube-channels';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const subject = searchParams.get('subject');
    const maxResults = parseInt(searchParams.get('maxResults') || '3');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      );
    }

    // Build safe channel query
    const safeQuery = buildSafeChannelQuery(query, subject || undefined);
    
    console.log('🔍 Searching YouTube (safe channels only):', safeQuery);

    // Search YouTube using youtube-search-api
    // Request more results to account for filtering
    const result = await youtubesearchapi.GetListByKeyword(
      safeQuery,
      false, // Don't include playlists
      maxResults * 3, // Get more results to filter
      [{ type: 'video' }] // Only return videos
    );

    // Transform and filter results
    let videos = result.items
      ?.filter((item: any) => item.type === 'video' && !item.isLive) // Filter out live videos
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail?.thumbnails?.[0]?.url || '',
        channelTitle: item.channelTitle || 'Educational Video',
        duration: formatDuration(item.length?.simpleText),
      })) || [];

    // Filter to only safe educational channels
    videos = filterSafeVideos(videos);
    
    // Limit to requested amount
    videos = videos.slice(0, maxResults);

    console.log(`✅ Found ${videos.length} safe educational videos`);

    return NextResponse.json({ videos });

  } catch (error: any) {
    console.error('YouTube search error:', error);
    
    // Return fallback on error
    return NextResponse.json({
      videos: [
        {
          id: `error-${Date.now()}`,
          title: 'Search on YouTube',
          thumbnail: '',
          channelTitle: 'Click to search',
          duration: '---'
        }
      ]
    });
  }
}

/**
 * Format duration from YouTube format (e.g., "12:34" or "1:23:45")
 */
function formatDuration(duration?: string): string {
  if (!duration) return '---';
  return duration;
}

