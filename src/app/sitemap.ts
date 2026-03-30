import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wysiecki.de';
  const locales = ['en', 'de', 'pl'] as const;
  const pages = ['/', '/tools', '/ai', '/blog', '/quiz', '/impressum', '/datenschutz'];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      const path = locale === 'en' ? page : `/${locale}${page}`;

      entries.push({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: page === '/' ? 'weekly' : 'monthly',
        priority: page === '/' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [
              l,
              `${baseUrl}${l === 'en' ? page : `/${l}${page}`}`,
            ]),
          ),
        },
      });
    }
  }

  return entries;
}
