/**
 * 🔒 Safe Educational YouTube Channels
 * 
 * Whitelist of verified educational content creators
 * for kid-safe learning videos
 */

export const SAFE_EDUCATIONAL_CHANNELS = [
  // Major Educational Institutions
  'Khan Academy',
  'TED-Ed',
  'National Geographic',
  'Discovery',
  'History',
  'Smithsonian Channel',
  'PBS',
  'BBC',
  'Crash Course',
  'Kurzgesagt',
  
  // Science & Nature
  'SciShow',
  'Vsauce',
  'Veritasium',
  'MinutePhysics',
  'AsapSCIENCE',
  'SmarterEveryDay',
  'The Slow Mo Guys',
  'Mark Rober',
  
  // Math & Programming
  'Numberphile',
  '3Blue1Brown',
  'Math Antics',
  'PatrickJMT',
  'Professor Leonard',
  'The Organic Chemistry Tutor',
  'freeCodeCamp.org',
  
  // Kids Learning Channels
  'Peekaboo Kidz',
  'Free School',
  'Kids Learning Tube',
  'Homeschool Pop',
  'Happy Learning English',
  
  // Language Learning
  'Easy English',
  'Learn English with TV Series',
  'Rachel\'s English',
  
  // History & Social Studies
  'History Matters',
  'OverSimplified',
  'Extra Credits',
  'The Great War',
  
  // General Education
  'It\'s Okay To Be Smart',
  'CGP Grey',
  'Amoeba Sisters',
  'Bozeman Science',
  'Professor Dave Explains',
];

/**
 * Build channel filter query for YouTube search
 */
export function buildSafeChannelQuery(topic: string, subject?: string): string {
  const baseQuery = subject ? `${subject} ${topic}` : topic;
  
  // Add "educational" and "tutorial" to help filter
  const educationalTerms = 'educational tutorial explained lesson';
  
  // Build query with top safe channels
  const topChannels = [
    'Khan Academy',
    'TED-Ed',
    'National Geographic',
    'Crash Course',
    'SciShow'
  ].map(channel => `"${channel}"`).join(' OR ');
  
  return `${baseQuery} ${educationalTerms} (${topChannels})`;
}

/**
 * Check if a video is from a safe channel
 */
export function isSafeChannel(channelTitle: string): boolean {
  const normalizedChannel = channelTitle.toLowerCase().trim();
  
  return SAFE_EDUCATIONAL_CHANNELS.some(safeChannel => 
    normalizedChannel.includes(safeChannel.toLowerCase())
  );
}

/**
 * Filter YouTube results to only safe channels
 */
export function filterSafeVideos(videos: any[]): any[] {
  return videos.filter(video => 
    video.channelTitle && isSafeChannel(video.channelTitle)
  );
}

