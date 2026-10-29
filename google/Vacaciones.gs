/** Private vacation module. Resolve its separate workbook through the core registry. */
const VAC_MODULE_='MOD-VAC-OUR2026';
const VAC_HEADERS_=['ID','Plan','Tipo','Estado','Fecha inicio','Hora inicio','Fecha fin','Hora fin','Lugar','Personas','Depende de','Coste previsto (€)','Enlace','Notas','Referencias','Última actualización'];
const VAC_LOG_=['Solicitud','Fecha','Plan ID','Acción','Huella solicitud','Antes','Después'];
const VAC_STATUSES_=['Idea','Por concretar','En espera','Confirmado','Realizado','Cancelado'];
const VAC_TYPES_=['Transporte','Comida','Paseo','Alojamiento','Visita','Otro'];

function vacationContext_(){
  assertOwner_();
  const core=SpreadsheetApp.openById(HUB_CORE_ID),sys=readSystem_(core),modules=checkCore_(core,sys);
  const matches=modules.filter(m=>m['Módulo ID']===VAC_MODULE_&&m.Estado==='Activo');
  if(matches.length!==1||!matches[0]['Drive file ID'])throw new Error('No se encuentra un único módulo de vacaciones activo.');
  const book=SpreadsheetApp.openById(matches[0]['Drive file ID']),system=readSystem_(book);
  if(String(system.schema_version)!=='1'||system.schema_name!=='arc_vacations'||system.module_id!==VAC_MODULE_||book.getSpreadsheetTimeZone()!=='Europe/Madrid')throw new Error('El contrato de vacaciones ha cambiado. Revisa la fuente antes de escribir.');
  const plans=book.getSheetByName('Planes'),tripSheet=book.getSheetByName('Viaje'),changes=book.getSheetByName('Cambios');
  if(!plans||!tripSheet||!changes)throw new Error('Falta una fuente del viaje.');
  if(JSON.stringify(plans.getRange(1,1,1,VAC_HEADERS_.length).getValues()[0])!==JSON.stringify(VAC_HEADERS_)||JSON.stringify(changes.getRange(1,1,1,VAC_LOG_.length).getValues()[0])!==JSON.stringify(VAC_LOG_))throw new Error('Las columnas del viaje han cambiado. No se ha escrito nada.');
  const th=['ID','Nombre','Inicio','Fin','Base','Notas','Referencias'];
  if(JSON.stringify(tripSheet.getRange(1,1,1,7).getValues()[0])!==JSON.stringify(th)||tripSheet.getLastRow()!==2)throw new Error('La ficha del viaje requiere revisión.');
  const trip=Object.fromEntries(th.map((h,i)=>[h,cellJSON_(tripSheet.getRange(2,1,1,7).getValues()[0][i],'Europe/Madrid')]));
  const rows=plans.getLastRow()>1?plans.getRange(2,1,plans.getLastRow()-1,16).getValues().map(r=>r.map(v=>cellJSON_(v,'Europe/Madrid'))):[];
  const ids=rows.filter(r=>r.some(v=>v!==null)).map(r=>r[0]);
  if(ids.some(id=>!/^PLAN-\d{4,}$/.test(String(id)))||new Set(ids).size!==ids.length)throw new Error('Hay IDs de planes vacíos o repetidos. Revisa la hoja antes de guardar.');
  return {book,plans,changes,trip,rows};
}
function vacationHash_(value){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(value)).map(n=>(n+256).toString(16).slice(-2)).join('');}
function vacationRecord_(row){const r=Object.fromEntries(VAC_HEADERS_.map((h,i)=>[h,row[i]??null]));r._version=vacationHash_(row);return r;}
function getVacationData(){const c=vacationContext_();return {version:'1.0.0',trip:c.trip,plans:c.rows.filter(r=>r[0]).map(vacationRecord_),statuses:VAC_STATUSES_,types:VAC_TYPES_,sheetUrl:c.book.getUrl(),plansGid:c.plans.getSheetId(),fetchedAt:new Date().toISOString()};}
function vacationDate_(s){
  if(s==null||s==='')return null;
  if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))throw new Error('Fecha no válida.');
  const ms=Date.parse(s+'T00:00:00Z');if(!Number.isFinite(ms)||new Date(ms).toISOString().slice(0,10)!==s)throw new Error('Fecha no válida.');
  return (ms-Date.UTC(1899,11,30))/86400000;
}
function vacationTime_(s){if(s==null||s==='')return null;if(typeof s!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(s))throw new Error('Hora no válida.');const a=s.split(':').map(Number);return(a[0]*60+a[1])/1440;}
function vacationFields_(f,trip){
  const keys=['Plan','Tipo','Estado','Fecha inicio','Hora inicio','Fecha fin','Hora fin','Lugar','Personas','Depende de','Coste previsto (€)','Enlace','Notas'];
  if(!f||typeof f!=='object'||Array.isArray(f)||Object.keys(f).some(k=>!keys.includes(k)))throw new Error('Campos de plan no permitidos.');
  const str=(key,max)=>{const v=f[key];if(v==null||v==='')return null;if(typeof v!=='string'||v.length>max)throw new Error('Revisa '+key+'.');return v.trim()||null;};
  const name=str('Plan',250),type=str('Tipo',50),state=str('Estado',50);
  if(!name||!VAC_TYPES_.includes(type)||!VAC_STATUSES_.includes(state))throw new Error('Indica nombre, tipo y estado válidos.');
  const d=vacationDate_(f['Fecha inicio']),t=vacationTime_(f['Hora inicio']),ed=vacationDate_(f['Fecha fin']),et=vacationTime_(f['Hora fin']);
  if(t!==null&&d===null||et!==null&&ed===null)throw new Error('Una hora necesita su fecha.');
  if(ed!==null&&d===null)throw new Error('Indica primero la fecha de inicio.');
  if([d,ed].some(x=>x!==null&&(x<Math.floor(trip.Inicio)||x>Math.floor(trip.Fin))))throw new Error('La fecha debe estar dentro del viaje.');
  if(d!==null&&ed!==null&&(ed<d||ed===d&&t!==null&&et!==null&&et<t))throw new Error('El final no puede ser anterior al inicio.');
  if(state==='Confirmado'&&d===null)throw new Error('Un plan confirmado necesita fecha. La hora puede quedar pendiente.');
  const raw=f['Coste previsto (€)'];const cost=raw==null||raw===''?null:Number(raw);
  if(cost!==null&&(typeof raw!=='number'&&typeof raw!=='string'||!Number.isFinite(cost)||cost<0||cost>1000000))throw new Error('Revisa el coste previsto.');
  const url=str('Enlace',2000);if(url&&!/^https:\/\/[^\s]+$/i.test(url))throw new Error('El enlace debe empezar por https://.');
  return [name,type,state,d,t,ed,et,str('Lugar',400),str('Personas',400),str('Depende de',1500),cost,url,str('Notas',8000)];
}
function saveVacationPlan(payload){
  assertOwner_();
  if(!payload||typeof payload.requestId!=='string'||!/^[-a-zA-Z0-9_]{16,100}$/.test(payload.requestId))throw new Error('Solicitud no válida.');
  if(Object.keys(payload).some(k=>!['requestId','id','version','fields'].includes(k)))throw new Error('Solicitud no permitida.');
  const lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw new Error('Hay otro guardado en curso. Reintenta con la misma solicitud.');
  try{
    const c=vacationContext_(),fields=vacationFields_(payload.fields,c.trip);
    const digest=vacationHash_([payload.id||null,payload.version||null,fields]);
    const logs=c.changes.getLastRow()>1?c.changes.getRange(2,1,c.changes.getLastRow()-1,7).getValues():[];
    const receipts=logs.filter(r=>r[0]===payload.requestId);
    if(receipts.length>1)throw new Error('El recibo de guardado requiere revisión.');
    if(receipts.length){if(receipts[0][4]!==digest)throw new Error('Esta solicitud pertenece a otros cambios.');return {verified:true,id:receipts[0][2],replayed:true,data:getVacationData()};}
    let index=-1,id=payload.id,before=null;
    if(id){index=c.rows.findIndex(r=>r[0]===id);if(index<0)throw new Error('El plan ya no está en la fuente. Actualiza antes de guardar.');before=c.rows[index];if(vacationHash_(before)!==payload.version)throw new Error('El plan ha cambiado desde que lo abriste. Cierra la ficha y actualiza para comparar los cambios.');}
    else{id='PLAN-'+String(Math.max(0,...c.rows.filter(r=>r[0]).map(r=>Number(String(r[0]).split('-')[1])))+1).padStart(4,'0');}
    const serial=cellJSON_(new Date(),'Europe/Madrid'),row=[id,...fields,before?before[14]:null,serial];
    const native=r=>({values:r.map(v=>v===null?{}:{userEnteredValue:typeof v==='number'?{numberValue:v}:{stringValue:String(v)}})});
    const log=[payload.requestId,serial,id,before?'Editar':'Crear',digest,JSON.stringify(before),JSON.stringify(row)];
    const requests=[];
    if(before){requests.push({updateCells:{range:{sheetId:c.plans.getSheetId(),startRowIndex:index+1,endRowIndex:index+2,startColumnIndex:0,endColumnIndex:16},rows:[native(row)],fields:'userEnteredValue'}});}
    else{
      requests.push({appendCells:{sheetId:c.plans.getSheetId(),rows:[native(row)],fields:'userEnteredValue'}});
      const meta=Sheets.Spreadsheets.get(c.book.getId(),{fields:'sheets(properties(sheetId),tables(tableId,range))'});
      const table=(meta.sheets.find(s=>s.properties.sheetId===c.plans.getSheetId()).tables||[]).find(t=>t.range.startRowIndex===0&&t.range.startColumnIndex===0&&t.range.endColumnIndex===16);
      if(!table)throw new Error('No se encuentra la tabla de planes.');
      requests.push({updateTable:{table:{tableId:table.tableId,range:{...table.range,endRowIndex:Math.max(table.range.endRowIndex,c.plans.getLastRow()+1)}},fields:'range'}});
    }
    requests.push({appendCells:{sheetId:c.changes.getSheetId(),rows:[native(log)],fields:'userEnteredValue'}});
    Sheets.Spreadsheets.batchUpdate({requests},c.book.getId());
    SpreadsheetApp.flush();
    const fresh=vacationContext_(),saved=fresh.rows.find(r=>r[0]===id);
    if(!saved||JSON.stringify(saved)!==JSON.stringify(row))throw new Error('No se ha podido verificar el guardado. Reintenta con la misma solicitud.');
    return {verified:true,id,data:getVacationData()};
  }finally{lock.releaseLock();}
}
