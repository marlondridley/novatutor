
"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  import { Button } from "@/components/ui/button"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context";
import { useSubscription } from "@/hooks/use-subscription";
import { createCustomerPortalSession } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
  
  export function UserNav() {
    const { user, signOut } = useAuth();
    const { subscriptionStatus } = useSubscription();
    const { toast } = useToast();
    const [loadingPortal, setLoadingPortal] = useState(false);

    if (!user) {
      return null;
    }

    // Get user initials for avatar
    const initials = user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const handleManageSubscription = async () => {
        if (!user) return;
        setLoadingPortal(true);
        try {
            const portalUrl = await createCustomerPortalSession(user.id);
            if (portalUrl) {
                window.location.href = portalUrl;
            } else {
                throw new Error("Could not create customer portal session.");
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Could not open subscription management.",
                variant: "destructive"
            });
            setLoadingPortal(false);
        }
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                Grade {user.grade} • Age {user.age}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
             {subscriptionStatus && (
              <DropdownMenuItem onClick={handleManageSubscription} disabled={loadingPortal}>
                {loadingPortal ? 'Loading...' : 'Manage Subscription'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
