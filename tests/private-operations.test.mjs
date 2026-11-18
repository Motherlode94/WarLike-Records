import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {verifyAccessJwt,assertConfigured} from '../functions/_lib/access.js';
import {calculateRoyalties} from '../functions/_lib/royalties.js';

const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const sign=async(privateKey,header,payload)=>{
 const message=encode(header)+'.'+encode(payload);
 const signature=await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5',privateKey,new TextEncoder().encode(message));
 return message+'.'+Buffer.from(signature).toString('base64url');
};
test('back-office remains disabled without all required bindings',()=>{
 assert.equal(assertConfigured({}),false);
 assert.equal(assertConfigured({ACCESS_AUD:'abc',ACCESS_TEAM_DOMAIN:'https://team.cloudflareaccess.com'}),false);
 assert.equal(assertConfigured({ACCESS_AUD:'abc',ACCESS_TEAM_DOMAIN:'https://team.cloudflareaccess.com',RECORDS_DB:{}}),true);
});
test('Cloudflare Access requires an authentic signed JWT with correct audience',async()=>{
 const keyPair=await webcrypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
 const jwk=await webcrypto.subtle.exportKey('jwk',keyPair.publicKey);
 const env={ACCESS_TEAM_DOMAIN:'https://team.cloudflareaccess.com',ACCESS_AUD:'records-private'};
 const valid={iss:env.ACCESS_TEAM_DOMAIN,aud:env.ACCESS_AUD,sub:'test-user',email:'Director@Example.com',exp:Math.floor(Date.now()/1000)+600};
 const fetcher=async()=>({ok:true,json:async()=>({keys:[{...jwk,alg:'RS256',kid:'test-key'}]})});
 const request=token=>({headers:new Headers({'Cf-Access-Jwt-Assertion':token})});
 const token=await sign(keyPair.privateKey,{alg:'RS256',kid:'test-key'},valid);
 assert.deepEqual(await verifyAccessJwt(request(token),env,fetcher),{email:'director@example.com',subject:'test-user'});
 await assert.rejects(()=>verifyAccessJwt(request(token),{...env,ACCESS_AUD:'other-app'},fetcher));
 const tampered=token.slice(0,-4)+'ABCD';
 await assert.rejects(()=>verifyAccessJwt(request(tampered),env,fetcher));
 await assert.rejects(()=>verifyAccessJwt(request('bogus'),env,fetcher));
 const expired=await sign(keyPair.privateKey,{alg:'RS256',kid:'test-key'},{...valid,exp:Math.floor(Date.now()/1000)-1});
 await assert.rejects(()=>verifyAccessJwt(request(expired),env,fetcher));
});
test('royalty calculation uses integer cents, contractual deductions and basis points',()=>{
 assert.equal(calculateRoyalties(100000,20000,2500),20000);
 assert.equal(calculateRoyalties(10000,0,5000),5000);
 assert.equal(calculateRoyalties(10000,10000,5000),0);
 assert.equal(calculateRoyalties(3,0,5000),2);
 assert.throws(()=>calculateRoyalties(100,101,5000),RangeError);
 assert.throws(()=>calculateRoyalties(100,0,12000),RangeError);
 assert.throws(()=>calculateRoyalties(100.5,0,5000),RangeError);
});
