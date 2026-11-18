import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publishedArtists,publishedReleases,publishedNews,httpsUrl,shortDate} from '../assets/records-data.js';

test('unapproved and malformed artist profiles stay hidden',()=>{
 const artists=publishedArtists([{slug:'artist-one',name:'Artiste',published:true},{slug:'artist-two',name:'Second',published:false},{slug:'../private',name:'Unsafe',published:true}]);
 assert.deepEqual(artists.map(a=>a.slug),['artist-one']);
});
test('only released public music appears in catalog',()=>{
 const releases=publishedReleases([{title:'Single',artistSlug:'artist-one',type:'single',published:true},{title:'Unreleased',artistSlug:'artist-one',type:'album',published:false},{title:'Bad type',artistSlug:'artist-one',type:'unknown',published:true}]);
 assert.deepEqual(releases.map(x=>x.title),['Single']);
});
test('news publication is opt in',()=>assert.deepEqual(publishedNews([{title:'Public',published:true},{title:'Internal',published:false}]).map(x=>x.title),['Public']));
test('external links require HTTPS',()=>{
 assert.equal(httpsUrl('javascript:alert(1)'),null);
 assert.equal(httpsUrl('http://example.com'),null);
 assert.equal(httpsUrl('/relative'),null);
 assert.equal(httpsUrl('https://artist.example/'),'https://artist.example/');
});
test('date formatting never exposes arbitrary markup',()=>{assert.equal(shortDate('invalid'),'');assert.match(shortDate('2026-11-18'),/2026/)});
test('public catalogs start empty and pages are connected',()=>{
 for(const name of ['artists','releases','news'])assert.deepEqual(JSON.parse(readFileSync(new URL('../'+name+'.json',import.meta.url),'utf8')),[]);
 const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const profile=readFileSync(new URL('../artist.html',import.meta.url),'utf8');
 assert.match(home,/catalog\('artists'\)/);
 assert.match(home,/catalog\('releases'\)/);
 assert.match(home,/catalog\('news'\)/);
 assert.match(home,/releases=publishedReleases\(releasesData\)\.filter/);
 assert.match(profile,/publishedArtists\(artists\)\.find/);
});
