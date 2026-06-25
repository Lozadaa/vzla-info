// Limpieza de duplicados: agrupa los pares possible_matches(kind='duplicado')
// en clústeres (union-find), conserva UN registro por persona (preferir con
// foto, luego el más antiguo) y marca el resto como status='rejected'
// (reversible y respetado por el sync). Dry-run por defecto; --apply ejecuta.
import { readFileSync } from "node:fs";
import pg from "pg";
const APPLY = process.argv.includes("--apply");
for (const line of readFileSync(".env.local","utf8").split(/\r?\n/)){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m&&process.env[m[1]]===undefined)process.env[m[1]]=m[2].replace(/^["']|["']$/g,"");}
const REF=process.env.SUPABASE_CLOUD_PROJECT_REF,PASS=process.env.SUPABASE_CLOUD_DB_PASSWORD,HOST=process.env.SUPABASE_CLOUD_POOLER_HOST;
const c=new pg.Client({connectionString:`postgresql://postgres.${REF}:${encodeURIComponent(PASS)}@${HOST}:5432/postgres`,ssl:{rejectUnauthorized:false}});
await c.connect();
await c.query("set statement_timeout=0");

const { rows: pairs } = await c.query("select missing_id a, other_missing_id b from possible_matches where kind='duplicado' and status='pending'");
// Union-Find
const parent=new Map();
const find=x=>{while(parent.get(x)!==x){parent.set(x,parent.get(parent.get(x)));x=parent.get(x);}return x;};
const add=x=>{if(!parent.has(x))parent.set(x,x);};
for(const{a,b}of pairs){add(a);add(b);const ra=find(a),rb=find(b);if(ra!==rb)parent.set(ra,rb);}
const ids=[...parent.keys()];
// info de los registros (solo aprobados activos)
const info=new Map();
for(let i=0;i<ids.length;i+=500){const chunk=ids.slice(i,i+500);
  const{rows}=await c.query("select id,full_name,last_seen_zone,photo_url,contact_whatsapp,created_at from missing_persons where status='approved' and found=false and id = any($1::uuid[])",[chunk]);
  for(const r of rows)info.set(r.id,r);}
// clústeres
const clusters=new Map();
for(const id of ids){if(!info.has(id))continue;const root=find(id);(clusters.get(root)??clusters.set(root,[]).get(root)).push(info.get(id));}
let keepers=0, losers=[];
const sample=[];
for(const[,members]of clusters){
  if(members.length<2){keepers+=members.length;continue;}
  members.sort((x,y)=>{
    const px=x.photo_url?0:1, py=y.photo_url?0:1; if(px!==py)return px-py;
    return new Date(x.created_at)-new Date(y.created_at);
  });
  const keep=members[0]; keepers++;
  for(const m of members.slice(1))losers.push(m.id);
  if(sample.length<10)sample.push({keep:`${keep.full_name} (${keep.last_seen_zone})`,drop:members.slice(1).map(m=>`${m.full_name} (${m.last_seen_zone})`)});
}
console.log(`Pares duplicado: ${pairs.length}`);
console.log(`Clústeres con ≥2: ${[...clusters.values()].filter(m=>m.length>=2).length}`);
console.log(`Se conservan: ${keepers} | Se rechazan (duplicados): ${losers.length}`);
console.log("\n=== Muestra (conservar ⟵ rechazar) ===");
for(const s of sample)console.log(`  ✔ ${s.keep}\n     �levo ✗ ${s.drop.join(" · ")}`);
if(APPLY && losers.length){
  let done=0;
  for(let i=0;i<losers.length;i+=1000){const chunk=losers.slice(i,i+1000);
    const r=await c.query("update missing_persons set status='rejected' where id = any($1::uuid[]) and status='approved'",[chunk]);done+=r.rowCount;}
  await c.query("update possible_matches set status='confirmed' where kind='duplicado' and status='pending'");
  console.log(`\nAPLICADO: ${done} duplicados marcados rejected; cola de duplicados limpiada.`);
} else if(losers.length){
  console.log("\n(dry-run: nada cambiado. Usa --apply para limpiar.)");
}
await c.end();
