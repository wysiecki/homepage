import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 -mt-20">
      <p className="font-mono text-sm tracking-widest text-primary mb-6">// 404</p>
      <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
        {t('title')}
      </h1>
      <p className="text-on-surface/50 text-lg mb-10 text-center max-w-md">
        {t('description')}
      </p>
      <Link href="/" className="btn-primary">
        {t('back')}
      </Link>
    </main>
  );
}
