import { useTranslations } from 'next-intl';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';
import { ContactForm } from '@/components/contact/ContactForm';

export function ContactSection() {
  const t = useTranslations('Contact');

  return (
    <section id="contact" className="section bg-surface-low">
      <div className="max-w-2xl mx-auto px-6 lg:px-8">
        <RevealOnScroll className="text-center mb-12">
          <p className="section-label">{t('label')}</p>
          <h2 className="section-heading">
            {t('heading1')} <span className="text-primary">{t('heading2')}</span>
          </h2>
          <p className="text-on-surface/50 mt-4 max-w-md mx-auto">{t('subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm">
            <a href="mailto:info@wysiecki.de" className="text-primary hover:text-primary/80 transition-colors">
              info@wysiecki.de
            </a>
            <span className="text-on-surface/30">+49 621 43 71 26 61</span>
            <span className="text-on-surface/30">{t('location')}</span>
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <ContactForm />
        </RevealOnScroll>
      </div>
    </section>
  );
}
