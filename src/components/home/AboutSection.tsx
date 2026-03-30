import { useTranslations } from 'next-intl';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

export function AboutSection() {
  const t = useTranslations('About');

  return (
    <section id="about" className="section">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Content */}
          <RevealOnScroll>
            <p className="section-label">{t('label')}</p>
            <h2 className="section-heading mb-8">
              {t('heading1')}
              <br />
              <span className="text-primary">{t('heading2')}</span>
            </h2>
            <div className="space-y-5 text-on-surface/50 leading-relaxed">
              <p>{t('bio1')}</p>
              <p>{t('bio2')}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div>
                <div className="stat-number">30+</div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-on-surface/40 mt-2">
                  {t('statYears')}
                </p>
              </div>
              <div>
                <div className="stat-number">50+</div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-on-surface/40 mt-2">
                  {t('statProjects')}
                </p>
              </div>
              <div>
                <div className="stat-number">100%</div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-on-surface/40 mt-2">
                  {t('statSatisfaction')}
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Right: Decorative tech visualization */}
          <RevealOnScroll>
            <div className="glass p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-container/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary-container/15 to-transparent rounded-full blur-2xl" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-3 font-mono text-xs text-on-surface/30">{t('terminalTitle')}</span>
                </div>
                <pre className="font-mono text-xs leading-relaxed">
                  <code className="text-on-surface/60">
                    <span className="text-primary">const</span> martin = {'{'}
                    {'\n'}  <span className="text-secondary">role</span>: <span className="text-tertiary">&apos;{t('terminalRole')}&apos;</span>,
                    {'\n'}  <span className="text-secondary">frontend</span>: [<span className="text-tertiary">&apos;React&apos;</span>, <span className="text-tertiary">&apos;JS&apos;</span>, <span className="text-tertiary">&apos;TS&apos;</span>, <span className="text-tertiary">&apos;CSS3&apos;</span>],
                    {'\n'}  <span className="text-secondary">backend</span>:  [<span className="text-tertiary">&apos;Node.js&apos;</span>, <span className="text-tertiary">&apos;Python&apos;</span>,
                    {'\n'}             <span className="text-tertiary">&apos;PHP&apos;</span>, <span className="text-tertiary">&apos;API Design&apos;</span>],
                    {'\n'}  <span className="text-secondary">mobile</span>:   [<span className="text-tertiary">&apos;Swift&apos;</span>, <span className="text-tertiary">&apos;iOS&apos;</span>],
                    {'\n'}  <span className="text-secondary">database</span>: [<span className="text-tertiary">&apos;MySQL&apos;</span>, <span className="text-tertiary">&apos;MariaDB&apos;</span>],
                    {'\n'}  <span className="text-secondary">location</span>: <span className="text-tertiary">&apos;{t('terminalLocation')}&apos;</span>
                    {'\n'}{'};'}
                  </code>
                </pre>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
