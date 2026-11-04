import assert from 'node:assert/strict';
import { readFile, readdir, lstat, access } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const secretPatterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bgh[pousr]_[A-Za-z0-9]{20,}\b/,/\bgithub_pat_[A-Za-z0-9_]{20,}\b/,/\bsk-(?:proj-)?[A-Za-z0-9_-]{30,}\b/];
let files=0;
async function walk(dir){for(const name of await readdir(dir)){const path=resolve(dir,name),stat=await lstat(path);assert(!stat.isSymbolicLink(),'No symlinks in deployment');if(stat.isDirectory()){assert.equal(name,'assets','Only public asset directory is permitted');await walk(path);continue}assert(!name.startsWith('.')||name==='.nojekyll','No hidden configuration in deployment');assert(!/\.env|credentials|\.pem|\.key|\.map$/i.test(name),'No configuration, credentials, or source maps');assert(['.html','.js','.css','.jpg','.svg','.webmanifest'].includes(extname(name))||name==='.nojekyll','Unexpected public file type');assert(stat.size<10*1024*1024,'Unexpectedly large public asset');files++;if(name.endsWith('.jpg'))continue;const source=await readFile(path,'utf8');for(const pattern of secretPatterns)assert(!pattern.test(source),'Credential-like content in '+name);if(name.endsWith('.html')){assert(source.includes('Content-Security-Policy'),'HTML must include CSP');assert(source.includes('name="referrer" content="no-referrer"'),'No-referrer policy is required');assert(!/<script(?![^>]*\bsrc=)[^>]*>\s*\S/i.test(source),'No inline executable scripts');assert(!/\son[a-z]+\s*=/i.test(source),'No inline event handlers');for(const [,url]of source.matchAll(/(?:src|href)="([^"]+)"/g)){if(/^https:|^#/.test(url))continue;assert(url.startsWith('./'),'Public resources must be relative');const target=resolve(dirname(path),url);assert(target===root||target.startsWith(root+sep),'Resource must stay within dist');await access(target)}}}}
await walk(root);
const html=await readFile(resolve(root,'index.html'),'utf8');
const policy=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
assert(policy.includes("script-src 'self';"),'Scripts must be same-origin');assert(!policy.includes('unsafe-eval'),'No eval policy');assert(policy.includes("connect-src 'self';"),'No external network endpoints');assert(policy.includes("object-src 'none';"),'No plugins');assert(policy.includes("base-uri 'none';"),'No base URL injection');
const css=await readFile(resolve(root,'styles.css'),'utf8');assert(!/@import|https?:\/\//.test(css),'No external styles or fonts');
const js=await readFile(resolve(root,'app.js'),'utf8');assert(!/https?:\/\/|sendBeacon|XMLHttpRequest|WebSocket/.test(js),'No external services or upload endpoints');assert(js.includes('audio:false'),'Camera must not request microphone');
const check=spawnSync(process.execPath,['--check',resolve(root,'app.js')],{encoding:'utf8'});assert.equal(check.status,0,check.stderr);
const manifest=JSON.parse(await readFile(resolve(root,'manifest.webmanifest'),'utf8'));assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
console.log(`PASS: ${files} public files; relative assets; no credential patterns; CSP and referrer policy; no external fonts/services; microphone disabled; valid JS and manifest.`);
