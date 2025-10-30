'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChildProfile {
  id: string;
  email: string;
  name: string | null;
  subscription_status: string;
  subscription_id: string | null;
}

export function ManageChildSubscriptions() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [childToRemove, setChildToRemove] = useState<ChildProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  async function fetchChildren() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // ✅ SECURITY: Only fetch children where parent_id = current user
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, name, subscription_status, subscription_id')
        .eq('parent_id', user.id)
        .order('name');

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setChildren(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveChild(child: ChildProfile) {
    if (!child.subscription_id) {
      setError('Child has no active subscription');
      return;
    }

    setRemoving(child.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/remove-child-from-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: child.subscription_id,
          profileId: child.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove child');
      }

      if (data.canceled) {
        setSuccess(`Subscription canceled - ${child.name || child.email} was the last child`);
      } else {
        setSuccess(`${child.name || child.email} removed from subscription. ${data.remainingCount} child${data.remainingCount !== 1 ? 'ren' : ''} remaining.`);
      }

      // Refresh the list
      await fetchChildren();
      setChildToRemove(null);
    } catch (err: any) {
      console.error('Remove child error:', err);
      setError(err.message || 'Failed to remove child. Please try again.');
    } finally {
      setRemoving(null);
    }
  }

  const activeChildren = children.filter(c => c.subscription_status === 'active' || c.subscription_status === 'trialing');
  const inactiveChildren = children.filter(c => c.subscription_status !== 'active' && c.subscription_status !== 'trialing');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (children.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Children Found</CardTitle>
          <CardDescription>
            You don't have any child accounts set up yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Child Subscriptions</CardTitle>
        <CardDescription>
          View and manage subscriptions for your children's accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success/Error Messages */}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Active Subscriptions */}
        {activeChildren.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Active Subscriptions ({activeChildren.length})</h3>
            {activeChildren.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {child.name || child.email}
                    </p>
                    <Badge variant="default">
                      {child.subscription_status}
                    </Badge>
                  </div>
                  {child.name && (
                    <p className="text-sm text-muted-foreground">{child.email}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChildToRemove(child)}
                  disabled={removing === child.id}
                >
                  {removing === child.id ? 'Removing...' : 'Remove'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Inactive Accounts */}
        {inactiveChildren.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Inactive Accounts ({inactiveChildren.length})</h3>
            {inactiveChildren.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between rounded-lg border p-4 opacity-60"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {child.name || child.email}
                    </p>
                    <Badge variant="secondary">
                      {child.subscription_status || 'free'}
                    </Badge>
                  </div>
                  {child.name && (
                    <p className="text-sm text-muted-foreground">{child.email}</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">No active subscription</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!childToRemove} onOpenChange={(open) => !open && setChildToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Child from Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{childToRemove?.name || childToRemove?.email}</strong> from the subscription?
              <br /><br />
              • Their account will lose access to premium features immediately
              <br />
              • Your billing will be adjusted to reflect the remaining children
              <br />
              • You can re-subscribe them anytime
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => childToRemove && handleRemoveChild(childToRemove)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove Child
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

