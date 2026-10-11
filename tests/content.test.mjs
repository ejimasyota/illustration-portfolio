import {test} from 'node:test';
import assert from 'node:assert/strict';
import {workSchema,selectWorks,artistsSchema,settingsSchema} from '../scripts/model.mjs';
const sample={slug:'sample',title:'作品',date:'2026-01-01',images:[{src:'/media/a.png',alt:'説明'}]};
test('未指定の作品は公開しない',()=>assert.equal(workSchema.parse(sample).published,false));
test('掲載除外と優先順を守る',()=>{
 const make=(slug,props)=>workSchema.parse({...sample,slug,published:true,...props});
 assert.deepEqual(selectWorks([make('hidden',{published:false}),make('normal',{order:0}),make('featured',{featured:true,order:99})]).map(w=>w.slug),['featured','normal']);
});
test('複数ページの説明と順番を保持する',()=>{
 const work=workSchema.parse({...sample,images:[{src:'/media/1.png',alt:'1',caption:'一枚目'},{src:'/media/2.png',alt:'2',caption:'二枚目'}]});
 assert.deepEqual(work.images.map(i=>i.caption),['一枚目','二枚目']);
});
test('壊れた日付・URL重複・外部画像を拒否する',()=>{
 assert.throws(()=>workSchema.parse({...sample,date:'2026-02-31'}));
 assert.throws(()=>selectWorks([workSchema.parse(sample),workSchema.parse(sample)]));
 assert.throws(()=>workSchema.parse({...sample,images:[{src:'https://example.com/a.png',alt:'x'}]}));
});
test('X以外のリンクやjavascript URLを拒否する',()=>{
 assert.throws(()=>artistsSchema.parse({artists:[{name:'x',url:'javascript:alert(1)'}]}));
 assert.throws(()=>artistsSchema.parse({artists:[{name:'x',url:'https://x.com.evil.example/user'}]}));
 assert.equal(artistsSchema.parse({artists:[{name:'x',url:'https://x.com/example'}]}).artists.length,1);
});

test('任意のプロフィール欄を空欄にできる',()=>{
 const value=settingsSchema.parse({title:'サイト',name:'作者',tagline:'見出し',description:'説明',copyright:'作者',socialUrl:'',email:null,bio:null,tools:null});
 assert.equal(value.socialUrl,'');assert.equal(value.email,'');assert.equal(value.bio,'');
});
