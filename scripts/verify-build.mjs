import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import YAML from 'yaml';
const root=process.cwd();
const base=(process.env.BASE_PATH||'/').replace(/\/$/,'');
const files=await fs.readdir('dist',{recursive:true});
const pages=files.filter(file=>file.endsWith('.html'));
assert.ok(pages.length>=5);
let links=0;
for(const file of pages){
 const html=await fs.readFile(path.join('dist',file),'utf8');
 assert.match(html,/<html lang="ja"/);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const target=match[1];
  if(!target.startsWith('/')||target.startsWith('//'))continue;
  assert.ok(target.startsWith(base+'/'),'Missing base path in '+file+': '+target);
  let local=decodeURIComponent(target.slice(base.length).split(/[?#]/)[0]);
  if(local.endsWith('/'))local+='index.html';
  await fs.access(path.join(root,'dist',local));
  links++;
 }
}
const config=YAML.parse(await fs.readFile('.pages.yml','utf8'));
assert.equal(config.media.input,'content/media');
assert.equal(config.content.find(item=>item.name==='works').format,'json');
const workflows=YAML.parse(await fs.readFile('.github/workflows/deploy.yml','utf8'));
assert.equal(workflows.jobs.deploy.needs,'build');
const data=JSON.parse(await fs.readFile('src/generated/catalog.json','utf8'));
for(const work of data.works){
 assert.equal(work.published,true);
 const html=await fs.readFile(path.join('dist','works',work.slug,'index.html'),'utf8');
 let last=-1;
 for(const picture of work.images){
  const position=html.indexOf(picture.src,last+1);
  assert.ok(position>last,'Image page order changed');
  last=position;
 }
}
const outputFiles=files.filter(file=>file.startsWith('media'+path.sep));
assert.ok(outputFiles.every(file=>file.endsWith('.webp')),'Only processed images should be published');
console.log('Verified '+pages.length+' HTML pages, '+links+' local URLs, CMS/workflow YAML and ordered image references (base '+(base||'/')+').');
