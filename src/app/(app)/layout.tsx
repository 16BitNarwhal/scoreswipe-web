'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Library, PlusCircle, Settings, Tv } from 'lucide-react';
import { useEffect } from 'react';
import { useScoreStore } from '@/store/score-store';

const navItems = [
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/create', icon: PlusCircle, label: 'Create' },
  { href: '/viewer', icon: Tv, label: 'Viewer' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const initialize = useScoreStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-50">
      <header className="border-b border-brand-100 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-semibold text-brand-500">
            ScoreSwipe
          </Link>
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-400 text-white shadow-md'
                      : 'text-brand-400 hover:bg-brand-100'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
