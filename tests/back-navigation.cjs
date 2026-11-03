const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function runtime(){
 const events={},winEvents={},els=new Map(),stored=new Map();let hooks,calls=0,allowDiscard=false;
 const element=id=>{if(!els.has(id))els.set(id,{id,dataset:{},innerHTML:'',textContent:'',value:'',open:false,scrollTop:0,classList:{toggle(){},remove(){},add(){}},addEventListener(n,f){events[id+':'+n]=f},focus(){},showModal(){this.open=true},close(){this.open=false}});return els.get(id)};
 const snapshot={tasks:[{ID:'TASK-0001',Tarea:'Synthetic task',Estado:'Pendiente','Proyecto ID':'PRJ-0001'}],projects:[{ID:'PRJ-0001',Nombre:'Synthetic project',Estado:'Activo'}],people:[],history:[{ID:'EVT-0001','Título':'Synthetic plan',Planificación:'Planificado','Estado de realización':'Pendiente','Fecha prevista':'2026-12-17'}],incoming:[],recommendations:[],ideas:[],summary:[],modules:[]};
 const window={HUB_SNAPSHOT:snapshot,location:{hash:''},history:{replaceState(a,b,hash){window.location.hash=hash}},scrollY:0,scrollTo({top}){this.scrollY=top},addEventListener(n,f){winEvents[n]=f},confirm(){calls++;return allowDiscard},__ARC_TEST_HOOK__:h=>hooks=h};
 const document={getElementById:element,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(n,f){events[n]=f},activeElement:null};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../dist/app.js','utf8'),{window,document,localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},console,Intl,Date,URL,setTimeout(){},clearTimeout(){},setInterval(){}});
 return {hooks,window,events,element,stored,setDiscard(v){allowDiscard=v},get confirms(){return calls},click:dataset=>events.click({target:{closest:()=>({dataset,hasAttribute:()=>false})}}),change:(id,value)=>events.change({target:{id,value}})};
}
(async()=>{
 const r=runtime();
 const home=r.element('main').innerHTML;
 assert.match(home,/data-entry-scope="plans"/);assert.match(home,/data-entry-scope="history"/);
 await r.click({view:'memoria',entryScope:'plans'});assert.equal(r.window.location.hash,'#memoria/plans');assert.ok(r.hooks.isCalendarFocused());
 assert.match(r.element('main').innerHTML,/data-back="screen"/);
 await r.click({calendarMove:'1'});const month=r.element('main').innerHTML.match(/<h2 aria-live="polite">([^<]+)/)[1];
 await r.click({view:'tareas'});await r.click({back:'screen'});assert.ok(r.hooks.isCalendarFocused());assert.ok(r.element('main').innerHTML.includes(month));
 await r.click({view:'memoria',entryScope:'history'});assert.ok(!r.hooks.isCalendarFocused());assert.match(r.element('main').innerHTML,/memory-tab-history" role="tab" aria-selected="true"/);
 await r.click({back:'screen'});assert.ok(r.hooks.isCalendarFocused());
 // Calendar day -> record -> same day list, without data reads.
 r.hooks.openMemoryOverlay('day','2026-12-17');const dayHTML=r.element('detail-content').innerHTML;r.element('detail-dialog').scrollTop=90;
 await r.click({detail:'history|EVT-0001'});await r.click({back:'detail'});assert.equal(r.element('detail-content').innerHTML,dayHTML);assert.equal(r.element('detail-dialog').scrollTop,90);
 await r.click({back:'detail'});assert.equal(r.element('detail-dialog').open,false);
 // Search and scope -> another module -> exact search restored.
 r.events.input({target:{id:'global-search',value:'Synthetic'}});await r.click({searchScope:'projects'});r.window.scrollY=320;
 await r.click({view:'tareas'});r.change('filter-context','Ordenador');await r.click({view:'proyectos'});await r.click({back:'screen'});
 assert.match(r.element('main').innerHTML,/<option selected>Ordenador/);await r.click({back:'screen'});assert.equal(r.element('global-search').value,'Synthetic');assert.equal(r.window.scrollY,320);assert.match(r.element('main').innerHTML,/data-search-scope="projects"/);
 // Project detail -> filtered tasks -> previous project detail, then original list.
 await r.click({view:'proyectos'});await r.click({detail:'projects|PRJ-0001'});const projectHTML=r.element('detail-content').innerHTML;
 await r.click({project:'PRJ-0001'});assert.equal(r.element('detail-dialog').open,false);assert.match(r.element('main').innerHTML,/value="PRJ-0001" selected/);
 await r.click({back:'screen'});assert.equal(r.element('detail-dialog').open,true);assert.equal(r.element('detail-content').innerHTML,projectHTML);await r.click({back:'detail'});
 // Unsaved changes retain the dialog on refusal and ask only once on acceptance.
 await r.click({detail:'tasks|TASK-0001'});r.events.input({target:{closest:()=>true,id:'field'}});await r.click({back:'detail'});assert.equal(r.element('detail-dialog').open,true);assert.equal(r.confirms,1);
 r.setDiscard(true);await r.click({back:'detail'});assert.equal(r.element('detail-dialog').open,false);assert.equal(r.confirms,2);
 assert.ok(![...r.stored.values()].some(v=>v.includes('Synthetic')),'Navigation must not persist record content');
 console.log('PASS: scoped Home routes, month/focus state, nested day dialog, search/scope/scroll restoration, task filters, project round trip and single discard confirmation.');
})().catch(e=>{console.error(e);process.exit(1)});
