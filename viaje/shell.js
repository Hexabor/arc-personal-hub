(() => {
 'use strict';
 const root=document.getElementById('vacation-root'),sessionButton=document.getElementById('session-button');
 const connectionMarkup=root.innerHTML;
 let activeView='agenda';
 function switchView(view){
  activeView=view;
  document.querySelectorAll('[data-trip-view]').forEach(element=>element.hidden=element.dataset.tripView!==view);
  document.querySelectorAll('[data-trip-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tripTab===view)));
 }
 document.addEventListener('click',event=>{
  if(event.target.closest('#connect-google'))try{window.ARC_BACKEND.connect();}catch(error){document.getElementById('connection-status').textContent=error.message;}
  const button=event.target.closest('[data-trip-tab]');if(button)switchView(button.dataset.tripTab);
 });
 sessionButton.addEventListener('click',()=>window.ARC_BACKEND.disconnect());
 window.addEventListener('arc-auth-changed',()=>{
  const ready=window.ARC_BACKEND.ready();sessionButton.hidden=!ready;
  if(ready){
   root.innerHTML='<nav class="trip-views" aria-label="Secciones del viaje"><button data-trip-tab="agenda" aria-pressed="true">Agenda</button><button data-trip-tab="packing" aria-pressed="false">Maleta</button></nav><div data-trip-view="agenda" id="agenda-root"></div><div data-trip-view="packing" id="packing-root" hidden></div>';
   window.ARC_PACKING.mount(document.getElementById('packing-root'),(...args)=>window.ARC_BACKEND.call(...args));
   window.ARC_VACATION.mount(document.getElementById('agenda-root'),async(...args)=>{
    const result=await window.ARC_BACKEND.call(...args),data=args[0]==='getVacationData'?result:result.data;
    if(data){window.ARC_PACKING.receive(data);const filtered={...data,plans:data.plans.filter(plan=>!window.ARC_PACKING.isPacking(plan))};return args[0]==='getVacationData'?filtered:{...result,data:filtered};}
    return result;
   });
   switchView(activeView);
  }
  else {window.ARC_PACKING.reset();root.innerHTML=connectionMarkup;}
 });
 let installPrompt;
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;document.getElementById('install-app').hidden=false;});
 document.getElementById('install-app').addEventListener('click',async()=>{if(!installPrompt)return;await installPrompt.prompt();installPrompt=null;document.getElementById('install-app').hidden=true;});
 const help=document.getElementById('install-dialog');
 document.getElementById('install-help').addEventListener('click',()=>help.showModal());
 document.getElementById('close-help').addEventListener('click',()=>help.close());
})();
