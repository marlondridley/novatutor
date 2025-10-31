'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { type User } from '@supabase/supabase-js';
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
import { Loader2, AlertCircle, CheckCircle, Crown, Calendar, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import AvatarUpload from '@/components/avatar-upload';
import { useSubscriptionStatus } from '@/hooks/use-subscription-status';
import { useSubscription } from '@/hooks/use-subscription';
import { ManageChildSubscriptions } from '@/components/manage-child-subscriptions';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountForm({ user }: { user: User | null }) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  // Profile fields
  const [fullName, setFullName] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Subscription status
  const { subscriptionStatus, isLoading: subscriptionLoading } = useSubscriptionStatus();
  const { refreshSubscription } = useSubscription();

  // Handle payment success redirect
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      // Refresh subscription status after successful payment
      setTimeout(() => {
        refreshSubscription();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
        // Remove query parameter from URL
        router.replace('/account');
      }, 1000);
    }
  }, [searchParams, router, refreshSubscription]);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      // Guard against undefined user
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data, error, status } = await supabase
        .from('profiles')
        .select('name, age, grade, avatar_url')
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        console.error('Error loading profile:', error);
        throw error;
      }

      if (data) {
        setFullName(data.name);
        setAge(data.age);
        setGrade(data.grade);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  async function updateProfile({
    fullName,
    age,
    grade,
    avatarUrl,
  }: {
    fullName: string | null;
    age: number | null;
    grade: string | null;
    avatarUrl: string | null;
  }) {
    try {
      setUpdating(true);
      setError('');
      setSuccess(false);

      if (!user?.id) {
        throw new Error('No user ID found');
      }

      if (!fullName || !age || !grade) {
        throw new Error('Please fill in all required fields');
      }

      if (age < 1 || age > 120) {
        throw new Error('Please enter a valid age');
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: fullName,
        age,
        grade,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Error updating profile');
    } finally {
      setUpdating(false);
    }
  }

  const handleAvatarUpload = async (filePath: string) => {
    try {
      if (!user?.id) return;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: filePath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(filePath);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Avatar update error:', error);
      setError(error.message || 'Failed to update avatar');
    }
  };
  
  const handleManageSubscription = async () => {
    try {
      setError('');
      // Create Stripe Customer Portal session
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to open customer portal');
      }
      
      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Portal session error:', error);
      setError(error.message || 'Failed to open subscription management');
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and account preferences
        </p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload a profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <AvatarUpload
            uid={user?.id || null}
            url={avatarUrl}
            size={150}
            onUpload={handleAvatarUpload}
          />
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your NovaHelper subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Current Plan</p>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(subscriptionStatus || 'free')}
                    {subscriptionStatus === 'active' && (
                      <span className="text-sm text-muted-foreground">Premium Access</span>
                    )}
                    {subscriptionStatus === 'trialing' && (
                      <span className="text-sm text-muted-foreground">Trial Active</span>
                    )}
                    {subscriptionStatus === 'free' && (
                      <span className="text-sm text-muted-foreground">Free Tier</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => refreshSubscription()}
                    variant="ghost"
                    size="sm"
                    disabled={subscriptionLoading}
                  >
                    {subscriptionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                  {subscriptionStatus && subscriptionStatus !== 'free' && subscriptionStatus !== 'canceled' ? (
                    <Button onClick={handleManageSubscription} variant="outline">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Billing
                    </Button>
                  ) : (
                    <Button asChild>
                      <a href="/pricing">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Premium
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              
              {subscriptionStatus === 'past_due' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your payment failed. Please update your payment method to continue using premium features.
                  </AlertDescription>
                </Alert>
              )}
              
              {subscriptionStatus === 'active' && (
                <div className="text-sm text-muted-foreground space-y-2">
                  <div>
                    <p>✅ Access to all premium features</p>
                    <p>✅ Unlimited AI tutoring sessions</p>
                    <p>✅ Priority support</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs">
                      Alternative: Access billing portal directly at{' '}
                      <a 
                        href="https://billing.stripe.com/p/login/fZu3cv0Gh4VHaUNblJ2VG00"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        billing.stripe.com
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Multi-Child Subscription Management */}
      <ManageChildSubscriptions />

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile({ fullName, age, grade, avatarUrl });
            }}
            className="space-y-4"
          >
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  Profile updated successfully!
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName || ''}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={updating}
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age || ''}
                  onChange={(e) => setAge(parseInt(e.target.value) || null)}
                  required
                  disabled={updating}
                  min="1"
                  max="120"
                  placeholder="14"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  type="text"
                  value={grade || ''}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                  disabled={updating}
                  placeholder="9th"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

