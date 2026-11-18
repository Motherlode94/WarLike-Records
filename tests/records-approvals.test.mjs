import test from 'node:test';
import assert from 'node:assert/strict';
import {canApproveRoyalty,canCreateRoyalty} from '../functions/_lib/approvals.js';
import {onRequest as protectAdmin} from '../functions/admin.html.js';

test('royalty approval requires director and two distinct people',()=>{
 assert.equal(canApproveRoyalty({role:'director',actor:'boss@example.com',creator:'finance@example.com',status:'draft'}),true);
 assert.equal(canApproveRoyalty({role:'director',actor:'boss@example.com',creator:'BOSS@example.com',status:'draft'}),false);
 assert.equal(canApproveRoyalty({role:'finance',actor:'finance@example.com',creator:'boss@example.com',status:'draft'}),false);
 assert.equal(canApproveRoyalty({role:'director',actor:'boss@example.com',creator:'finance@example.com',status:'approved'}),false);
 assert.equal(canCreateRoyalty('finance'),true);
 assert.equal(canCreateRoyalty('artist'),false);
});
test('admin page refuses access when identity and D1 are not configured',async()=>{
 let forwarded=false;
 const response=await protectAdmin({request:new Request('https://records.example/admin.html'),env:{},next:()=>{forwarded=true;return new Response('<html/>')}});
 assert.equal(response.status,503);assert.equal(forwarded,false);
 assert.equal(response.headers.get('cache-control'),'private, no-store');
});
test('admin page denies anonymous users even with configured bindings',async()=>{
 let forwarded=false;
 const response=await protectAdmin({
  request:new Request('https://records.example/admin.html'),
  env:{ACCESS_TEAM_DOMAIN:'https://team.cloudflareaccess.com',ACCESS_AUD:'test',RECORDS_DB:{}},
  next:()=>{forwarded=true;return new Response('<html/>')}
 });
 assert.equal(response.status,401);assert.equal(forwarded,false);
});
