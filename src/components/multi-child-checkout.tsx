'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  subscription_status: string;
}

export function MultiChildCheckout() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchManagedProfiles();
  }, []);

  async function fetchManagedProfiles() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // ✅ SECURITY: Only fetch children where parent_id = current user
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, name, subscription_status')
        .eq('parent_id', user.id) // Only children managed by this parent
        .order('name');

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProfiles(data || []);
        // Auto-select profiles without active subscriptions
        const freeProfiles = (data || [])
          .filter(p => p.subscription_status === 'free' || !p.subscription_status)
          .map(p => p.id);
        setSelectedProfiles(new Set(freeProfiles));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleProfile(profileId: string) {
    const newSelection = new Set(selectedProfiles);
    if (newSelection.has(profileId)) {
      newSelection.delete(profileId);
    } else {
      newSelection.add(profileId);
    }
    setSelectedProfiles(newSelection);
  }

  function selectAll() {
    setSelectedProfiles(new Set(profiles.map(p => p.id)));
  }

  function selectNone() {
    setSelectedProfiles(new Set());
  }

  function selectFreeOnly() {
    const freeProfiles = profiles
      .filter(p => p.subscription_status === 'free' || !p.subscription_status)
      .map(p => p.id);
    setSelectedProfiles(new Set(freeProfiles));
  }

  async function handleCheckout() {
    if (selectedProfiles.size === 0) {
      setError('Please select at least one profile');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/create-multi-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileIds: Array.from(selectedProfiles),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout. Please try again.');
      setProcessing(false);
    }
  }

  const pricePerChild = 19.99;
  const totalPrice = selectedProfiles.size * pricePerChild;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading profiles...</p>
        </CardContent>
      </Card>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Profiles Found</CardTitle>
          <CardDescription>
            You don't have any profiles to manage. Create child accounts first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscribe for Multiple Accounts</CardTitle>
        <CardDescription>
          Select the accounts you want to subscribe and pay for them all at once.
          ${pricePerChild}/month per account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Selection Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={selectFreeOnly}>
            Select Free Only
          </Button>
          <Button variant="outline" size="sm" onClick={selectNone}>
            Clear Selection
          </Button>
        </div>

        {/* Profile List */}
        <div className="space-y-2">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer"
              onClick={() => toggleProfile(profile.id)}
            >
              <Checkbox
                checked={selectedProfiles.has(profile.id)}
                onCheckedChange={() => toggleProfile(profile.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {profile.name || profile.email}
                  </p>
                  <Badge
                    variant={
                      profile.subscription_status === 'active' ? 'default' :
                      profile.subscription_status === 'trialing' ? 'default' :
                      profile.subscription_status === 'past_due' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {profile.subscription_status || 'free'}
                  </Badge>
                </div>
                {profile.name && (
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${pricePerChild}/mo</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-4">
        {/* Total Summary */}
        <div className="w-full flex justify-between items-center p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">
              {selectedProfiles.size} account{selectedProfiles.size !== 1 ? 's' : ''} selected
            </p>
            <p className="text-2xl font-bold">
              ${totalPrice.toFixed(2)}/month
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleCheckout}
            disabled={processing || selectedProfiles.size === 0}
          >
            {processing ? 'Processing...' : `Subscribe ${selectedProfiles.size} Account${selectedProfiles.size !== 1 ? 's' : ''}`}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          You'll be charged ${totalPrice.toFixed(2)} per month. Cancel anytime.
        </p>
      </CardFooter>
    </Card>
  );
}

