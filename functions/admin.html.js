import {verifyAccessJwt,assertConfigured} from './_lib/access.js';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const denied=(status,message)=>new Response(message,{status,headers:{...headers,'Content-Type':'text/plain; charset=utf-8'}});
export async function onRequest(context){
 const {request,env}=context;
 if(request.method!=='GET'&&request.method!=='HEAD')return denied(405,'Méthode non autorisée');
 if(!assertConfigured(env))return denied(503,'Administration indisponible : configuration privée requise');
 let user;
 try{user=await verifyAccessJwt(request,env)}catch{return denied(401,'Authentification requise')}
 let member;
 try{member=await env.RECORDS_DB.prepare('SELECT role FROM records_roles WHERE email=? AND enabled=1').bind(user.email).first()}catch{return denied(503,'Base privée indisponible')}
 if(!member||!['director','ar','production','finance'].includes(member.role))return denied(403,'Accès refusé');
 const response=await context.next();
 const safe=new Response(response.body,response);
 for(const [key,value] of Object.entries(headers))safe.headers.set(key,value);
 safe.headers.set('Content-Security-Policy',"default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' https:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
 return safe;
}
