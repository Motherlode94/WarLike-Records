import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestGet as getDocument,onRequestPost as postDocument} from '../functions/api/admin/document.js';
test('private documents deny anonymous access and never expose files without bindings',async()=>{
 const request=new Request('https://records.example/api/admin/document?id=bad');
 const context={request,env:{}};
 const res=await getDocument(context);
 assert.equal(res.status,503);
 assert.equal(res.headers.get('cache-control'),'private, no-store');
 const upload=await postDocument({request:new Request('https://records.example/api/admin/document',{method:'POST',body:'%PDF-...'}),env:{}});
 assert.equal(upload.status,503);
});
test('admin document endpoint never contains a public R2 URL',async()=>{
 const source=(await import('node:fs')).readFileSync(new URL('../functions/api/admin/document.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/r2\.dev\/|\.r2\.cloudflarestorage\.com/);
 assert.match(source,/application\/octet-stream/);
 assert.match(source,/SHA-256/);
 assert.match(source,/MAX_BYTES=8\*1024\*1024/);
});
