import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Fireflies Clone – AI Meeting Intelligence',
  description: 'Transcribe, summarize and search your meetings. A Fireflies.ai full-stack clone.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0F1117] text-slate-100">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="ml-14 flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
