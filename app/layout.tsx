import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import SubNavbar from '../components/SubNavbar';
import { AuthProvider } from '../components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'NEXORA — Guided Technology Innovation Platform',
  description: 'A guided technology innovation platform.',
  openGraph: {
    title: 'NEXORA — Guided Technology Innovation Platform',
    description: 'A guided technology innovation platform.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXORA — Guided Technology Innovation Platform',
    description: 'A guided technology innovation platform.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className="bg-neutral-950 text-neutral-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200 min-h-screen"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <SubNavbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
