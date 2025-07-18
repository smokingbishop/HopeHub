
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Users,
  Settings,
  Bell,
  MessageSquare,
  MoreVertical,
  Megaphone,
} from 'lucide-react';
import { HopeHubLogo } from './icons';
import { UserNav } from './user-nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/members', label: 'Members', icon: Users },
  ];
  
  const settingsNavItem = { href: '/settings', label: 'Settings', icon: Settings };


  const pageTitle = [...navItems, settingsNavItem].find((item) => item.href === pathname)?.label;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2 md:hidden">
          <HopeHubLogo className="h-10 w-10 text-primary" />
          <span className="font-bold">{pageTitle}</span>
        </div>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden ml-auto">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <HopeHubLogo className="h-6 w-6 transition-all group-hover:scale-110" />
                <span className="sr-only">Hope Hub</span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                    pathname === item.href && 'text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
               <Link
                  key={settingsNavItem.href}
                  href={settingsNavItem.href}
                  className={cn(
                    'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                    pathname === settingsNavItem.href && 'text-foreground'
                  )}
                >
                  <settingsNavItem.icon className="h-5 w-5" />
                  {settingsNavItem.label}
                </Link>
            </nav>
          </SheetContent>
        </Sheet>
        
        {/* Desktop Nav */}
        <div className="hidden w-full items-center md:flex">
          <TooltipProvider>
            <nav className="hidden md:flex md:flex-row md:items-center md:gap-5 lg:gap-6 text-sm font-medium">
              <Link href="/" className="flex items-center gap-2 font-semibold text-foreground mr-4">
                  <HopeHubLogo className="h-10 w-10 text-primary" />
                  <span>Hope Hub</span>
              </Link>
              {navItems.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className={cn('h-9 w-9', 
                        pathname === item.href ? 'text-foreground bg-accent' : 'text-muted-foreground'
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span className="sr-only">{item.label}</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>
          </TooltipProvider>

          <div className="ml-auto flex items-center gap-4">
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button asChild variant="ghost" size="icon" className={cn('h-9 w-9', pathname === settingsNavItem.href ? 'text-foreground bg-accent' : 'text-muted-foreground')}>
                            <Link href={settingsNavItem.href}>
                                <Settings className="h-5 w-5" />
                                <span className="sr-only">{settingsNavItem.label}</span>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{settingsNavItem.label}</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>

             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Toggle notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>No new notifications</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
