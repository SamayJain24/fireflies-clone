'use client';

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
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: BookOpen, label: 'Notebook', href: '/notebook' },
  { icon: Upload, label: 'Uploads', href: '/uploads' },
  { icon: Tag, label: 'Topic Tracker', href: '/topics' },
  { icon: BarChart2, label: 'Analytics', href: '/analytics' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col items-center border-r border-slate-800 bg-[#0A0C14] py-4">
      {/* Logo */}
      <Link href="/" className="mb-6 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow">
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

      {/* Bottom: Upgrade hint */}
      <div className="flex flex-col items-center gap-2">
        <button
          title="AI Extensions"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-amber-400 hover:bg-amber-400/10 transition-colors"
        >
          <Zap className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
          SJ
        </div>
      </div>
    </aside>
  );
}
