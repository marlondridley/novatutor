
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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
  Zap,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { AppStateProvider } from "@/context/app-state-context";
import { useAuth } from "@/context/auth-context";
import { useSubscription } from "@/hooks/use-subscription";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tutor", icon: MessageSquare, label: "Educational Assistant" },
  { href: "/learning-path", icon: GitBranch, label: "Learning Path" },
  { href: "/focus", icon: Zap, label: "Focus Help" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
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
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Redirect to pricing if not subscribed (unless already on pricing page)
  useEffect(() => {
    if (!loading && !subscriptionLoading && user) {
      const isOnPricingPage = pathname === '/pricing';
      const isOnAccountPage = pathname === '/account';
      const isOnFamilyPricingPage = pathname === '/family-pricing';
      
      // Allow access to pricing and account pages without subscription
      if (!isOnPricingPage && !isOnAccountPage && !isOnFamilyPricingPage && !hasPremiumAccess()) {
        console.log('⚠️ No premium access, redirecting to pricing');
        router.push('/pricing');
      }
    }
  }, [user, loading, subscriptionLoading, hasPremiumAccess, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-muted/40">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  return (
    <AppStateProvider>
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
            <UserNav />
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AppStateProvider>
  );
}
