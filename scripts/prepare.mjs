import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {workSchema,settingsSchema,artistsSchema,selectWorks} from './model.mjs';
const root = process.cwd();
const read = async file => JSON.parse(await fs.readFile(path.join(root,file),'utf8'));
const settings = settingsSchema.parse(await read('content/settings.json'));
const artists = artistsSchema.parse(await read('content/artists.json'));
const names = (await fs.readdir('content/works')).filter(n=>n.endsWith('.json'));
const all = await Promise.all(names.map(async name=>{
  try { return workSchema.parse(await read('content/works/'+name)); }
  catch(error) { throw new Error(name+': '+error.message); }
}));
const works = selectWorks(all);
const output = path.resolve(root,'public/media');
// Delete only this project's generated image directory; original uploads are in content/media.
if (output !== path.join(root,'public','media')) throw new Error('Unexpected output directory');
await fs.rm(output,{recursive:true,force:true});
await fs.mkdir(output,{recursive:true});
const mediaRoot = await fs.realpath(path.resolve('content/media'));
const cache = new Map();
async function image(source) {
  if(cache.has(source)) return cache.get(source);
  if(!source.startsWith('/media/')) throw new Error('画像はメディア欄から選択してください: '+source);
  const input = path.resolve(mediaRoot, source.slice(7));
  if(!input.startsWith(mediaRoot+path.sep)) throw new Error('Invalid media path: '+source);
  const real = await fs.realpath(input);
  if(!real.startsWith(mediaRoot+path.sep)) throw new Error('Invalid media target');
  const buffer = await fs.readFile(real);
  const key = crypto.createHash('sha256').update(buffer).digest('hex').slice(0,20);
  const full = await sharp(buffer,{limitInputPixels:80_000_000}).rotate().resize({width:1920,withoutEnlargement:true}).webp({quality:88}).toFile(output+'/'+key+'.webp');
  await sharp(buffer,{limitInputPixels:80_000_000}).rotate().resize({width:720,withoutEnlargement:true}).webp({quality:82}).toFile(output+'/'+key+'-thumb.webp');
  const value = {src:'/media/'+key+'.webp',thumb:'/media/'+key+'-thumb.webp',width:full.width,height:full.height};
  cache.set(source,value);
  return value;
}
const prepared = [];
for(const work of works) {
  const images = [];
  for(const item of work.images) images.push({...item,...await image(item.src)});
  const cover = await image(work.cover || work.images[0].src);
  prepared.push({...work,images,cover});
}
await fs.mkdir('src/generated',{recursive:true});
await fs.writeFile('src/generated/catalog.json',JSON.stringify({settings,artists:artists.artists,works:prepared},null,2));
console.log('Prepared '+prepared.length+' published works / '+cache.size+' images.');
