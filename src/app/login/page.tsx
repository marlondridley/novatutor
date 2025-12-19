'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, AlertCircle, Mail, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase-client';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');

  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupAge, setSignupAge] = useState('');
  const [signupGrade, setSignupGrade] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    console.log('Redirect check - user:', !!user, 'authLoading:', authLoading);
    if (user && !authLoading) {
      const profile = user as any;
      console.log('User subscription status:', profile.subscription_status);
      // Give subscription hook time to load before redirecting
      setTimeout(() => {
        if (profile.subscription_status === 'active' || profile.subscription_status === 'trialing') {
          console.log('✅ Redirecting to dashboard...');
          window.location.replace('/dashboard');
        } else {
          console.log('⚠️ Redirecting to pricing...');
          window.location.replace('/pricing');
        }
      }, 500);
    }
  }, [user, authLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 Login form submitted');
    setLoginError('');
    setLoginLoading(true);

    try {
      console.log('🔵 Calling signIn with:', loginEmail);
      const { error } = await signIn(loginEmail, loginPassword, rememberMe);
      console.log('🔵 SignIn returned, error:', error);

      if (error) {
        console.error('❌ Login error:', error);
        setLoginError(error.message || 'Login failed. Please check your credentials.');
        setLoginLoading(false);
      } else {
        // Successfully logged in
        console.log('✅ Login successful, redirecting...');
        // Wait a moment for subscription hook to initialize, then redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (err: any) {
      console.error('❌ Unexpected login error:', err);
      setLoginError('An unexpected error occurred. Please try again.');
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupLoading(true);

    const age = parseInt(signupAge);
    if (isNaN(age) || age < 1) {
      setSignupError('Please enter a valid age');
      setSignupLoading(false);
      return;
    }

    const { error } = await signUp(signupEmail, signupPassword, {
      name: signupName,
      age,
      grade: signupGrade,
      role: 'student',
    });

    if (error) {
      setSignupError(error.message || 'Signup failed');
      setSignupLoading(false);
    } else {
      setSignupSuccess(true);
      setSignupLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordError('');
    setResetPasswordSuccess(false);
    setResetPasswordLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetPasswordSuccess(true);
      setResetPasswordEmail('');
    } catch (error: any) {
      setResetPasswordError(error.message || 'Failed to send reset email');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // Show loading only while auth is initializing (not when user exists - let the useEffect handle redirect)
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-lg border-2 mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Welcome to BestTutorEver!</CardTitle>
          <CardDescription>
            Your personal AI study companion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold text-base transition-all"
              >
                🔐 Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold text-base transition-all"
              >
                ✨ Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* New User Notice */}
                <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong>New users:</strong> Please check your email to confirm your account before logging in.
                  </AlertDescription>
                </Alert>

                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="student@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={loginLoading}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={loginLoading}
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-me" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    disabled={loginLoading}
                  />
                  <Label 
                    htmlFor="remember-me" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me for 7 days
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Forgot Password Link - OUTSIDE the form */}
              <div className="text-center mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="link" 
                      className="text-sm text-muted-foreground hover:text-primary"
                      type="button"
                    >
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {resetPasswordSuccess ? (
                      <Alert className="bg-green-50 border-green-200">
                        <Mail className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-900">
                          Password reset email sent! Check your inbox and follow the link to reset your password.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        {resetPasswordError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{resetPasswordError}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            name="reset-email"
                            type="email"
                            placeholder="your@email.com"
                            value={resetPasswordEmail}
                            onChange={(e) => setResetPasswordEmail(e.target.value)}
                            required
                            disabled={resetPasswordLoading}
                            autoComplete="email"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={resetPasswordLoading}
                        >
                          {resetPasswordLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Reset Link'
                          )}
                        </Button>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              {signupSuccess ? (
                <div className="space-y-3">
                  <Alert className="bg-green-50 border-green-200">
                    <Mail className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong className="block mb-2">🎉 Account created successfully!</strong>
                      <p className="text-sm">Please check your email to verify your account, then you can sign in.</p>
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={() => setSignupSuccess(false)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Email Confirmation Banner */}
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Mail className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-900 text-sm">
                      <strong>Important:</strong> After creating your account, you'll receive a confirmation email. Please verify your email to access the app.
                    </AlertDescription>
                  </Alert>

                  {signupError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{signupError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Jane Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      disabled={signupLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-age">Age</Label>
                      <Input
                        id="signup-age"
                        type="number"
                        placeholder="14"
                        value={signupAge}
                        onChange={(e) => setSignupAge(e.target.value)}
                        required
                        disabled={signupLoading}
                        min="1"
                        max="120"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-grade">Grade</Label>
                      <Input
                        id="signup-grade"
                        type="text"
                        placeholder="9th"
                        value={signupGrade}
                        onChange={(e) => setSignupGrade(e.target.value)}
                        required
                        disabled={signupLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="student@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      disabled={signupLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      disabled={signupLoading}
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={signupLoading}>
                    {signupLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
