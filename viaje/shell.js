(() => {
 'use strict';
 const root=document.getElementById('vacation-root'),sessionButton=document.getElementById('session-button');
 const connectionMarkup=root.innerHTML;
 document.addEventListener('click',event=>{
  if(event.target.closest('#connect-google'))try{window.ARC_BACKEND.connect();}catch(error){document.getElementById('connection-status').textContent=error.message;}
 });
 sessionButton.addEventListener('click',()=>window.ARC_BACKEND.disconnect());
 window.addEventListener('arc-auth-changed',()=>{
  const ready=window.ARC_BACKEND.ready();sessionButton.hidden=!ready;
  if(ready)window.ARC_VACATION.mount(root,(...args)=>window.ARC_BACKEND.call(...args));
  else root.innerHTML=connectionMarkup;
 });
 let installPrompt;
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;document.getElementById('install-app').hidden=false;});
 document.getElementById('install-app').addEventListener('click',async()=>{if(!installPrompt)return;await installPrompt.prompt();installPrompt=null;document.getElementById('install-app').hidden=true;});
 const help=document.getElementById('install-dialog');
 document.getElementById('install-help').addEventListener('click',()=>help.showModal());
 document.getElementById('close-help').addEventListener('click',()=>help.close());
})();
