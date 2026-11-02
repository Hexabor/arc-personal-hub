const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../dist/app.js','utf8');
const stored=new Map();
class FixedDate extends Date{constructor(...args){super(...(args.length?args:['2026-11-02T12:00:00Z']));}static now(){return new Date('2026-11-02T12:00:00Z').getTime();}}
function runtime(){
 const events={},windowEvents={},elements=new Map();let hooks;
 const element=id=>{if(!elements.has(id))elements.set(id,{id,dataset:{},innerHTML:'',textContent:'',value:'',addEventListener(){},focus(){},hidden:false,open:false});return elements.get(id)};
 const snapshot={tasks:[],projects:[],people:[],history:[],incoming:[],recommendations:[],ideas:[],summary:[],modules:[{'Módulo ID':'TRAIN',Dominio:'Entrenamiento',URL:'https://example.invalid/train'}, {'Módulo ID':'LATER',Dominio:'Futuro',Estado:'Pendiente'}]};
 const location={hash:''};
 const window={HUB_SNAPSHOT:snapshot,location,history:{replaceState(_a,_b,hash){location.hash=hash}},ARC_APPS:{catalog:[{id:'watch',name:'Watch Tracker',description:'Library'},{id:'flowgrid',name:'FlowGrid',description:'Money'}],hide(){},show(){}},addEventListener:(name,fn)=>windowEvents[name]=fn,scrollTo(){},__ARC_TEST_HOOK__:h=>hooks=h};
 const context={window,document:{getElementById:element,querySelectorAll:()=>[],addEventListener:(name,fn)=>events[name]=fn,activeElement:null},localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)},console,Intl,Date:FixedDate,URL,setInterval(){},setTimeout(){},clearTimeout(){}};
 vm.runInNewContext(source,context);
 return {hooks,events,windowEvents,element,snapshot,location};
}
const r=runtime(),day='2026-11-02';
const rows=[{ID:'far','Fecha del hecho':'2026-12-01'},{ID:'past','Fecha del hecho':'2026-10-31'},{ID:'today','Fecha del hecho':day},{ID:'near','Fecha del hecho':'2026-11-03'},{ID:'old','Fecha del hecho':'2025-01-01'},{ID:'undated','Título':'No date'},{ID:'bad','Fecha del hecho':'2026-02-30'},{}];
const ids=scope=>Array.from(r.hooks.memoryTimeline(rows,scope,day),x=>x.ID);
assert.deepEqual(ids('history'),['today','past','old']);
assert.deepEqual(ids('upcoming'),['today','near','far']);
assert.deepEqual(ids('undated'),['bad','undated']);
assert.equal(rows[0].ID,'far','Filtering must not reorder source records');
assert.equal(r.hooks.memoryDate({'Fecha del hecho':46271}),'2026-09-06');
assert.equal(r.hooks.memoryDate({'Fecha del hecho':'02/11/2026'}),day);
assert.equal(r.hooks.memoryDate({'Fecha del hecho':'2026-02-30'}),'');
const click=dataset=>r.events.click({target:{closest:()=>({dataset,hasAttribute:()=>false})}});
(async()=>{
 for(const view of ['tareas','proyectos','personas','incoming','memoria','tareas'])await click({view});
 assert.deepEqual(Array.from(r.hooks.getRecentModules()),['view:tareas','view:memoria','view:incoming','view:personas','view:proyectos']);
 r.hooks.rememberModule('module:TRAIN');r.hooks.rememberModule('module:LATER');r.hooks.rememberModule('https://untrusted.invalid');
 assert.equal(r.hooks.getRecentModules()[0],'module:TRAIN');assert.equal(r.hooks.getRecentModules().length,5);
 await click({homeApp:'watch'});assert.equal(r.location.hash,'#apps/watch');assert.equal(r.hooks.getRecentModules()[0],'app:watch');
 r.windowEvents['arc-module-open']({detail:{key:'app:flowgrid'}});assert.equal(r.hooks.getRecentModules()[0],'app:flowgrid');
 assert.deepEqual(Array.from(runtime().hooks.getRecentModules()),Array.from(r.hooks.getRecentModules()),'Recents must survive a new session');
 r.events.toggle({target:{dataset:{moduleSection:'ocio'},open:true}});assert.ok(stored.get('arc-hub-open-sections-v1').includes('ocio'));
 const restored=runtime();assert.ok(restored.element('side-nav').innerHTML.includes('data-module-section="ocio" open'));
 r.snapshot.history=rows;r.snapshot.recommendations=[{ID:'REC','Título':'Recommendation'}];r.snapshot.ideas=[{ID:'IDEA',Idea:'Idea'}];
 await click({view:'memoria'});await click({memoryScope:'upcoming'});
 const html=r.element('main').innerHTML;assert.ok(html.includes('data-detail="history|near"'));assert.ok(!html.includes('history|old'));assert.ok(html.indexOf('history|near')<html.indexOf('history|far'));assert.ok(html.includes('Sin fecha'));
 await click({memoryScope:'recommendations'});assert.ok(r.element('main').innerHTML.includes('data-detail="recommendations|REC"'));assert.ok(!r.element('main').innerHTML.includes('history|far'));
 await click({memoryScope:'ideas'});assert.ok(r.element('main').innerHTML.includes('data-detail="ideas|IDEA"'));
 console.log('PASS: inclusive date boundaries, timeline direction, invalid/undated separation, five unique persisted recents, app/direct/external keys, disabled modules, disclosure persistence and independent recommendation/idea tabs.');
})().catch(error=>{console.error(error);process.exit(1)});
