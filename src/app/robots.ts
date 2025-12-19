import { MetadataRoute } from 'next';

/**
 * 🤖 Robots.txt Generator
 * 
 * Tells search engine crawlers which pages they can and cannot access.
 * This helps manage crawler traffic and protect sensitive routes.
 * 
 * Learn more: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/landing',
          '/features',
          '/pricing',
          '/about',
          '/faq',
          '/blog',
          '/help-center',
          '/support',
          '/safety',
          '/terms',
          '/privacy',
        ],
        disallow: [
          '/api/',           // Block API routes
          '/dashboard',      // Block authenticated pages
          '/tutor',
          '/learning-path',
          '/summarizer',
          '/journal',
          '/test-generator',
          '/parent-dashboard',
          '/parent-settings',
          '/account',
          '/login',
          '/signup',
          '/admin/',         // Block admin routes
          '/*?returnUrl=*',  // Block return URLs with query params
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],     // Block OpenAI's web crawler
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],     // Block ChatGPT browsing
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],     // Block Common Crawl
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],     // Block Anthropic's crawler
      },
      {
        userAgent: 'Claude-Web',
        disallow: ['/'],     // Block Claude browsing
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

