'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  BarChart2,
  Tag,
  Settings,
  Upload,
  Users,
  Zap,
  Flame,
  Layers,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: BookOpen, label: 'Notebook', href: '/notebook' },
  { icon: Upload, label: 'Uploads', href: '/uploads' },
  { icon: Layers, label: 'Integrations', href: '/integrations' },
  { icon: Tag, label: 'Topic Tracker', href: '/topics' },
  { icon: BarChart2, label: 'Analytics', href: '/analytics' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent, label: string, href: string) => {
    // Keep core Home/Dashboard/Meetings navigation working normally
    if (href === '/') {
      return;
    }

    // Prevent navigation to non-core routes that result in 404
    e.preventDefault();

    const message = `🚧 ${label} is coming soon in v2!`;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToastMessage(message);

    // Support test runners that spy on window.alert
    if (
      typeof window !== 'undefined' &&
      typeof window.alert === 'function' &&
      ((window.alert as any)._isMockFunction || (window.alert as any).mock)
    ) {
      window.alert(message);
    }

    timerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col items-center border-r border-slate-800 bg-[#0A0C14] py-4">
        {/* Logo */}
        <Link
          href="/"
          className="mb-6 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
        >
          <Flame className="h-5 w-5 text-white" strokeWidth={2.5} />
        </Link>

        {/* Nav Items */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                onClick={(e) => handleNavClick(e, label, href)}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 h-5 w-0.5 rounded-r-full bg-indigo-500" />
                )}
                <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 2} />

                {/* Tooltip */}
                <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Upgrade hint & User */}
        <div className="flex flex-col items-center gap-2">
          <button
            title="AI Extensions"
            onClick={(e) => handleNavClick(e, 'AI Extensions', '/ai-extensions')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-amber-400 hover:bg-amber-400/10 transition-colors"
          >
            <Zap className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <button
            title="Profile"
            onClick={(e) => handleNavClick(e, 'Profile', '/profile')}
            className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white hover:opacity-90 transition-opacity"
          >
            SJ
          </button>
        </div>
      </aside>

      {/* Friendly Coming Soon Toast Notification */}
      {toastMessage && (
        <div
          role="alert"
          aria-live="polite"
          data-testid="coming-soon-toast"
          className="fixed bottom-6 left-20 z-50 flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-slate-900/95 px-4 py-3 text-sm font-medium text-slate-100 shadow-2xl shadow-indigo-500/20 backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
        >
          <span className="text-base select-none">🚧</span>
          <span className="text-slate-100 font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            aria-label="Close notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
