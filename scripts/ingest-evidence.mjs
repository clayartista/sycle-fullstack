#!/usr/bin/env node
import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import crypto from 'node:crypto';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const execFileAsync = promisify(execFile);
const [, , ...args] = process.argv;
function arg(name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; }
const filePath = arg('--file');
const jobId = arg('--job-id');
const sourceIdArg = arg('--source-id');
const topicSlug = arg('--topic');
const maxChars = Number(arg('--max-chars') || 1800);
const overlap = Number(arg('--overlap') || 250);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken:false, persistSession:false } });
const embeddingUrl = process.env.EMBEDDING_API_URL;
const embeddingKey = process.env.EMBEDDING_API_KEY;
const embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const embeddingDimensions = Number(process.env.EMBEDDING_DIMENSIONS || 1536);

if (!filePath && !jobId) throw new Error('Pass --file <path> or --job-id <id>.');
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase service role env vars are required.');

function chunkText(text) {
  const normalized = text.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  const paragraphs = normalized.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const chunks=[]; let buffer=''; let index=0;
  const push=()=>{ const content=buffer.trim(); if(content){chunks.push({index,content});index++;buffer=content.slice(Math.max(0,content.length-overlap));} };
  for(const p of paragraphs){
    if((buffer+'\n\n'+p).length<=maxChars){ buffer=buffer?buffer+'\n\n'+p:p; continue; }
    push();
    if(p.length<=maxChars){ buffer=p; continue; }
    const sentences=p.split(/(?<=[.!?])\s+/);
    for(const s of sentences){
      if((buffer+' '+s).trim().length<=maxChars) buffer=(buffer+' '+s).trim(); else { push(); buffer=s; }
    }
  }
  push(); return chunks;
}

async function embed(inputs) {
  if(!embeddingUrl || !embeddingKey) throw new Error('EMBEDDING_API_URL and EMBEDDING_API_KEY are required for ingestion.');
  const response=await fetch(embeddingUrl,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${embeddingKey}`},body:JSON.stringify({model:embeddingModel,input:inputs,dimensions:embeddingDimensions})});
  if(!response.ok) throw new Error(`Embedding API ${response.status}: ${await response.text()}`);
  const data=await response.json();
  return (data.data||[]).sort((a,b)=>a.index-b.index).map(x=>x.embedding);
}

async function extractPdf(path) {
  const { stdout } = await execFileAsync('pdftotext', ['-layout', path, '-']);
  return stdout;
}

function pageAwareChunks(text) {
  const pages = text.split('\f');
  const all = [];
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageText = pages[pageIndex].trim();
    if (!pageText) continue;
    for (const chunk of chunkText(pageText)) all.push({ ...chunk, pageNumber: pageIndex + 1 });
  }
  return all.map((chunk, i) => ({ ...chunk, index: i }));
}

async function main() {
  let job, source, document, path;
  if(jobId){
    const { data, error }=await supabase.from('ingestion_jobs').select('*, evidence_sources(*), evidence_documents(*)').eq('id',jobId).single();
    if(error) throw error;
    job=data; source=Array.isArray(data.evidence_sources)?data.evidence_sources[0]:data.evidence_sources; document=Array.isArray(data.evidence_documents)?data.evidence_documents[0]:data.evidence_documents;
    const tmp=`/tmp/${document.file_name}`;
    const { data: blob, error: downloadError }=await supabase.storage.from(document.storage_bucket).download(document.storage_path);
    if(downloadError) throw downloadError;
    await fs.writeFile(tmp, Buffer.from(await blob.arrayBuffer())); path=tmp;
  } else {
    path=filePath;
    const { data, error }=await supabase.from('evidence_sources').select('*').eq('id',sourceIdArg).single();
    if(error) throw error; source=data;
    if(!sourceIdArg) throw new Error('--source-id is required with --file.');
  }
  if(topicSlug){
    const { data: topic, error }=await supabase.from('knowledge_topics').select('id').eq('slug',topicSlug).single();
    if(error) throw error;
    await supabase.from('topic_evidence').upsert({topic_id:topic.id,source_id:source.id,priority:100});
  }
  if(job?.id) await supabase.from('ingestion_jobs').update({status:'processing',progress:10,started_at:new Date().toISOString(),error_message:null}).eq('id',job.id);
  const text=await extractPdf(path);
  const chunks=pageAwareChunks(text);
  if(!chunks.length) throw new Error('No text extracted from PDF.');
  const embeddings=[];
  for(let i=0;i<chunks.length;i+=16){ embeddings.push(...await embed(chunks.slice(i,i+16).map(c=>c.content))); const p=20+Math.round((Math.min(i+16,chunks.length)/chunks.length)*55); if(job?.id) await supabase.from('ingestion_jobs').update({progress:p}).eq('id',job.id); }

  await supabase.from('evidence_chunks').delete().eq('source_id',source.id);
  const { data: topicRows }=await supabase.from('topic_evidence').select('topic_id').eq('source_id',source.id).limit(1);
  const fallbackTopic=topicRows?.[0]?.topic_id;
  if(!fallbackTopic) throw new Error('Source must be linked to at least one topic before ingestion.');
  const rows=chunks.map((c,i)=>({source_id:source.id,topic_id:fallbackTopic,chunk_index:c.index,content:c.content,page_number:c.pageNumber,embedding:embeddings[i]}));
  for(let i=0;i<rows.length;i+=50){ const {error}=await supabase.from('evidence_chunks').insert(rows.slice(i,i+50)); if(error) throw error; }
  if(job?.id) await supabase.from('ingestion_jobs').update({status:'completed',progress:100,completed_at:new Date().toISOString()}).eq('id',job.id);
  console.log(JSON.stringify({ok:true, sourceId:source.id, jobId:job?.id||null, chunks:chunks.length, checksum:crypto.createHash('sha256').update(await fs.readFile(path)).digest('hex')},null,2));
}

main().catch(async (error)=>{
  if(jobId) await supabase.from('ingestion_jobs').update({status:'failed',error_message:error instanceof Error?error.message:String(error)}).eq('id',jobId);
  console.error(error); process.exit(1);
});
