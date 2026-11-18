// Public catalog utilities. Never load confidential artist contracts here.
export const publishedArtists=items=>Array.isArray(items)?items.filter(x=>x&&x.published===true&&typeof x.name==='string'&&x.name.trim()&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.slug||'')):[];
export const publishedReleases=items=>Array.isArray(items)?items.filter(x=>x&&x.published===true&&typeof x.title==='string'&&x.title.trim()&&['single','ep','album','clip'].includes(x.type)&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.artistSlug||'')):[];
export const publishedNews=items=>Array.isArray(items)?items.filter(x=>x&&x.published===true&&typeof x.title==='string'&&x.title.trim()):[];
export const httpsUrl=value=>{if(typeof value!=='string')return null;try{const u=new URL(value);return u.protocol==='https:'?u.href:null}catch{return null}};
export const text=(tag,value,className)=>{const n=document.createElement(tag);n.textContent=String(value??'');if(className)n.className=className;return n};
export const externalLink=(href,label)=>{const url=httpsUrl(href);if(!url)return null;const a=text('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a};
export const image=(href,alt)=>{const url=httpsUrl(href);if(!url)return null;const img=document.createElement('img');img.src=url;img.alt=alt;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';return img};
export async function catalog(name){try{const res=await fetch('./'+name+'.json',{cache:'no-store'});if(!res.ok)return [];const json=await res.json();return Array.isArray(json)?json:[]}catch{return []}}
export const shortDate=date=>{if(typeof date!=='string'||!/\d{4}-\d{2}-\d{2}/.test(date))return '';const d=new Date(date+'T12:00:00Z');return Number.isFinite(d.valueOf())?new Intl.DateTimeFormat('fr-FR',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(d):''};
