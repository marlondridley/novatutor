'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

export default function ClearSessionPage() {
  const [status, setStatus] = useState<'idle' | 'clearing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleClearSession = async () => {
    setStatus('clearing');
    setMessage('Clearing session...');

    try {
      // 1. Sign out from Supabase
      await supabase.auth.signOut();
      
      // 2. Clear localStorage
      localStorage.clear();
      
      // 3. Clear sessionStorage
      sessionStorage.clear();
      
      // 4. Clear cookies (best effort)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      setStatus('success');
      setMessage('✅ Session cleared! Redirecting to login...');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Clear Session & Reset Auth
          </CardTitle>
          <CardDescription>
            Having trouble logging in? This will clear all auth data and let you start fresh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'idle' && (
            <>
              <p className="text-sm text-muted-foreground">
                This will:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Sign you out from Supabase</li>
                <li>Clear browser localStorage</li>
                <li>Clear session storage</li>
                <li>Remove auth cookies</li>
              </ul>
              <Button onClick={handleClearSession} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Session & Restart
              </Button>
            </>
          )}

          {status === 'clearing' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-center text-sm font-medium">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-center text-sm font-medium">{message}</p>
              <Button onClick={() => setStatus('idle')} variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

