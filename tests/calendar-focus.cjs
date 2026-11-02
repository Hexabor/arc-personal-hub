const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../dist/app.js','utf8'),stored=new Map();
function runtime(){
 const events={},elements=new Map(),classes=new Set();let hooks;
 const element=id=>{if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',value:'',open:false,classList:{add(){},remove(){}},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(id)};
 const snapshot={tasks:[],projects:[],people:[],history:[],incoming:[],recommendations:[],ideas:[],summary:[],modules:[]};
 const window={HUB_SNAPSHOT:snapshot,location:{hash:'#memoria'},history:{replaceState(){}},addEventListener(){},scrollTo(){},__ARC_TEST_HOOK__:h=>hooks=h};
 const document={body:{classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name)}}},getElementById:element,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(name,fn)=>events[name]=fn};
 vm.runInNewContext(source,{window,document,localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)},console,Intl,Date,URL,setInterval(){},setTimeout(){},clearTimeout(){}});
 const click=dataset=>events.click({target:{closest:()=>({dataset,hasAttribute:()=>false})}});
 const change=(id,value)=>events.change({target:{id,value}});
 return {hooks,snapshot,element,classes,events,click,change};
}
(async()=>{
 const r=runtime();const future=new Date().toISOString().slice(0,7)+'-17';
 r.snapshot.history=Array.from({length:12},(_,i)=>({ID:'P'+i,'Título':i===0?'First <test>':'Other '+i,Planificación:'Planificado','Estado de realización':'Pendiente','Fecha prevista':future}));
 r.snapshot.history.push({ID:'UNDATED','Título':'No date',Planificación:'Planificado','Estado de realización':'Pendiente'});
 await r.click({memoryScope:'plans'});assert.ok(r.hooks.isCalendarFocused());assert.ok(r.classes.has('calendar-focus'));
 const grid=r.hooks.focusedCalendar(r.snapshot.history);assert.equal((grid.match(/class="calendar-cell /g)||[]).length,42);assert.ok(grid.includes('+11 más'));assert.ok(grid.includes('First &lt;test&gt;'));assert.ok(!grid.includes('history|P11'),'Extra entries must use the day overlay');
 r.change('focus-plan-scope','allPlans');assert.ok(r.element('main').innerHTML.includes('Sin fecha · 1'));
 r.hooks.openMemoryOverlay('day',future);assert.ok(r.element('detail-dialog').open);assert.ok(r.element('detail-content').innerHTML.includes('history|P11'));assert.ok(!r.element('detail-content').innerHTML.includes('UNDATED'));
 r.hooks.openMemoryOverlay('undated');assert.ok(r.element('detail-content').innerHTML.includes('UNDATED'));
 r.hooks.openMemoryOverlay('filters');r.events.input({target:{id:'memory-query',value:'First'}});assert.ok(r.element('main').innerHTML.includes('Filtros · 1'));assert.ok(r.element('detail-dialog').open,'Filtering must retain the overlay');
 await r.click({memoryReset:'true'});assert.ok(!r.element('main').innerHTML.includes('Filtros · 1'));
 r.element('detail-dialog').close();await r.click({calendarFocus:'false'});assert.ok(!r.classes.has('calendar-focus'));assert.equal(stored.get('arc-memory-calendar-focus-v1'),'false');
 const restored=runtime();await restored.click({memoryScope:'plans'});assert.ok(!restored.hooks.isCalendarFocused(),'Explicit exit survives a new page');
 await r.click({calendarFocus:'true'});await r.click({planView:'agenda'});assert.ok(!r.classes.has('calendar-focus'));await r.click({planView:'calendar'});assert.ok(r.classes.has('calendar-focus'));
 r.change('focus-memory-section','history');assert.ok(!r.classes.has('calendar-focus'));await r.click({memoryScope:'plans'});await r.click({view:'tareas'});assert.ok(!r.classes.has('calendar-focus'));
 console.log('PASS: focus/exit persistence, six-week grid, dense-day and undated overlays, live filtering, filter reset, agenda and module navigation.');
})().catch(error=>{console.error(error);process.exit(1)});
