
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { AppStateProvider } from "@/context/app-state-context";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tutor", icon: MessageSquare, label: "Educational Assistant" },
  { href: "/learning-path", icon: GitBranch, label: "Learning Path" },
  { href: "/focus", icon: Zap, label: "Focus Help" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
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
