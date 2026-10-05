/**
 * ARC personal hub — Google Apps Script, one owner, one deployment.
 * Keep this file in the script bound to PERSONAL - Datos operativos.
 * Only captureIncoming writes operational data. No AI classification, task
 * completion, consolidation or background triggers are installed by this app.
 */
const HUB_CORE_ID = PropertiesService.getScriptProperties().getProperty('HUB_CORE_ID');
const HUB_RELEASE = '0.1.1';

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
  if (String(system.schema_version) !== '5') throw new Error('El esquema del sistema ha cambiado. Este HUB requiere el esquema 5; revisa su compatibilidad antes de leer o escribir.');
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
