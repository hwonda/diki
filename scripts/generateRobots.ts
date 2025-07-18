import { promises as fs } from 'fs';
import { dikiMetadata } from '../src/constants';

(() => {
  const createRobotsTxt = () => {
    const siteUrl = dikiMetadata.url;

    const text = 'User-agent: *\n'
                 + 'Allow: /\n'
                 + 'Disallow: /create/\n'
                 + 'Disallow: /login/\n'
                 + 'Disallow: /signup/\n'
                 + 'Disallow: /good-bye/\n'
                 + 'Disallow: /thank-you/\n'
                 + 'Disallow: /profiles/\n'
                 + 'Disallow: /api/*\n'
                 + `Sitemap: ${ siteUrl }/sitemap.xml\n`;

    return text;
  };

  // fs.writeFile('out/robots.txt', createRobotsTxt(), 'utf-8');
  fs.writeFile('public/robots.txt', createRobotsTxt(), 'utf-8');
  console.log('robots.txt generated');
})();