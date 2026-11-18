import {verifyAccessJwt,hasRole,assertConfigured} from '../../_lib/access.js';
const json=(payload,status=200)=>new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const deny=()=>json({error:'Accès refusé'},403);
const visible=(role,roles)=>hasRole(role,roles);
const str=(v,max=120)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=max?v.trim():null;
const integer=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const royaltyAmount=(gross,deductions,points)=>Math.round((gross-deductions)*points/10000);
const log=(db,actor,action,type,id)=>db.prepare('INSERT INTO records_audit (id,actor_email,action,object_type,object_id) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),actor,action,type,id);
async function handler(context,method){
 const {request,env,params}=context;
 if(!assertConfigured(env))return json({error:'Administration non configurée'},503);
 let user;
 try{user=await verifyAccessJwt(request,env)}catch{return json({error:'Authentification requise'},401)}
 const db=env.RECORDS_DB;
 let member;
 try{member=await db.prepare('SELECT role FROM records_roles WHERE email=? AND enabled=1').bind(user.email).first()}catch{return json({error:'Base privée indisponible'},503)}
 if(!member)return deny();
 const role=member.role;
 const action=params.action;
 if(method==='GET'){
  if(action==='me')return json({email:user.email,role});
  if(action==='dashboard'){
   if(!visible(role,['director','ar','production','finance']))return deny();
   const [artists,agreements,royalties]=await Promise.all([
    db.prepare('SELECT COUNT(*) AS total FROM records_artists').first(),
    db.prepare('SELECT COUNT(*) AS total FROM records_agreements').first(),
    db.prepare('SELECT COUNT(*) AS total FROM records_royalties').first()
   ]);
   return json({artists:artists?.total||0,agreements:agreements?.total||0,royalties:royalties?.total||0});
  }
  if(action==='artists'){
   if(!visible(role,['director','ar','production','finance']))return deny();
   const result=await db.prepare('SELECT id,stage_name,stage,created_at FROM records_artists ORDER BY created_at DESC LIMIT 100').all();
   return json({items:result.results||[]});
  }
  if(action==='agreements'){
   if(!visible(role,['director','ar','production']))return deny();
   const result=await db.prepare('SELECT id,artist_id,kind,status,created_at FROM records_agreements ORDER BY created_at DESC LIMIT 100').all();
   return json({items:result.results||[]});
  }
  if(action==='royalties'){
   if(!visible(role,['director','finance']))return deny();
   const result=await db.prepare('SELECT id,artist_id,reference,currency,gross_cents,permitted_deductions_cents,basis_points,payable_cents,status,created_at FROM records_royalties ORDER BY created_at DESC LIMIT 100').all();
   return json({items:result.results||[]});
  }
  return json({error:'Route inconnue'},404);
 }
 if(method!=='POST')return json({error:'Méthode non autorisée'},405);
 const origin=request.headers.get('Origin');
 if(!origin||origin!==new URL(request.url).origin)return deny();
 if(Number(request.headers.get('Content-Length')||0)>8192)return json({error:'Données trop volumineuses'},413);
 let data;try{const raw=await request.text();if(raw.length>8192)return json({error:'Données trop volumineuses'},413);data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw Error('bad')}catch{return json({error:'JSON invalide'},400)}
 if(action==='artists'){
  if(!visible(role,['director','ar']))return deny();
  const name=str(data.name,100);if(!name)return json({error:'Nom d’artiste requis'},400);
  const id=crypto.randomUUID();
  await db.batch([
   db.prepare('INSERT INTO records_artists (id,stage_name) VALUES (?,?)').bind(id,name),
   log(db,user.email,'create','artist',id)
  ]);
  return json({id,stage:'application'},201);
 }
 if(action==='agreements'){
  if(!visible(role,['director']))return deny();
  const artistId=str(data.artistId,80),kind=data.kind;
  if(!artistId||!['recording','master_license','distribution','development'].includes(kind))return json({error:'Dossier ou type de contrat invalide'},400);
  const artist=await db.prepare('SELECT id FROM records_artists WHERE id=?').bind(artistId).first();
  if(!artist)return json({error:'Artiste introuvable'},404);
  const id=crypto.randomUUID();
  await db.batch([
   db.prepare('INSERT INTO records_agreements (id,artist_id,kind) VALUES (?,?,?)').bind(id,artistId,kind),
   log(db,user.email,'create_draft','agreement',id)
  ]);
  // No e-signature provider configured: NEVER mark this draft as signed.
  return json({id,status:'draft',signature:'provider_not_configured'},201);
 }
 if(action==='royalties'){
  if(!visible(role,['director','finance']))return deny();
  const artistId=str(data.artistId,80),reference=str(data.reference,100),currency=data.currency;
  const gross=data.grossCents,deductions=data.deductionsCents,points=data.basisPoints;
  if(!artistId||!reference||!['EUR','USD','GBP'].includes(currency)||!integer(gross,100000000000)||!integer(deductions,gross)||!integer(points,10000))
   return json({error:'Montants, taux ou références invalides'},400);
  const artist=await db.prepare('SELECT id FROM records_artists WHERE id=?').bind(artistId).first();
  if(!artist)return json({error:'Artiste introuvable'},404);
  const amount=royaltyAmount(gross,deductions,points),id=crypto.randomUUID();
  await db.batch([
   db.prepare('INSERT INTO records_royalties (id,artist_id,reference,currency,gross_cents,permitted_deductions_cents,basis_points,payable_cents) VALUES (?,?,?,?,?,?,?,?)')
    .bind(id,artistId,reference,currency,gross,deductions,points,amount),
   log(db,user.email,'create_draft','royalty',id)
  ]);
  return json({id,status:'draft',payableCents:amount,currency},201);
 }
 return json({error:'Route inconnue'},404);
}
export const onRequestGet=context=>handler(context,'GET').catch(()=>json({error:'Erreur interne'},500));
export const onRequestPost=context=>handler(context,'POST').catch(()=>json({error:'Erreur interne'},500));
export const onRequest=context=>json({error:'Méthode non autorisée'},405);
