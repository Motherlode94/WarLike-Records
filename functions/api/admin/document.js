import {verifyAccessJwt,assertConfigured} from '../../_lib/access.js';
const MAX_BYTES=8*1024*1024;
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
async function authorized({request,env}){
 if(!assertConfigured(env)||!env.RECORDS_DOCS) return {error:json({error:'Stockage privé non configuré'},503)};
 let user;try{user=await verifyAccessJwt(request,env)}catch{return {error:json({error:'Authentification requise'},401)}}
 let member;try{member=await env.RECORDS_DB.prepare('SELECT role FROM records_roles WHERE email=? AND enabled=1').bind(user.email).first()}catch{return {error:json({error:'Base indisponible'},503)}}
 if(!member||!['director','production'].includes(member.role))return {error:json({error:'Accès refusé'},403)};
 return {db:env.RECORDS_DB,bucket:env.RECORDS_DOCS,user};
}
const isPdf=bytes=>{
 if(bytes.length<12||bytes[0]!==37||bytes[1]!==80||bytes[2]!==68||bytes[3]!==70||bytes[4]!==45)return false;
 const tail=new TextDecoder('latin1').decode(bytes.slice(Math.max(0,bytes.length-2048)));
 return tail.includes('%%EOF');
};
export async function onRequestPost(context){
 const {request}=context,auth=await authorized(context);if(auth.error)return auth.error;
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Origine non autorisée'},403);
 const url=new URL(request.url),agreementId=url.searchParams.get('agreementId');
 if(!agreementId||!/^[a-f0-9-]{36}$/i.test(agreementId))return json({error:'Identifiant de contrat invalide'},400);
 if((request.headers.get('Content-Type')||'').split(';')[0].toLowerCase()!=='application/pdf')return json({error:'Format PDF requis'},415);
 const contentLength=Number(request.headers.get('Content-Length')||0);
 if(contentLength>MAX_BYTES)return json({error:'Document trop volumineux'},413);
 const name=(request.headers.get('X-File-Name')||'contrat.pdf').trim();
 if(name.length>100||!/^[-\w .()À-ÿ]+\.pdf$/i.test(name))return json({error:'Nom de document invalide'},400);
 const agreement=await auth.db.prepare('SELECT id FROM records_agreements WHERE id=?').bind(agreementId).first();
 if(!agreement)return json({error:'Contrat introuvable'},404);
 const bytes=new Uint8Array(await request.arrayBuffer());
 if(bytes.length>MAX_BYTES||!isPdf(bytes))return json({error:'PDF invalide ou trop volumineux'},400);
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 const hash=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
 const id=crypto.randomUUID(),key='contracts/'+agreementId+'/'+id+'.pdf';
 await auth.bucket.put(key,bytes,{httpMetadata:{contentType:'application/pdf'}});
 try{
  await auth.db.batch([
   auth.db.prepare('INSERT INTO records_private_documents(id,agreement_id,object_key,original_name,media_type,sha256,size_bytes,uploaded_by) VALUES (?,?,?,?,?,?,?,?)').bind(id,agreementId,key,name,'application/pdf',hash,bytes.length,auth.user.email),
   auth.db.prepare('INSERT INTO records_audit (id,actor_email,action,object_type,object_id) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),auth.user.email,'upload','document',id)
  ]);
 }catch(error){await auth.bucket.delete(key).catch(()=>{});return json({error:'Enregistrement du document impossible'},500)}
 return json({id,agreementId,sha256:hash,sizeBytes:bytes.length,status:'stored_unsigned'},201);
}
export async function onRequestGet(context){
 const auth=await authorized(context);if(auth.error)return auth.error;
 const id=new URL(context.request.url).searchParams.get('id');
 if(!id||!/^[a-f0-9-]{36}$/i.test(id))return json({error:'Identifiant invalide'},400);
 const doc=await auth.db.prepare('SELECT object_key,original_name FROM records_private_documents WHERE id=?').bind(id).first();
 if(!doc)return json({error:'Document introuvable'},404);
 const object=await auth.bucket.get(doc.object_key);
 if(!object)return json({error:'Fichier indisponible'},404);
 const safeName=doc.original_name.replace(/[^A-Za-z0-9._-]/g,'_');
 return new Response(object.body,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename="'+safeName+'"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
}
