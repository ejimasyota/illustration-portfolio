import { z } from 'zod';
export const imageSchema = z.object({
  src: z.string().regex(/^\/media\/[^?#]+$/),
  alt: z.string().min(1),
  caption: z.string().nullish().transform(v => v || ''),
});
export const workSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  description: z.string().nullish().transform(v => v || ''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, '実在する日付を指定してください'),
  tags: z.array(z.string().min(1)).nullish().transform(v => [...new Set(v || [])]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  order: z.number().finite().nullish().transform(v => v ?? 100),
  cover: z.string().nullish().transform(v => v || ''),
  images: z.array(imageSchema).min(1),
});
export const httpsUrl = z.string().url().refine(v => URL.canParse(v) && new URL(v).protocol === 'https:', 'https URLを入力してください');
const optionalUrl = z.union([httpsUrl, z.literal('')]).nullish().transform(v => v || '');
export const settingsSchema = z.object({
  title: z.string().min(1), name: z.string().min(1), tagline: z.string().min(1),
  description: z.string().min(1), bio: z.string().nullish().transform(v=>v||''), tools: z.string().nullish().transform(v=>v||''),
  email: z.union([z.string().email(),z.literal('')]).nullish().transform(v=>v||''),
  socialUrl: optionalUrl, copyright: z.string().min(1),
});
export const artistsSchema = z.object({artists:z.array(z.object({
  name:z.string().min(1),url:httpsUrl.refine(v => URL.canParse(v) && ['x.com','www.x.com','twitter.com','www.twitter.com'].includes(new URL(v).hostname), 'XのURLを入力してください'),
  description:z.string().nullish().transform(v=>v||''),tags:z.array(z.string()).nullish().transform(v=>v||[]),
})).nullish().transform(v=>v||[])});
export function selectWorks(works) {
  const ids = new Set();
  for (const work of works) {
    if (ids.has(work.slug)) throw new Error('作品URLが重複しています: '+work.slug);
    ids.add(work.slug);
  }
  return works.filter(w=>w.published).sort((a,b)=>Number(b.featured)-Number(a.featured) || a.order-b.order || b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
