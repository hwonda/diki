import { writeFileSync } from 'fs';
import { getSitemapURLs, generateSitemapXML } from '../src/utils/sitemap';

(async () => {
  const urls = await getSitemapURLs();
  const sitemap = generateSitemapXML(urls);
  await Promise.all([
    writeFileSync('public/sitemap.xml', sitemap, 'utf-8'),
  ]);
  console.log('sitemap.xml generated in public/ and root directory');
})();
