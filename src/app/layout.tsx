import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  icons: { icon: '/assets/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
