'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Library, PlusCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useScoreStore } from '@/store/score-store';

const navItems = [
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/create', icon: PlusCircle, label: 'Create' },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const initialize = useScoreStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-50">
      <header className="sticky top-0 z-20 border-b border-brand-100 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold text-brand-500 sm:text-xl">
            ScoreSwipe
          </Link>
          <div className="hidden items-center gap-2 md:flex">
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
      <main className="flex flex-1 flex-col pb-20 md:pb-0">
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-100 bg-white/90 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-around px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                  active ? 'text-brand-500' : 'text-brand-300 hover:text-brand-400'
                }`}
                aria-label={item.label}
              >
                <item.icon className={`h-5 w-5 ${active ? 'text-brand-400' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
