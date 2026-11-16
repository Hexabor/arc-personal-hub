const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'cloudflare','ourense');fs.mkdirSync(out,{recursive:true});
for(const name of ['index.html','shell.css','shell.js','packing.js','packing.css','manifest.json','icon.svg','icon-180.png','icon-192.png','icon-512.png'])fs.copyFileSync(path.join(__dirname,name),path.join(out,name));
for(const name of ['vacaciones.js','vacaciones.css'])fs.copyFileSync(path.join(root,'dist',name),path.join(out,name));
let backend=fs.readFileSync(path.join(root,'pages/google-backend.js'),'utf8');backend=backend.replace(/const methods = new Set\(\[.*?\]\);/,"const methods = new Set(['getVacationData', 'saveVacationPlan']);");fs.writeFileSync(path.join(out,'google-backend.js'),backend);
fs.writeFileSync(path.join(out,'config.js'),'window.ARC_PUBLIC_CONFIG = '+fs.readFileSync(path.join(root,'pages/public-config.json'),'utf8').trim()+';\n');
const csp="default-src 'none'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'none'; manifest-src 'self'; script-src 'self' https://accounts.google.com/gsi/; style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style; img-src 'self' https: data:; connect-src https://script.googleapis.com https://www.googleapis.com https://accounts.google.com/gsi/; frame-src https://accounts.google.com/gsi/; font-src 'self'";
fs.writeFileSync(path.join(out,'_headers'),"/*\n  Cache-Control: no-cache\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Content-Type-Options: nosniff\n  Cross-Origin-Opener-Policy: same-origin-allow-popups\n  Content-Security-Policy: "+csp+'\n');
console.log(out);
