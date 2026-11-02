const fs=require('node:fs'),vm=require('node:vm');
const runtime=fs.readFileSync(__dirname+'/task-edits.cjs','utf8').split('const data=()=>server.getHubData()')[0];
const checks=`
const memoryExtra=['Planificación','Estado de realización','Fecha prevista','Fin previsto','Hora prevista','Hora fin prevista','Fecha real','Fin real','Lo previsto','Lo vivido','Plan relacionado'];
const headers=[...values['Registro 2026'][0],...memoryExtra];values['Registro 2026']=[headers];values.Sistema.find(r=>r[0]==='schema_columns:Registro 2026')[1]=JSON.stringify(headers);values.Sistema.find(r=>r[0]==='schema_version')[1]='7';values.Sistema.push(['memory_status','activo'],['register_sources','Registro 2026']);
const addMemory=(ID,planning,state)=>{const t={ID,'Título':ID,Planificación:planning,'Estado de realización':state,'Fecha prevista':46343,'Lo previsto':'Original plan','Última actualización':46000};values['Registro 2026'].push(headers.map(h=>t[h]??''));};addMemory('E1','Planificado','Pendiente');addMemory('E2','No planificado','Ocurrido');
vm.runInContext(fs.readFileSync(root+'/google/Memory.gs','utf8'),server);
const data=()=>server.getHubData(),find=id=>data().history.find(t=>t.ID===id),edit=(id,fields)=>({id,fields,expectedVersion:find(id)._version,requestId:'memory-'+crypto.randomUUID()});
assert.equal(data().memoryEditing,true);assert.equal(find('E1')['Estado de realización'],'Pendiente');assert.equal(find('E2').Planificación,'No planificado');
let p=edit('E1',{'Estado de realización':'Ocurrido','Fecha real':'2026-10-04','Lo vivido':'=literal memory'});server.updateMemory(p);assert.equal(find('E1').Planificación,'Planificado');assert.equal(find('E1')['Lo previsto'],'Original plan');assert.equal(find('E1')['Lo vivido'],'=literal memory');const once=writes;server.updateMemory(p);assert.equal(writes,once);assert.throws(()=>server.updateMemory({...p,fields:{'Lo vivido':'different'}}),/otro contenido/);
assert.throws(()=>server.updateMemory(edit('E1',{'Fecha real':'2026-11-20'})),/futuro/);assert.throws(()=>server.updateMemory(edit('E1',{'Fin previsto':'2026-01-01'})),/anterior/);assert.throws(()=>server.updateMemory(edit('E1',{'Fecha real':'2026-02-30'})),/no existe/);assert.throws(()=>server.updateMemory(edit('E1',{'Hora prevista':'25:00'})),/Hora/);assert.throws(()=>server.updateMemory(edit('E1',{ID:'changed'})),/No se puede/);
assert.throws(()=>server.updateMemory(edit('E2',{'Estado de realización':'Pendiente'})),/corresponde a un plan/);assert.throws(()=>server.updateMemory(edit('E1',{'Estado de realización':'No realizado'})),/fechas reales/);
const stale=edit('E1',{'Lo vivido':'stale'});values['Registro 2026'][1][headers.indexOf('Lugar')]='Manual change';assert.throws(()=>server.updateMemory(stale),/cambió/);
server.updateMemory(edit('E2',{'Plan relacionado':'E1'}));assert.equal(find('E2')['Plan relacionado'],'E1');assert.throws(()=>server.updateMemory(edit('E1',{'Plan relacionado':'E1'})),/otro plan/);
active='other@example.invalid';assert.throws(()=>server.updateMemory(p),/Acceso privado/);active=owner;
console.log('PASS: independent planning and realization, preserved plan narrative, literal text, native dates, invalid combinations, owner gate, stale-edit protection and atomic idempotent audit.');
`;
vm.runInNewContext(runtime+checks,{require,__dirname,console,process});
