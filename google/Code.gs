/**
 * ARC personal hub — Google Apps Script, one owner, one deployment.
 * Keep this file in the script bound to PERSONAL - Datos operativos.
 * Capture and explicit task edits write operational data. Reviews require a
 * real system review; this app never claims an automatic AI review.
 */
const HUB_CORE_ID = PropertiesService.getScriptProperties().getProperty('HUB_CORE_ID');
const HUB_RELEASE = '0.2.0';

function setupHub() {
  const who = Session.getEffectiveUser().getEmail();
  const active = Session.getActiveUser().getEmail();
  if (!who || !active || who.toLowerCase() !== active.toLowerCase()) throw new Error('No se puede identificar tu cuenta de Google.');
  const properties = PropertiesService.getScriptProperties();
  const previous = properties.getProperty('HUB_OWNER_EMAIL');
  if (previous && previous.toLowerCase() !== who.toLowerCase()) throw new Error('El script ya pertenece a otra cuenta.');
  const book = SpreadsheetApp.openById(HUB_CORE_ID);
  const system = readSystem_(book);
  checkCore_(book, system);
  properties.setProperty('HUB_OWNER_EMAIL', who.toLowerCase());
  return {ready: true, version: HUB_RELEASE, spreadsheet: book.getName(), captureMode: system.capture_mode, incomingStatus: system.incoming_status, writesPerformed: false};
}

function assertOwner_() {
  const owner = PropertiesService.getScriptProperties().getProperty('HUB_OWNER_EMAIL');
  const active = Session.getActiveUser().getEmail();
  const effective = Session.getEffectiveUser().getEmail();
  if (!owner || !active || !effective || active.toLowerCase() !== owner || effective.toLowerCase() !== owner) {
    throw new Error('Acceso privado: entra con la cuenta que configuró este HUB. Ejecuta setupHub desde el editor si aún no lo has hecho.');
  }
}

function doGet() {
  assertOwner_();
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('ARC · Hub personal').addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function readSystem_(book) {
  const sheet = book.getSheetByName('Sistema');
  if (!sheet) throw new Error('No se encuentra Sistema. No se ha creado otro backend.');
  const result = {};
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(),1), 3).getValues().slice(1).forEach(r => {if(r[0])result[String(r[0])]=r[1];});
  return result;
}

function checkCore_(book, system) {
  if (!['5','6'].includes(String(system.schema_version))) throw new Error('El esquema del sistema ha cambiado. Este HUB admite los esquemas 5 y 6; revisa su compatibilidad antes de leer o escribir.');
  if (system.capture_mode !== 'incoming_then_consolidation' || system.incoming_status !== 'activo') throw new Error('La captura mediante Incoming no está activa en el contrato.');
  const modules = readRows_(book, String(system.module_registry || 'Módulos'), system, 'Módulos');
  const core = modules.find(r => r['Módulo ID'] === system.module_core_id);
  if (!core || core['Drive file ID'] !== HUB_CORE_ID || core.Estado !== 'Activo') throw new Error('Módulos no identifica este archivo como núcleo activo.');
  return modules;
}

function cellJSON_(v, tz) {
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return (Date.parse(Utilities.formatDate(v,tz,"yyyy-MM-dd'T'HH:mm:ss")+'Z')-Date.UTC(1899,11,30))/86400000;
  }
  return v === '' ? null : v;
}

function readRows_(book, name, system, schemaName) {
  const sheet = book.getSheetByName(name);
  if (!sheet) throw new Error('No se encuentra la fuente '+name+'.');
  let expected;
  try {expected = JSON.parse(system['schema_columns:'+(schemaName||name)]);} catch(e) {throw new Error('Falta el contrato de columnas de '+name+'.');}
  const headers = sheet.getRange(1,1,1,expected.length).getValues()[0];
  if (JSON.stringify(headers) !== JSON.stringify(expected)) throw new Error('Las columnas de '+name+' han cambiado. No se ha escrito nada.');
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const values = sheet.getRange(2,1,last-1,headers.length).getValues();
  const tz = book.getSpreadsheetTimeZone();
  return values.filter(r => r.some(v => v !== '')).map(r => Object.fromEntries(headers.map((h,i)=>[h,cellJSON_(r[i],tz)])));
}

function getHubData() {
  assertOwner_();
  const book = SpreadsheetApp.openById(HUB_CORE_ID), system = readSystem_(book), modules = checkCore_(book,system);
  const sources = {tasks:system.source_tasks_active, projects:system.source_projects, people:system.source_people, incoming:system.source_incoming, history:system.source_register, recommendations:system.source_recommendations, criteria:system.source_personal_criteria, ideas:system.source_ideas, dates:system.source_dates, summary:system.source_summary};
  const result = {mode:'live',version:HUB_RELEASE,fetchedAt:new Date().toISOString(),timezone:book.getSpreadsheetTimeZone(),sheetUrl:book.getUrl(),tabs:{},modules};
  result.tabs.modules=book.getSheetByName(String(system.module_registry)).getSheetId();
  Object.keys(sources).forEach(role=>{
    const name=String(sources[role]||'');
    if(!name)throw new Error('Falta la ruta de '+role+'.');
    result[role]=readRows_(book,name,system);
    result.tabs[role]=book.getSheetByName(name).getSheetId();
  });
  result.incoming=result.incoming.filter(r=>['Pendiente','En proceso','Revisar'].includes(r.Estado));
  result.taskEditing=String(system.schema_version)==='6' && system.task_edit_status==='activo';
  if(result.taskEditing){
    result.archivedTasks=readRows_(book,String(system.source_tasks_archived),system);
    result.tabs.archivedTasks=book.getSheetByName(String(system.source_tasks_archived)).getSheetId();
    result.taskOptions=taskOptions_(book,system);
    [...result.tasks,...result.archivedTasks].forEach(t=>{t._version=taskVersion_(t);t._reviewFingerprint=taskFingerprint_(t);});
  }
  return result;
}

function captureIncoming(payload) {
  assertOwner_();
  const valid = validateCapture_(payload);
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(10000))throw new Error('Hay otra captura en curso. Tu borrador se conserva; vuelve a intentarlo.');
  try {
    const book=SpreadsheetApp.openById(HUB_CORE_ID),system=readSystem_(book);
    checkCore_(book,system);
    const sheet=book.getSheetByName(String(system.source_incoming));
    const rows=readRows_(book,sheet.getName(),system);
    const marker='[HUB request:'+valid.requestId+']';
    const previous=findReceipt_(rows,marker,valid.text);
    if(previous)return verifyReceipt_(book,sheet,system,previous.ID,marker,valid.text);
    const numericIds=rows.map(r=>/^INC-(\d+)$/.exec(String(r.ID||''))).filter(Boolean).map(m=>Number(m[1]));
    const next=Math.max(0,...numericIds)+1;
    if(!Number.isSafeInteger(next))throw new Error('No se puede asignar un ID seguro.');
    const id='INC-'+String(next).padStart(4,'0');
    if(rows.some(r=>r.ID===id))throw new Error('El ID ya existe; revisa Incoming.');
    const serial=cellJSON_(new Date(),book.getSpreadsheetTimeZone());
    const cells=[id,serial,'HUB personal · captura',valid.text,'','Pendiente','',null,serial,marker+' Captura ordinaria desde el HUB; pendiente de consolidación.'];
    // Append atomically, never overwrite a precomputed row number. Copy only
    // formatting and validation metadata from the inspected exemplar.
    const exemplar=Sheets.Spreadsheets.get(HUB_CORE_ID,{ranges:[quoteSheet_(sheet.getName())+'!A2:J2'],includeGridData:true,fields:'sheets(data(rowData(values(userEnteredFormat,dataValidation))))'});
    const sample=((((exemplar.sheets||[])[0]||{}).data||[])[0]||{}).rowData||[];
    const template=(sample[0]||{}).values||[];
    const nativeCells=cells.map((v,i)=>{
      const target={};
      if(template[i]&&template[i].userEnteredFormat)target.userEnteredFormat=template[i].userEnteredFormat;
      if(template[i]&&template[i].dataValidation)target.dataValidation=template[i].dataValidation;
      if(v!==null)target.userEnteredValue=typeof v==='number'?{numberValue:v}:{stringValue:String(v)};
      return target;
    });
    Sheets.Spreadsheets.batchUpdate({requests:[{appendCells:{sheetId:sheet.getSheetId(),rows:[{values:nativeCells}],fields:'userEnteredValue,userEnteredFormat,dataValidation'}}]},HUB_CORE_ID);
    SpreadsheetApp.flush();
    return verifyReceipt_(book,sheet,system,id,marker,valid.text);
  } finally {lock.releaseLock();}
}

function validateCapture_(payload) {
  if(!payload||typeof payload.text!=='string'||!payload.text.trim()||payload.text.length>12000)throw new Error('La entrada debe contener entre 1 y 12.000 caracteres.');
  if(typeof payload.requestId!=='string'||!/^[A-Za-z0-9-]{10,100}$/.test(payload.requestId))throw new Error('Identificador de captura inválido.');
  return {text:payload.text,requestId:payload.requestId};
}

function findReceipt_(rows,marker,text) {
  const found=rows.filter(r=>String(r.Notas||'').includes(marker));
  if(found.length>1)throw new Error('La captura tiene más de un recibo. Revisa Incoming antes de repetir.');
  if(found.length&&found[0]['Texto original']!==text)throw new Error('Ese borrador ya se envió con otro texto. Comprueba el registro antes de cambiarlo.');
  return found[0]||null;
}

function verifyReceipt_(book,sheet,system,id,marker,text) {
  const rows=readRows_(book,sheet.getName(),system), matching=rows.filter(r=>r.ID===id), receipt=findReceipt_(rows,marker,text);
  if(matching.length!==1||!receipt||receipt.ID!==id||matching[0]['Texto original']!==text)throw new Error('El guardado requiere revisión en Incoming. Conserva el borrador: no se ha confirmado un registro único.');
  // Locate the actual row after append and expand the existing native table.
  const idValues=sheet.getRange(1,1,Math.max(1,sheet.getLastRow()),1).getValues();
  const row=idValues.findIndex(r=>r[0]===id)+1;
  if(row<2)throw new Error('No se ha encontrado la fila de la captura.');
  const metadata=Sheets.Spreadsheets.get(HUB_CORE_ID,{fields:'sheets(properties(sheetId),tables(tableId,name,range))'});
  const nativeSheet=(metadata.sheets||[]).find(s=>s.properties.sheetId===sheet.getSheetId());
  const table=((nativeSheet||{}).tables||[]).find(t=>t.name===system.incoming_table);
  if(!table)throw new Error('La captura está escrita, pero falta la tabla canónica Incoming. Revisa el sistema antes de repetir.');
  if((table.range.endRowIndex||0)<row){
    const range=Object.assign({},table.range,{endRowIndex:row});
    Sheets.Spreadsheets.batchUpdate({requests:[{updateTable:{table:{tableId:table.tableId,range},fields:'range'}}]},HUB_CORE_ID);
    const finalMeta=Sheets.Spreadsheets.get(HUB_CORE_ID,{fields:'sheets(properties(sheetId),tables(tableId,range))'});
    const finalTable=(finalMeta.sheets.find(s=>s.properties.sheetId===sheet.getSheetId()).tables||[]).find(t=>t.tableId===table.tableId);
    if(!finalTable||finalTable.range.endRowIndex<row)throw new Error('La fila está guardada; falta verificar la cobertura de la tabla. Reintenta con el mismo borrador.');
  }
  return {id,verified:true,state:matching[0].Estado,source:book.getUrl()+'#gid='+sheet.getSheetId()+'&range=A'+row+':J'+row};
}

function quoteSheet_(name) {return "'"+String(name).replace(/'/g,"''")+"'";}
/* Explicit owner edits. Every change has an atomic, durable audit receipt.
 * Sheet columns are resolved by name; IDs, formulas and review stamps are protected.
 */
const TASK_REVIEW_FIELDS = ['Revisado por','Fecha revisión','Huella revisada','Feedback revisión'];
const TASK_EDIT_FIELDS = ['Tarea','Área','Tipo','Responsable','Delegable','Seguimiento por','Próximo seguimiento','Personas relacionadas','Contexto ejecución','Concentración','Tiempo estimado (min)','Prioridad','Estado','Fecha objetivo','Origen','Contexto / notas','Fecha completada','Proyecto ID','Cierre / resultado'];
const TASK_DATE_FIELDS = ['Próximo seguimiento','Fecha objetivo','Fecha completada'];

function taskHash_(value){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(value),Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');}
function taskSnapshot_(t,review){return Object.keys(t).filter(k=>!k.startsWith('_')&&k!=='Fecha cierre'&&k!=='Cierre / resultado'&&(review||!TASK_REVIEW_FIELDS.includes(k))).sort().map(k=>[k,t[k]===undefined?null:t[k]]);}
function taskVersion_(t){return taskHash_([taskSnapshot_(t,true),t['Fecha cierre']||null,t['Cierre / resultado']||null]);}
function taskFingerprint_(t){return taskHash_(taskSnapshot_(t,false));}
function taskOptions_(book,system){
  const catalog=readRows_(book,String(system.source_catalogs||'Catálogos'),system);
  const values=key=>catalog.filter(r=>r.Catálogo===key&&r.Activo!==false&&r.Activo!=='FALSE').map(r=>r.Valor);
  return {Estado:values('Estado tarea'),Prioridad:values('Prioridad tarea'),'Contexto ejecución':values('Contexto ejecución'),Concentración:values('Concentración')};
}
function taskContext_(){
  const book=SpreadsheetApp.openById(HUB_CORE_ID),system=readSystem_(book);checkCore_(book,system);
  if(String(system.schema_version)!=='6'||system.task_edit_status!=='activo')throw new Error('La edición de tareas aún no está activa en el contrato.');
  const active=book.getSheetByName(String(system.source_tasks_active)),archived=book.getSheetByName(String(system.source_tasks_archived)),audit=book.getSheetByName(String(system.source_task_changes));
  const all=[...readRows_(book,active.getName(),system).map(t=>({task:t,sheet:active})),...readRows_(book,archived.getName(),system).map(t=>({task:t,sheet:archived}))];
  readRows_(book,audit.getName(),system); // Reject an unexpected audit layout before any write.
  return {book,system,active,archived,audit,all,options:taskOptions_(book,system)};
}
function taskFind_(ctx,id){const hits=ctx.all.filter(r=>r.task.ID===id);if(hits.length!==1)throw new Error('La tarea no tiene una ubicación única. Revisa la fuente antes de editar.');return hits[0];}
function taskRow_(sheet,id){const hits=sheet.getRange(1,1,sheet.getLastRow(),1).getValues().map((r,i)=>r[0]===id?i+1:0).filter(Boolean);if(hits.length!==1)throw new Error('No hay una fila única para '+id+'.');return hits[0];}
function taskHeaders_(ctx,sheet){return JSON.parse(ctx.system['schema_columns:'+sheet.getName()]);}
function taskNativeRow_(ctx,sheet,row){
  const headers=taskHeaders_(ctx,sheet),column=n=>{let s='';for(;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
  const result=Sheets.Spreadsheets.get(HUB_CORE_ID,{ranges:[quoteSheet_(sheet.getName())+'!A'+row+':'+column(headers.length)+row],includeGridData:true,fields:'sheets(data(rowData(values(userEnteredValue,userEnteredFormat,dataValidation,chipRuns))))'});
  return (((result.sheets[0].data||[])[0].rowData||[])[0]||{}).values||[];
}
function taskCell_(v){if(v===null||v==='')return {};return {userEnteredValue:typeof v==='number'?{numberValue:v}:typeof v==='boolean'?{boolValue:v}:{stringValue:String(v)}};}
function taskChanges_(ctx,record,patch){
  const headers=taskHeaders_(ctx,record.sheet),row=taskRow_(record.sheet,record.task.ID),native=taskNativeRow_(ctx,record.sheet,row);
  return Object.keys(patch).filter(k=>JSON.stringify(record.task[k]??null)!==JSON.stringify(patch[k]??null)).map(k=>{
    const col=headers.indexOf(k);if(col<0)throw new Error('La fuente no contiene '+k+'.');
    if(native[col]?.userEnteredValue?.formulaValue||native[col]?.chipRuns?.length)throw new Error('El campo '+k+' contiene una fórmula o chip. Edítalo en su fuente nativa.');
    const condition=native[col]?.dataValidation?.condition;
    if(patch[k]!==null&&condition?.type==='ONE_OF_LIST'&&typeof patch[k]!=='boolean'&&!condition.values.some(v=>v.userEnteredValue===String(patch[k])))throw new Error('El valor de '+k+' no pertenece a su validación actual.');
    return {updateCells:{start:{sheetId:record.sheet.getSheetId(),rowIndex:row-1,columnIndex:col},rows:[{values:[taskCell_(patch[k])]}],fields:'userEnteredValue'}};
  });
}
function taskRequest_(p){if(!p||typeof p.requestId!=='string'||!/^[A-Za-z0-9-]{10,100}$/.test(p.requestId))throw new Error('Identificador de cambio inválido.');return taskHash_(p);}
function taskAudit_(ctx,p,signature,action,before,after){
  const values=[p.requestId,p.id||'*',cellJSON_(new Date(),ctx.book.getSpreadsheetTimeZone()),'Arc',action,signature,JSON.stringify(before),JSON.stringify(after)];
  if(values.some(v=>String(v).length>49000))throw new Error('El cambio es demasiado grande para su recibo. Divide la operación.');
  return {appendCells:{sheetId:ctx.audit.getSheetId(),rows:[{values:values.map(taskCell_)}],fields:'userEnteredValue'}};
}
function taskPrevious_(ctx,p,signature){
  const rows=readRows_(ctx.book,ctx.audit.getName(),ctx.system).filter(r=>r['Request ID']===p.requestId);
  if(rows.length>1)throw new Error('El cambio tiene más de un recibo. Revisa el historial.');
  if(!rows.length)return null;if(rows[0].Solicitud!==signature)throw new Error('El cambio ya se envió con otro contenido. Reabre la ficha antes de guardar de nuevo.');
  return rows[0];
}
function taskDate_(v){
  if(v===null||v==='')return null;if(typeof v==='number'&&Number.isFinite(v)&&v>=1&&v<=2958465)return Math.floor(v);
  if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))throw new Error('Fecha inválida. Usa el selector de fecha.');
  const millis=Date.parse(v+'T00:00:00Z');if(!Number.isFinite(millis)||new Date(millis).toISOString().slice(0,10)!==v)throw new Error('La fecha no existe.');
  return (millis-Date.UTC(1899,11,30))/86400000;
}
function taskValidate_(ctx,record,fields){
  if(!fields||typeof fields!=='object'||Array.isArray(fields))throw new Error('Faltan los cambios de la tarea.');
  const patch={};Object.keys(fields).forEach(k=>{
    if(!TASK_EDIT_FIELDS.includes(k)||k==='Cierre / resultado'&&record.sheet===ctx.active)throw new Error('No se puede editar '+k+' desde esta ficha.');
    let v=fields[k];if(v==='')v=null;
    if(TASK_DATE_FIELDS.includes(k))v=taskDate_(v);
    else if(k==='Delegable'){if(v!==null&&typeof v!=='boolean')throw new Error('Delegable debe ser sí, no o vacío.');}
    else if(k==='Tiempo estimado (min)'){if(v!==null&&(typeof v!=='number'||!Number.isFinite(v)||v<0||v>100000))throw new Error('Tiempo estimado inválido.');}
    else if(v!==null&&(typeof v!=='string'||v.length>12000))throw new Error('Texto inválido en '+k+'.');
    if(ctx.options[k]?.length&&v!==null&&v!==record.task[k]&&!ctx.options[k].includes(v))throw new Error('Valor no permitido en '+k+'.');
    patch[k]=v;
  });
  const next=Object.assign({},record.task,patch);
  if(typeof next.Tarea!=='string'||!next.Tarea.trim())throw new Error('La tarea necesita un nombre.');
  if('Proyecto ID' in patch){const projects=readRows_(ctx.book,String(ctx.system.source_projects),ctx.system),hits=projects.filter(p=>p.ID===patch['Proyecto ID']);if(patch['Proyecto ID']&&hits.length!==1)throw new Error('El proyecto no tiene una identidad única.');patch.Proyecto=hits[0]?.Nombre||null;}
  const closed=['Completado','Cancelado'].includes(next.Estado);
  if('Estado' in patch&&!closed&&record.sheet===ctx.archived)patch['Fecha completada']=null;
  if(closed&&!next['Fecha completada'])patch['Fecha completada']=Math.floor(cellJSON_(new Date(),ctx.book.getSpreadsheetTimeZone()));
  if(!closed&&next['Fecha completada']&&!('Estado' in patch))patch.Estado='Completado';
  if('Estado' in patch&&!closed&&record.sheet===ctx.active&&next['Fecha completada'])throw new Error('Una tarea abierta debe tener la fecha de finalización vacía.');
  return patch;
}
function taskRelocate_(ctx,id){
  // Copy the entire native row by header, verify the copy, then remove the source.
  const hits=ctx.all.filter(r=>r.task.ID===id);if(!hits.length||hits.length>2)throw new Error('Ubicación inesperada al mover la tarea.');
  const example=hits[0].task,closed=!!example['Fecha completada']||['Completado','Cancelado'].includes(example.Estado),dest=closed?ctx.archived:ctx.active;
  let source=hits.find(r=>r.sheet!==dest),target=hits.find(r=>r.sheet===dest);
  if(!source)return taskFind_(ctx,id).task;
  if(target&&taskFingerprint_(target.task)!==taskFingerprint_(source.task))throw new Error('Hay dos versiones distintas de la tarea. Se conservan ambas para revisar.');
  if(!target){
    const headers=taskHeaders_(ctx,source.sheet),native=taskNativeRow_(ctx,source.sheet,taskRow_(source.sheet,id)),targetHeaders=taskHeaders_(ctx,dest);
    const values=targetHeaders.map(k=>headers.includes(k)?native[headers.indexOf(k)]||{}:k==='Fecha cierre'?Object.assign(taskCell_(source.task['Fecha completada']||Math.floor(cellJSON_(new Date(),ctx.book.getSpreadsheetTimeZone()))),{userEnteredFormat:{numberFormat:{type:'DATE',pattern:'yyyy-mm-dd'}}}):taskCell_(null));
    Sheets.Spreadsheets.batchUpdate({requests:[{appendCells:{sheetId:dest.getSheetId(),rows:[{values}],fields:'userEnteredValue,userEnteredFormat,dataValidation,chipRuns'}}]},HUB_CORE_ID);SpreadsheetApp.flush();
    const rows=readRows_(ctx.book,dest.getName(),ctx.system).filter(r=>r.ID===id);if(rows.length!==1||taskFingerprint_(rows[0])!==taskFingerprint_(source.task))throw new Error('No se ha verificado la copia. La tarea original se conserva.');
    target={task:rows[0],sheet:dest};
  }
  // A new read rejects an external change made while the copy was being verified.
  const current=readRows_(ctx.book,source.sheet.getName(),ctx.system).filter(r=>r.ID===id);
  if(current.length!==1||taskVersion_(current[0])!==taskVersion_(source.task))throw new Error('La tarea cambió durante el traslado. Se conservan ambas filas para revisar.');
  const row=taskRow_(source.sheet,id);Sheets.Spreadsheets.batchUpdate({requests:[{deleteDimension:{range:{sheetId:source.sheet.getSheetId(),dimension:'ROWS',startIndex:row-1,endIndex:row}}}]},HUB_CORE_ID);SpreadsheetApp.flush();
  return target.task;
}
function updateTask(payload){
  assertOwner_();const signature=taskRequest_(payload),lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw new Error('Hay otro cambio en curso. Conserva la ficha y reintenta.');
  try{
    let ctx=taskContext_(),previous=taskPrevious_(ctx,payload,signature);
    if(previous){
      const after=JSON.parse(previous.Después),hits=ctx.all.filter(r=>r.task.ID===payload.id);
      if(hits.length&&hits.every(r=>taskFingerprint_(r.task)===taskFingerprint_(after)))taskRelocate_(ctx,payload.id);
      return {id:payload.id,verified:true,replayed:true};
    }
    const record=taskFind_(ctx,payload.id);if(typeof payload.expectedVersion!=='string'||taskVersion_(record.task)!==payload.expectedVersion)throw new Error('La tarea cambió desde que abriste la ficha. Tus cambios siguen en el formulario; compáralos con la fuente y reabre la tarea.');
    const patch=taskValidate_(ctx,record,payload.fields);
    if(!Object.keys(patch).some(k=>JSON.stringify(patch[k])!==JSON.stringify(record.task[k]??null)))return {id:payload.id,verified:true,unchanged:true};
    patch['Última edición por']='Arc';patch['Última actualización']=cellJSON_(new Date(),ctx.book.getSpreadsheetTimeZone());
    const after=Object.assign({},record.task,patch),requests=taskChanges_(ctx,record,patch);requests.push(taskAudit_(ctx,payload,signature,'Editar tarea',record.task,after));
    const prewrite=taskContext_();if(taskVersion_(taskFind_(prewrite,payload.id).task)!==payload.expectedVersion)throw new Error('La tarea cambió mientras se preparaba el guardado. Conserva la ficha y compara la fuente.');
    Sheets.Spreadsheets.batchUpdate({requests},HUB_CORE_ID);SpreadsheetApp.flush();
    ctx=taskContext_();const saved=taskFind_(ctx,payload.id).task;
    if(taskVersion_(saved)!==taskVersion_(after)||!taskPrevious_(ctx,payload,signature))throw new Error('No se ha verificado el cambio. Conserva la ficha y reintenta con el mismo contenido.');
    const finalTask=taskRelocate_(ctx,payload.id),finalCtx=taskContext_();taskFind_(finalCtx,payload.id);
    return {id:payload.id,verified:true,archived:!!finalTask['Fecha completada']||['Completado','Cancelado'].includes(finalTask.Estado)};
  }finally{lock.releaseLock();}
}
function reorderTasks(payload){
  assertOwner_();const signature=taskRequest_(payload),lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw new Error('Hay otro cambio en curso. Vuelve a intentarlo.');
  try{
    const ctx=taskContext_();if(taskPrevious_(ctx,payload,signature))return {verified:true,replayed:true};
    const records=ctx.all.filter(r=>r.sheet===ctx.active&&!r.task['Fecha completada']&&!['Completado','Cancelado'].includes(r.task.Estado));
    if(!Array.isArray(payload.ids)||payload.ids.length!==records.length||new Set(payload.ids).size!==records.length||!payload.ids.every(id=>records.some(r=>r.task.ID===id)))throw new Error('La lista de tareas cambió. Actualiza antes de reordenar.');
    if(!payload.versions||!records.every(r=>payload.versions[r.task.ID]===taskVersion_(r.task)))throw new Error('Alguna tarea cambió. Actualiza antes de reordenar.');
    const before=[],after=[],requests=[],stamp=cellJSON_(new Date(),ctx.book.getSpreadsheetTimeZone());
    payload.ids.forEach((id,i)=>{const record=records.find(r=>r.task.ID===id);if(record.task['Orden manual']===i+1)return;const patch={'Orden manual':i+1,'Última edición por':'Arc','Última actualización':stamp};before.push(record.task);after.push(Object.assign({},record.task,patch));requests.push(...taskChanges_(ctx,record,patch));});
    if(!requests.length)return {verified:true,unchanged:true};requests.push(taskAudit_(ctx,payload,signature,'Reordenar tareas',before,after));
    const prewrite=taskContext_(),liveRecords=prewrite.all.filter(r=>r.sheet===prewrite.active&&!r.task['Fecha completada']&&!['Completado','Cancelado'].includes(r.task.Estado));
    if(liveRecords.length!==records.length||!liveRecords.every(r=>payload.versions[r.task.ID]===taskVersion_(r.task)))throw new Error('La lista cambió mientras se preparaba el orden. Actualiza antes de reordenar.');
    Sheets.Spreadsheets.batchUpdate({requests},HUB_CORE_ID);SpreadsheetApp.flush();
    const finalCtx=taskContext_();if(!after.every(t=>taskVersion_(taskFind_(finalCtx,t.ID).task)===taskVersion_(t))||!taskPrevious_(finalCtx,payload,signature))throw new Error('No se ha verificado el orden. Reintenta la misma operación.');
    return {verified:true};
  }finally{lock.releaseLock();}
}
