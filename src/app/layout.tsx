import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import 'katex/dist/katex.min.css';
import { AuthProvider } from '@/context/auth-context';
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';
// import { initSentry } from '@/lib/sentry';

// Initialize Sentry if configured (server-side)
// NOTE: Sentry is optional. To enable, install @sentry/nextjs and uncomment below
// initSentry();

export const metadata: Metadata = {
  title: {
    default: 'BestTutorEver - AI Learning Coach for Kids | Homework Help & Study Buddy',
    template: '%s | BestTutorEver',
  },
  description: 'The best AI tutor for kids! Get personalized homework help, study plans, and test prep with our fun game controller interface. Safe, educational, and COPPA compliant.',
  keywords: [
    'AI tutor',
    'homework help',
    'study buddy',
    'kids learning app',
    'educational games',
    'test prep',
    'COPPA compliant',
    'safe learning',
    'personalized learning',
    'Nintendo-style learning',
  ],
  authors: [{ name: 'BestTutorEver Team' }],
  creator: 'BestTutorEver',
  publisher: 'BestTutorEver',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'),
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'BestTutorEver',
    title: 'BestTutorEver - AI Learning Coach for Kids',
    description: 'The best AI tutor for kids! Get personalized homework help, study plans, and test prep with our fun game controller interface.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BestTutorEver - AI Learning Coach',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'BestTutorEver - AI Learning Coach for Kids',
    description: 'The best AI tutor for kids! Personalized homework help with a fun game controller interface.',
    images: ['/og-image.png'],
    creator: '@besttutorever',
  },
  
  // Verification
  verification: {
    google: 'your-google-site-verification-code', // Add your actual code
    // yandex: 'your-yandex-verification-code',
    // other: {
    //   me: ['your-email@domain.com'],
    // },
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // App-specific
  applicationName: 'BestTutorEver',
  category: 'Education',
  classification: 'Educational Technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch & Preconnect for faster external resource loading */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preconnect to Supabase for faster API calls */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} crossOrigin="anonymous" />
        
        {/* Font loading with display=swap for instant text rendering */}
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BestTutorEver" />
      </head>
      <body className="font-body antialiased">
        <ServiceWorkerRegistration />
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
