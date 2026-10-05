const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const elements=new Map(),events={};
function element(id){if(!elements.has(id))elements.set(id,{id,textContent:'',innerHTML:'',value:'',dataset:{},hidden:false,addEventListener(){},focus(){},setAttribute(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(id);}
let hooks;
const browser={document:{getElementById:element,querySelectorAll:()=>[],addEventListener:(t,cb)=>events[t]=cb,activeElement:null,title:''},console,Intl,Date,URL,setTimeout:()=>1,clearTimeout(){},setInterval(){},localStorage:{getItem:()=>null,setItem(){}},navigator:{},window:null};
browser.window={addEventListener(){},scrollTo(){},__ARC_TEST_HOOK__:h=>hooks=h};
vm.createContext(browser);vm.runInContext(fs.readFileSync(root+'/tests/fixtures/preview-data.js','utf8'),browser);vm.runInContext(fs.readFileSync(root+'/dist/app.js','utf8'),browser);
assert.ok(element('main').innerHTML.includes('Que no se te escape.'));
assert.ok(element('connection-strip').innerHTML.includes('Vista previa'));
assert.ok(element('main').innerHTML.includes('Copiar para ChatGPT'));
assert.equal(hooks.dateISO(46271),'2026-09-06');assert.equal(hooks.dateISO('24/08/2026'),'2026-08-24');
assert.equal(hooks.fold('ÁNGELA'),'angela');assert.equal(hooks.esc('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
const task={ID:'T1',Estado:'Pendiente','Contexto ejecución':'Móvil','Tiempo estimado (min)':5,Concentración:'Baja'};
assert.ok(hooks.matchesTask(task,{context:'Móvil',minutes:'5',energy:'Baja',unknown:false}));
assert.ok(!hooks.matchesTask(task,{context:'Presencial',minutes:'5',energy:'Baja',unknown:false}));
assert.ok(!hooks.matchesTask({...task,'Tiempo estimado (min)':null},{minutes:'5',unknown:false}));
assert.ok(hooks.matchesTask({...task,'Tiempo estimado (min)':null},{minutes:'5',unknown:true}));
assert.ok(!hooks.openTask({...task,'Fecha completada':46271}));assert.ok(!hooks.openTask({...task,Estado:'Cancelado'}));
const unsorted=[{ID:'A','Fecha creación':null,'Orden manual':3},{ID:'B','Fecha creación':46299,'Orden manual':2},{ID:'C','Fecha creación':46300,'Orden manual':1}];
const incomingOrder=[{ID:'I1','Fecha captura':46300.5,'Orden manual':2},{ID:'I2','Fecha captura':46300.6,'Orden manual':1}];
assert.equal(hooks.sortedIncoming(incomingOrder,'newest').map(r=>r.ID).join(','),'I2,I1');assert.equal(hooks.sortedIncoming(incomingOrder,'oldest').map(r=>r.ID).join(','),'I1,I2');assert.equal(hooks.sortedIncoming(incomingOrder,'manual').map(r=>r.ID).join(','),'I2,I1');assert.equal(incomingOrder[0].ID,'I1');
assert.equal(hooks.sortedTasks(unsorted,'newest').map(t=>t.ID).join(','),'C,B,A');assert.equal(hooks.sortedTasks(unsorted,'oldest').map(t=>t.ID).join(','),'B,C,A');assert.equal(hooks.sortedTasks(unsorted,'manual').map(t=>t.ID).join(','),'C,B,A');assert.equal(unsorted[0].ID,'A');
assert.ok(hooks.reviewBadge({'Última edición por':'Arc','Revisado por':'Sistema','Huella revisada':'old',_reviewFingerprint:'new'}).includes('pendiente'));assert.ok(hooks.reviewBadge({'Última edición por':'Arc','Revisado por':'Sistema','Huella revisada':'same',_reviewFingerprint:'same'}).includes('Revisado por Sistema'));
for(const view of ['tareas','proyectos','personas','memoria','incoming','modulos','mas','buscar','conexion']){
 events.click({target:{closest:()=>({dataset:{view}})}});assert.ok(element('main').innerHTML.length>100,view);
}
// Apps Script runtime mock: tests the complete capture operation, not just helpers.
const incomingHeaders=['ID','Fecha captura','Origen','Texto original','Referencias','Estado','Destinos / recibos','Fecha procesado','Última actualización','Notas'];
const moduleHeaders=['Módulo ID','Dominio','Backend canónico','Tipo','Drive file ID','URL','Qué guarda','Estado','Versión esquema','Regla de enrutado'];
const core='synthetic-core-id';
const values={Sistema:[['Clave','Valor','Notas'],['schema_version',5],['capture_mode','incoming_then_consolidation'],['incoming_status','activo'],['module_registry','Módulos'],['module_core_id','MOD-CORE'],['source_incoming','Incoming'],['incoming_table','IncomingPersonal'],['schema_columns:Incoming',JSON.stringify(incomingHeaders)],['schema_columns:Módulos',JSON.stringify(moduleHeaders)]],Módulos:[moduleHeaders,['MOD-CORE','General','Personal','Google Sheets',core,'https://docs.google.com','Núcleo','Activo',4,'Reglas']],Incoming:[incomingHeaders,['INC-0001',46271,'Test','Existing','','Procesado','','','','Original']]};
let tableEnd=2,appends=0,tableFailures=0,owner='owner@example.invalid',active=owner,effective=owner,locked=false,lastAppend;
function sheet(name){return {getName:()=>name,getSheetId:()=>name==='Incoming'?42:9,getLastRow:()=>values[name].length,getRange:(r,c,h,w)=>({getValues:()=>Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>values[name][r-1+i]?.[c-1+j]??''))})};}
const book={getSheetByName:n=>values[n]?sheet(n):null,getSpreadsheetTimeZone:()=> 'Europe/Madrid',getName:()=> 'Test',getUrl:()=> 'https://docs.google.com/spreadsheets/d/'+core+'/edit'};
const server={console,Date,JSON,Object,Number,String,Math,Session:{getActiveUser:()=>({getEmail:()=>active}),getEffectiveUser:()=>({getEmail:()=>effective})},PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='HUB_CORE_ID'?core:owner,setProperty:(k,v)=>owner=v})},SpreadsheetApp:{openById:id=>{assert.equal(id,core);return book},flush(){}},Utilities:{formatDate:()=> '2026-09-06T19:00:00'},LockService:{getScriptLock:()=>({tryLock(){if(locked)return false;locked=true;return true},releaseLock(){locked=false}})},Sheets:{Spreadsheets:{get(id,options){if(options.includeGridData)return {sheets:[{data:[{rowData:[{values:incomingHeaders.map(()=>({userEnteredFormat:{wrapStrategy:'WRAP'}}))}]}]}]};return {sheets:[{properties:{sheetId:42},tables:[{name:'IncomingPersonal',tableId:'table',range:{sheetId:42,startRowIndex:0,endRowIndex:tableEnd,startColumnIndex:0,endColumnIndex:10}}]}]};},batchUpdate(payload){for(const r of payload.requests){if(r.appendCells){assert.ok(!r.appendCells.rows[0].values[3].userEnteredValue.formulaValue);lastAppend=r.appendCells;appends++;values.Incoming.push(r.appendCells.rows[0].values.map(c=>c.userEnteredValue?.stringValue??c.userEnteredValue?.numberValue??''));}if(r.updateTable){if(tableFailures-->0)throw Error('Transient table update');tableEnd=r.updateTable.table.range.endRowIndex;}}}}}};
// Current canonical routes/headers, read from Sistema on 2026-10-05.
values.Sistema=[['Clave','Valor','Notas'],...JSON.parse(fs.readFileSync(root+'/tests/fixtures/schema5.json','utf8'))];
const contract=Object.fromEntries(values.Sistema.slice(1));
for(const [key,name] of Object.entries(contract))if(key.startsWith('source_')&&!values[name])values[name]=[JSON.parse(contract['schema_columns:'+name])];
vm.createContext(server);vm.runInContext(fs.readFileSync(root+'/google/Code.gs','utf8'),server);
const call=(name,args)=>server[name](args);
const schemaRow=values.Sistema.find(r=>r[0]==='schema_version');
schemaRow[1]='4';assert.throws(()=>call('getHubData'),/esquema/);assert.equal(appends,0);
schemaRow[1]='5';const current=call('getHubData');assert.ok(Array.isArray(current.tasks));assert.ok(Array.isArray(current.history));assert.ok(Array.isArray(current.incoming));
schemaRow[1]='7';assert.throws(()=>call('captureIncoming',{text:'Do not write',requestId:'request-future-01'}),/esquema/);assert.equal(appends,0);schemaRow[1]='5';
const firstHeader=values.Incoming[0][0];values.Incoming[0][0]='Unexpected header';assert.throws(()=>call('captureIncoming',{text:'Do not write',requestId:'request-header-01'}),/columnas/);assert.equal(appends,0);values.Incoming[0][0]=firstHeader;
active='other@example.invalid';assert.throws(()=>call('captureIncoming',{text:'x',requestId:'1234567890'}),/Acceso privado/);active=owner;
assert.throws(()=>call('captureIncoming',{text:'   ',requestId:'1234567890'}),/caracteres/);
assert.throws(()=>call('captureIncoming',{text:'x',requestId:'bad'}),/inválido/);
let receipt=call('captureIncoming',{text:'=literal, never a formula',requestId:'request-00000001'});
assert.equal(receipt.id,'INC-0002');assert.equal(receipt.verified,true);assert.equal(appends,1);assert.equal(tableEnd,3);assert.equal(lastAppend.rows[0].values[3].userEnteredValue.stringValue,'=literal, never a formula');
receipt=call('captureIncoming',{text:'=literal, never a formula',requestId:'request-00000001'});assert.equal(appends,1);assert.ok(receipt.verified);
assert.throws(()=>call('captureIncoming',{text:'changed',requestId:'request-00000001'}),/otro texto/);assert.equal(appends,1);
tableFailures=1;assert.throws(()=>call('captureIncoming',{text:'Keep me after a partial failure',requestId:'request-00000002'}),/Transient/);assert.equal(appends,2);assert.equal(locked,false);
receipt=call('captureIncoming',{text:'Keep me after a partial failure',requestId:'request-00000002'});assert.equal(receipt.verified,true);assert.equal(appends,2);assert.equal(tableEnd,4);
const duplicate=[...values.Incoming[2]];duplicate[9]='External writer duplicate';values.Incoming.push(duplicate);assert.throws(()=>call('captureIncoming',{text:'=literal, never a formula',requestId:'request-00000001'}),/registro único/);
console.log('PASS: preview routes, honest capture state, task filters, completed exclusion, escaping, private auth, literal strings, idempotent retry, partial failure recovery and native table coverage. Google execution not tested.');
