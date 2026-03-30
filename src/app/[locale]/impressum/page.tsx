import { getLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const descriptions: Record<string, string> = {
    en: 'Impressum and legal information by Martin von Wysiecki.',
    de: 'Impressum und rechtliche Informationen von Martin von Wysiecki.',
    pl: 'Impressum i informacje prawne Martina von Wysiecki.',
  };
  return {
    title: 'Impressum — Martin von Wysiecki',
    description: descriptions[locale] || descriptions.en,
  };
}

function ImpressumEN() {
  return (
    <div className="flex flex-col gap-12">
      <section>
        <h2 className="font-display text-xl font-semibold mb-4">
          Information pursuant to &sect; 5 TMG
        </h2>
        <div className="text-on-surface/50 leading-relaxed space-y-1">
          <p>Martin von Wysiecki</p>
          <p>Libellenweg 6c</p>
          <p>68259 Mannheim</p>
          <p>Germany</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Contact</h2>
        <div className="text-on-surface/50 leading-relaxed space-y-1">
          <p>Tel.: +49 621 &ndash; 43 71 26 61</p>
          <p>
            E-Mail:{' '}
            <a
              href="mailto:info@wysiecki.de"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              info@wysiecki.de
            </a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">VAT ID</h2>
        <div className="text-on-surface/50 leading-relaxed">
          <p>VAT identification number pursuant to &sect; 27a of the German VAT Act:</p>
          <p className="font-mono text-sm mt-2">DE 220591037</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">
          Responsible for content
        </h2>
        <div className="text-on-surface/50 leading-relaxed space-y-1">
          <p>Martin von Wysiecki</p>
          <p>Libellenweg 6c</p>
          <p>68259 Mannheim, Germany</p>
        </div>
      </section>
    </div>
  );
}

function ImpressumDE() {
  return (
    <div className="flex flex-col gap-12">
      <section>
        <h2 className="font-display text-xl font-semibold mb-4">
          Angaben gem&auml;&szlig; &sect; 5 TMG
        </h2>
        <div className="text-on-surface/50 leading-relaxed space-y-1">
          <p>Martin von Wysiecki</p>
          <p>Libellenweg 6c</p>
          <p>68259 Mannheim</p>
          <p>Deutschland</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Kontakt</h2>
        <div className="text-on-surface/50 leading-relaxed space-y-1">
          <p>Tel.: +49 621 &ndash; 43 71 26 61</p>
          <p>
            E-Mail:{' '}
            <a
              href="mailto:info@wysiecki.de"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              info@wysiecki.de
            </a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Umsatzsteuer-ID</h2>
        <div className="text-on-surface/50 leading-relaxed">
          <p>
            Umsatzsteuer-Identifikationsnummer gem&auml;&szlig; &sect; 27a
            Umsatzsteuergesetz:
          </p>
          <p className="font-mono text-sm mt-2">DE 220591037</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">
          Verantwortlich f&uuml;r den Inhalt
        </h2>
        <div className="text-on-surface/50 leading-relaxed space-y-1">
          <p>Martin von Wysiecki</p>
          <p>Libellenweg 6c</p>
          <p>68259 Mannheim, Deutschland</p>
        </div>
      </section>
    </div>
  );
}

function ImpressumPL() {
  return (
    <div className="flex flex-col gap-12">
      <section>
        <h2 className="font-display text-xl font-semibold mb-4">
          Dane zgodnie z &sect; 5 TMG
        </h2>
        <div className="text-on-surface/50 leading-relaxed space-y-1">
          <p>Martin von Wysiecki</p>
          <p>Libellenweg 6c</p>
          <p>68259 Mannheim</p>
          <p>Niemcy</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Kontakt</h2>
        <div className="text-on-surface/50 leading-relaxed space-y-1">
          <p>Tel.: +49 621 &ndash; 43 71 26 61</p>
          <p>
            E-mail:{' '}
            <a
              href="mailto:info@wysiecki.de"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              info@wysiecki.de
            </a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">
          Numer identyfikacji podatkowej
        </h2>
        <div className="text-on-surface/50 leading-relaxed">
          <p>
            Numer identyfikacji podatkowej zgodnie z &sect; 27a ustawy o podatku
            obrotowym:
          </p>
          <p className="font-mono text-sm mt-2">DE 220591037</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">
          Odpowiedzialny za tre&#347;&#263;
        </h2>
        <div className="text-on-surface/50 leading-relaxed space-y-1">
          <p>Martin von Wysiecki</p>
          <p>Libellenweg 6c</p>
          <p>68259 Mannheim, Niemcy</p>
        </div>
      </section>
    </div>
  );
}

const labels: Record<string, string> = {
  en: 'Legal',
  de: 'Rechtliches',
  pl: 'Informacje prawne',
};

export default async function ImpressumPage() {
  const locale = await getLocale();

  return (
    <main className="pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-6 lg:px-8">
        <p className="section-label">{labels[locale] || labels.en}</p>
        <h1 className="section-heading mb-16">Impressum</h1>

        {locale === 'de' && <ImpressumDE />}
        {locale === 'pl' && <ImpressumPL />}
        {locale !== 'de' && locale !== 'pl' && <ImpressumEN />}
      </div>
    </main>
  );
}
