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

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupAge, setSignupAge] = useState('');
  const [signupGrade, setSignupGrade] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Redirect if already logged in (moved to useEffect to avoid setState during render)
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      setLoginError(error.message || 'Login failed');
      setLoginLoading(false);
    } else {
      router.push('/dashboard');
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

  // Show loading while auth is initializing or user is logged in
  if (authLoading || user) {
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
          <CardTitle className="text-2xl">Welcome to SuperTutor!</CardTitle>
          <CardDescription>
            Sign in or create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
                    type="email"
                    placeholder="student@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={loginLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={loginLoading}
                  />
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
