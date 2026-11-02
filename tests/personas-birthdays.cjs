const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../dist/app.js','utf8');
const events={},elements=new Map();let hooks;
const element=id=>{if(!elements.has(id))elements.set(id,{id,dataset:{},innerHTML:'',textContent:'',value:'',addEventListener(){},focus(){},hidden:false});return elements.get(id)};
const snapshot={tasks:[],projects:[],people:[{ID:'PER-0001',Nombre:'Persona actual'},{ID:'PER-0002',Nombre:'Otra persona'},{ID:'PER-0003',Nombre:'Inactiva',Activo:false}],dates:[],history:[],incoming:[],recommendations:[],ideas:[],modules:[]};
const location={hash:'#personas'};
const window={HUB_SNAPSHOT:snapshot,location,history:{replaceState(_a,_b,hash){location.hash=hash}},addEventListener(){},scrollTo(){},__ARC_TEST_HOOK__:h=>hooks=h};
class FixedDate extends Date{constructor(...args){super(...(args.length?args:['2026-11-02T12:00:00Z']));}}
vm.runInNewContext(source,{window,document:{getElementById:element,querySelectorAll:()=>[],addEventListener:(name,fn)=>events[name]=fn},localStorage:{getItem(){return null},setItem(){}},console,Intl,Date:FixedDate,URL,setInterval(){},setTimeout(){},clearTimeout(){}});
const birth=(ID,person,date,summary='')=>({ID,Tipo:'Cumpleaños','Personas relacionadas':person,'Fecha del hecho':date,'Resumen / memoria':summary});
const rows=[birth('known','Alias anterior (PER-0001)','1980-11-04'),birth('unknown','Otra persona (PER-0002)',null,'Cumpleaños de Otra persona: 05/11. El año NO está confirmado. En Notion figura 1988-11-05 con «¿año?».'),birth('off','Inactiva (PER-0003)','1980-11-01'),birth('bad','Error',null,'Cumpleaños de Error: 31/04.'),{Tipo:'Concierto','Fecha del hecho':'2000-11-01'}];
const birthdays=hooks.birthdayRecords([...rows,...rows],snapshot.people);
assert.equal(birthdays.length,2,'Duplicate date/history sources must not duplicate birthdays');
assert.equal(birthdays[0].name,'Persona actual');assert.equal(birthdays[0].personId,'PER-0001');assert.equal(birthdays[1].year,null);
assert.equal(hooks.birthdayRecords([birth('question','Persona','1988-05-19','¿año?')])[0].year,null);
assert.equal(hooks.birthdayRecords([birth('copy','Alias anterior (PER-0001)','1981-11-04'),rows[0]],snapshot.people)[0].year,null,'Conflicting years must not establish an age');
assert.equal(hooks.birthdayRecords([birth('metadata','Name',null,'Importado el 02/11/2026. Fuente 1980-11-04')]).length,0,'Unrelated dates must not create birthdays');
const structured=[{ID:'PER-0001','Nombre completo':'Nombre completo de ejemplo','Nombre habitual':'Alias','Otros alias':'Otro alias','Fecha de nacimiento':'1980-11-04','Cumpleaños':'04/11'},{ID:'PER-0002','Nombre habitual':'Año desconocido','Fecha de nacimiento':null,'Cumpleaños':'05/11'},{ID:'PER-0004','Nombre habitual':'Sin fecha','Fecha de nacimiento':null,'Cumpleaños':null}];
const canonical=hooks.birthdayRecords([...rows,birth('cleared','Sin fecha (PER-0004)','1980-11-01')],structured);
assert.equal(canonical.filter(x=>x.personId==='PER-0001').length,1);assert.equal(canonical.find(x=>x.personId==='PER-0001').name,'Alias');assert.equal(canonical.find(x=>x.personId==='PER-0002').year,null);assert.ok(!canonical.some(x=>x.personId==='PER-0004'),'Cleared structured birthdays must not return from the historical record');
assert.equal(hooks.personBirthday({'Nombre habitual':'Leap','Fecha de nacimiento':36585,'Cumpleaños':'29/02'}).year,2000);
assert.equal(hooks.personBirthday({'Nombre habitual':'Conflict','Fecha de nacimiento':'1980-11-04','Cumpleaños':'05/11'}).year,null);
assert.equal(hooks.personBirthday({'Nombre habitual':'Invalid','Cumpleaños':'31/04'}),null);
assert.equal(hooks.personName({'Nombre completo':'Only full name'}),'Only full name');
const series=[{name:'End',month:12,day:31,year:1990},{name:'Start',month:1,day:1,year:2000},{name:'Today',month:1,day:2,year:null}];
let result=hooks.birthdayTimeline(series,'upcoming','2026-01-02');
assert.deepEqual(Array.from(result,x=>x.name),['Today','End','Start']);assert.equal(result[2].date,'2027-01-01');assert.equal(result[2].age,27);assert.equal(result[0].age,null);
result=hooks.birthdayTimeline(series,'recent','2026-01-02');
assert.deepEqual(Array.from(result,x=>x.name),['Today','Start','End']);assert.equal(result[2].date,'2025-12-31');assert.equal(result[2].days,2);assert.equal(result[2].age,35);
const leap=[{name:'Leap',month:2,day:29,year:2000}];
assert.equal(hooks.birthdayTimeline(leap,'upcoming','2027-02-28')[0].days,0);
assert.equal(hooks.birthdayTimeline(leap,'upcoming','2028-02-28')[0].days,1);
assert.equal(hooks.birthdayTimeline(leap,'recent','2028-03-01')[0].date,'2028-02-29');
assert.equal(hooks.birthdayTimeline([{name:'DST',month:3,day:30,year:2000}],'upcoming','2026-03-28')[0].days,2);
snapshot.dates=rows;snapshot.history=rows;
const click=dataset=>events.click({target:{closest:()=>({dataset,hasAttribute:()=>false})}});
(async()=>{
 await click({view:'personas'});let html=element('main').innerHTML;
 assert.match(html,/id="people-tab-upcoming" aria-selected="true"/);assert.match(html,/Cumple 46 años/);assert.match(html,/04\/11/);assert.ok(!html.includes('/2000'),'Annual birthday label must never show a surrogate year');assert.match(html,/Edad sin confirmar/);assert.ok(html.indexOf('Persona actual')<html.indexOf('Otra persona'));
 await click({peopleScope:'recent'});html=element('main').innerHTML;assert.match(html,/Cumplió 45 años/);assert.ok(html.indexOf('Otra persona')<html.indexOf('Persona actual'));
 await click({peopleScope:'cards'});assert.match(element('main').innerHTML,/class="person-card(?: |")/);
 await click({view:'inicio'});await click({view:'personas'});assert.match(element('main').innerHTML,/id="people-tab-upcoming" aria-selected="true"/);
 assert.equal(rows[0]['Fecha del hecho'],'1980-11-04','Views must not mutate source records');
 if(process.env.ARC_PRIVATE_BIRTHDAYS){const privateRows=JSON.parse(fs.readFileSync(process.env.ARC_PRIVATE_BIRTHDAYS,'utf8')),actual=hooks.birthdayRecords([...privateRows,...privateRows]);assert.equal(actual.length,67);assert.equal(actual.filter(x=>x.year===null).length,13);for(const scope of ['upcoming','recent']){const timeline=hooks.birthdayTimeline(actual,scope,'2026-11-02');assert.ok(timeline.every((x,i)=>!i||x.days>=timeline[i-1].days));assert.equal(timeline.filter(x=>x.age===null).length,13);}console.log('PASS: private read-only sample: 67 unique birthdays; 54 ages and 13 unknown years.');}
 if(process.env.ARC_PRIVATE_PERSONAS_PLAN){const plan=JSON.parse(fs.readFileSync(process.env.ARC_PRIVATE_PERSONAS_PLAN,'utf8')),persons=plan.records.map(r=>Object.fromEntries(plan.headers.map((h,i)=>[h,r.values[i]]))),source=plan.sourceSnapshot.birthdays.values,legacy=source.slice(1).map(r=>Object.fromEntries(source[0].map((h,i)=>[h,r[i]??null]))),all=hooks.birthdayRecords([...legacy,...legacy],persons);assert.equal(all.length,69);assert.equal(all.filter(x=>x.year===null).length,13);assert.equal(persons.length,74);assert.equal(hooks.personName(persons.find(p=>p.ID==='PER-0001')),'Aku');assert.ok(!all.some(x=>x.personId==='PER-0008'));assert.equal(all.find(x=>x.personId==='PER-0074').month,12);assert.equal(persons.filter(p=>p['Nombre completo']).length,19);for(const r of plan.records){const p=persons.find(x=>x.ID===r.id);assert.equal(p['Notas / contexto'],r.old[5]);assert.equal(p['Temas abiertos'],r.old[6]);}console.log('PASS: 74 private identities, 68 birthdays in Personas + historical self record, 13 unknown years, 19 supported full names and all original notes/topics preserved.');}
 console.log('PASS: birthday ordering, year boundary, ages, unknown/conflicting years, leap days, DST, deduplication, identity, inactive people, three tabs and default on reentry.');
})().catch(error=>{console.error(error);process.exit(1)});
