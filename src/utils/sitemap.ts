import { dikiMetadata } from '@/constants';
import { fetchTermsData } from '@/utils/fetchData';

interface SitemapURL {
  loc: string;
  lastmod: string;
}

const generateSitemapURL = ({ loc, lastmod }: SitemapURL): string => {
  return `
    <url>
      <loc>${ loc }</loc>
      <lastmod>${ lastmod }</lastmod>
    </url>
  `;
};

const generateSitemapXML = (urls: SitemapURL[]): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
      ${ urls.map(generateSitemapURL).join('') }
    </urlset>`;
};

export const getSitemapURLs = async (): Promise<SitemapURL[]> => {
  const baseUrl = dikiMetadata.url;
  const postLists = await fetchTermsData();

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0] + 'T00:00:00+00:00';
  };

  const urls: SitemapURL[] = [
    {
      loc: baseUrl,
      lastmod: formatDate(new Date()),
    },
    {
      loc: `${ baseUrl }/posts`,
      lastmod: formatDate(new Date()),
    },
    ...postLists.map(({ url, metadata }) => {
      const date = metadata?.updated_at || metadata?.created_at;
      const lastmod = date ? new Date(date) : new Date();

      return {
        loc: `${ baseUrl }${ url }`,
        lastmod: formatDate(lastmod),
      };
    }),
  ];

  return urls;
};

export { generateSitemapXML };