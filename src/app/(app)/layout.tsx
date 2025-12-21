

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useContext } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  MessageSquare,
  GitBranch,
  BookOpen,
  FileQuestion,
  Loader2,
  LogOut,
  Sparkles,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { AppStateProvider, AppStateContext } from "@/context/app-state-context";
import { useAuth } from "@/context/auth-context";
import { useSubscription } from "@/hooks/use-subscription";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Today's Progress" },
  { href: "/tutor", icon: MessageSquare, label: "My Coach" },
  { href: "/progress", icon: TrendingUp, label: "My Progress" },
  { href: "/learning-path", icon: GitBranch, label: "My Learning Journey" },
  { href: "/summarizer", icon: Sparkles, label: "Smart Tools" },
  { href: "/test-generator", icon: FileQuestion, label: "Test Generator" },
  { href: "/parent-dashboard", icon: LayoutDashboard, label: "Parent View" },
  { href: "/parent-settings", icon: Shield, label: "Parent Settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AppStateProvider>
  );
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { hasPremiumAccess, loading: subscriptionLoading, refreshSubscription } = useSubscription();

  // Auto-refresh subscription status every 30 seconds when on protected pages
  useEffect(() => {
    if (!user || subscriptionLoading) return;
    
    const interval = setInterval(() => {
      // Only refresh if user doesn't have premium access but might have just paid
      if (!hasPremiumAccess() && (pathname === '/dashboard' || pathname === '/pricing')) {
        refreshSubscription();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, subscriptionLoading, hasPremiumAccess, pathname, refreshSubscription]);

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('🔐 Auth check - loading:', loading, 'user:', !!user);
    if (!loading && !user) {
      console.log('❌ No user, redirecting to login');
      router.push('/login');
    } else if (!loading && user) {
      console.log('✅ User authenticated:', user.name);
    }
  }, [user, loading, router]);

  // Redirect to pricing if not subscribed (unless already on pricing page)
  useEffect(() => {
    // IMPORTANT: Only check after BOTH auth and subscription are loaded
    if (!loading && !subscriptionLoading && user) {
      const isOnPricingPage = pathname === '/pricing';
      const isOnAccountPage = pathname === '/account';
      
      const premiumAccess = hasPremiumAccess();
      console.log('🔐 Access check - Premium:', premiumAccess, 'Path:', pathname);
      
      // Allow access to pricing and account pages without subscription
      if (!isOnPricingPage && !isOnAccountPage && !premiumAccess) {
        console.log('⚠️ No premium access, redirecting to pricing');
        router.push('/pricing');
      }
    }
  }, [user, loading, subscriptionLoading, hasPremiumAccess, pathname, router]);

  // UI is always kid-friendly! No toggle needed.

  if (loading) {
    console.log('⏳ App layout loading...');
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-muted/40">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user in app layout, returning null');
    return null;
  }

  console.log('✅ Rendering app layout for user:', user.name);
  
  // Dashboard = Full-Screen Controller Mode (no sidebar!)
  const isControllerMode = pathname === '/dashboard';
  
  if (isControllerMode) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }
  
  return (
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      tooltip={{ children: item.label }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-20">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold md:text-2xl">
                {navItems.find((item) => pathname.startsWith(item.href))?.label || "Pricing"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
            {/* Mic-first CTA */}
            <Link href="/tutor" className="hidden md:flex">
              <Button size="sm" variant="default" className="gap-2">
                🎤 Talk to Tutor
              </Button>
            </Link>

              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
                className="hidden sm:flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <UserNav />
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
  );
}
