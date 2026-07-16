import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { getBlogPosts } from '../src/content/blogPosts.ts';

const SITE_URL = 'https://egptenderhub.com';
const distDir = path.resolve(process.cwd(), 'dist');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPage({ lang, title, description, canonicalPath, bodyHtml }) {
  const backLabel = lang === 'bn' ? 'ফিরে যান eGPTenderHub-এ' : 'Back to eGPTenderHub';
  const ctaLabel = lang === 'bn' ? 'এখনই আপনার Eligibility যাচাই করুন' : 'Check Your Eligibility Now';

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)} | eGPTenderHub</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${SITE_URL}${canonicalPath}" />
<meta name="theme-color" content="#2563eb" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${SITE_URL}${canonicalPath}" />
</head>
<body style="font-family: sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.7;">
  <header style="display:flex; justify-content:space-between; align-items:center; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; margin-bottom: 24px;">
    <a href="/" style="font-weight: 800; text-decoration: none; color: #2563eb;">eGPTenderHub</a>
    <a href="/" style="font-size: 14px; text-decoration: none; color: #475569;">&larr; ${backLabel}</a>
  </header>
  <main>
    <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 1rem;">${escapeHtml(title)}</h1>
    <article>${bodyHtml}</article>
  </main>
  <footer style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
    <a href="/" style="display:inline-block; background:#2563eb; color:#fff; padding: 12px 24px; border-radius: 8px; text-decoration:none; font-weight:700;">${ctaLabel}</a>
  </footer>
</body>
</html>`;
}

function writePage(filePath, html) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html);
}

function toIsoDate(dateStr) {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
}

function buildSitemap(urlEntries) {
  const urlXml = urlEntries
    .map(
      ({ loc, lastmod }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlXml}
</urlset>
`;
}

function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function main() {
  const enPosts = getBlogPosts('en');
  const bnPosts = getBlogPosts('bn');
  let count = 0;
  const today = new Date().toISOString().slice(0, 10);
  const urlEntries = [{ loc: `${SITE_URL}/`, lastmod: today }];

  enPosts.forEach((enPost, idx) => {
    const bnPost = bnPosts[idx];
    const slug = enPost.slug;

    const enBodyHtml = renderToStaticMarkup(React.createElement(ReactMarkdown, {}, enPost.contentEn));
    writePage(
      path.join(distDir, 'blog', slug, 'index.html'),
      renderPage({
        lang: 'en',
        title: enPost.title,
        description: enPost.excerpt,
        canonicalPath: `/blog/${slug}`,
        bodyHtml: enBodyHtml,
      })
    );
    urlEntries.push({ loc: `${SITE_URL}/blog/${slug}`, lastmod: toIsoDate(enPost.date) });
    count++;

    const bnBodyHtml = renderToStaticMarkup(React.createElement(ReactMarkdown, {}, bnPost.contentBn));
    writePage(
      path.join(distDir, 'blog', 'bn', slug, 'index.html'),
      renderPage({
        lang: 'bn',
        title: bnPost.title,
        description: bnPost.excerpt,
        canonicalPath: `/blog/bn/${slug}`,
        bodyHtml: bnBodyHtml,
      })
    );
    urlEntries.push({ loc: `${SITE_URL}/blog/bn/${slug}`, lastmod: toIsoDate(bnPost.date) });
    count++;
  });

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemap(urlEntries));
  fs.writeFileSync(path.join(distDir, 'robots.txt'), buildRobotsTxt());

  console.log(`Generated ${count} static blog pages in dist/blog/`);
  console.log(`Generated dist/sitemap.xml with ${urlEntries.length} URLs`);
  console.log('Generated dist/robots.txt');
}

main();
