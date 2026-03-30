import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnalyticsTracker } from '@/components/ui/AnalyticsTracker';

export async function generateMetadata() {
  // Will be overridden by page-level metadata
  return {};
}

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth dark">
      <body className="grain bg-surface-base text-on-surface antialiased">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          {children}
          <Footer />
          <AnalyticsTracker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
