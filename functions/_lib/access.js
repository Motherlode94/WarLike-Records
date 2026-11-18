// Verifies Cloudflare Access JWT signatures and claims, never trusts identity headers alone.
// The API is intentionally unavailable until Access AUD, team domain and D1 are configured.
const bad=()=>new Error('Accès non autorisé');
const decode=value=>{
 if(typeof value!=='string'||value.length>16000||!/^[A-Za-z0-9_-]+$/.test(value))throw bad();
 const normalized=value.replace(/-/g,'+').replace(/_/g,'/');
 const bytes=atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,'='));
 return Uint8Array.from(bytes,c=>c.charCodeAt(0));
};
const parse=value=>JSON.parse(new TextDecoder().decode(decode(value)));
export async function verifyAccessJwt(request,env,fetcher=fetch){
 const team=env.ACCESS_TEAM_DOMAIN,aud=env.ACCESS_AUD;
 if(typeof team!=='string'||!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(team)||!aud)throw bad();
 const token=request.headers.get('Cf-Access-Jwt-Assertion');
 if(typeof token!=='string'||token.length>16000)throw bad();
 const segments=token.split('.');if(segments.length!==3)throw bad();
 let header,claims;try{header=parse(segments[0]);claims=parse(segments[1])}catch{throw bad()}
 if(header.alg!=='RS256'||typeof header.kid!=='string'||header.kid.length>128)throw bad();
 const now=Math.floor(Date.now()/1000);
 if(claims.iss!==team||!(Array.isArray(claims.aud)?claims.aud.includes(aud):claims.aud===aud)||!Number.isFinite(claims.exp)||claims.exp<=now||claims.exp>now+86400||claims.nbf>now+60||typeof claims.email!=='string'||!claims.email.includes('@'))throw bad();
 const response=await fetcher(team+'/cdn-cgi/access/certs',{redirect:'error'});
 if(!response.ok)throw bad();const jwks=await response.json();const key=jwks.keys?.find(k=>k.kid===header.kid&&k.kty==='RSA'&&(k.alg===undefined||k.alg==='RS256'));
 if(!key)throw bad();
 const imported=await crypto.subtle.importKey('jwk',key,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 const verified=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',imported,decode(segments[2]),new TextEncoder().encode(segments[0]+'.'+segments[1]));
 if(!verified)throw bad();
 return {email:claims.email.toLowerCase().trim(),subject:String(claims.sub||'')};
}
export const hasRole=(role,allowed)=>allowed.includes(role);
export const assertConfigured=env=>!!(env?.RECORDS_DB&&env?.ACCESS_TEAM_DOMAIN&&env?.ACCESS_AUD);
