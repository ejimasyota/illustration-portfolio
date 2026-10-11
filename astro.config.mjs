import { defineConfig } from 'astro/config';
const origin = process.env.SITE_URL || 'https://example.github.io';
const base = process.env.BASE_PATH || '/';
export default defineConfig({ site: origin, base, output: 'static', trailingSlash: 'always' });
