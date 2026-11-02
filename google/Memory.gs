/* Memory has independent planning, realization and temporal coordinates. */
const MEMORY_PLAN_VALUES_=['Planificado','No planificado','Sin determinar'];
const MEMORY_STATE_VALUES_=['Pendiente','En curso','Ocurrido','Cancelado','No realizado','Por aclarar'];
const MEMORY_FIELDS_=['Título','Planificación','Estado de realización','Fecha prevista','Fin previsto','Hora prevista','Hora fin prevista','Fecha real','Fin real','Lo previsto','Lo vivido','Plan relacionado','Tipo','Área','Personas relacionadas','Lugar','Resultado / impacto'];
function memoryContext_(){
 const book=SpreadsheetApp.openById(HUB_CORE_ID),system=readSystem_(book);checkCore_(book,system);
 if(system.memory_status!=='activo')throw new Error('La estructura de memoria aún no está activa.');
 const names=String(system.register_sources||system.source_register).split('\n').map(n=>n.trim()).filter(Boolean),audit=book.getSheetByName(String(system.source_task_changes));
 const all=names.flatMap(name=>{const sheet=book.getSheetByName(name);return readRows_(book,name,system).filter(r=>r.ID).map(task=>({task,sheet}));});
 if(new Set(all.map(r=>r.task.ID)).size!==all.length)throw new Error('Hay identificadores de memoria repetidos.');
 readRows_(book,audit.getName(),system);return {book,system,audit,all};
}
function memoryValidate_(ctx,record,fields){
 if(!fields||typeof fields!=='object'||Array.isArray(fields))throw new Error('Faltan los cambios del registro.');
 const patch={};Object.keys(fields).forEach(k=>{if(!MEMORY_FIELDS_.includes(k))throw new Error('No se puede editar '+k+'.');let v=fields[k];if(v==='')v=null;
  if(['Fecha prevista','Fin previsto','Fecha real','Fin real'].includes(k))v=taskDate_(v);
  else if(v!==null&&(typeof v!=='string'||v.length>12000))throw new Error('Texto inválido en '+k+'.');
  if(['Hora prevista','Hora fin prevista'].includes(k)&&v!==null&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(v))throw new Error('Hora inválida.');patch[k]=v;
 });
 const next=Object.assign({},record.task,patch);
 if(!next['Título']||!next['Título'].trim())throw new Error('El registro necesita un título.');
 if(!MEMORY_PLAN_VALUES_.includes(next.Planificación)||!MEMORY_STATE_VALUES_.includes(next['Estado de realización']))throw new Error('Selecciona planificación y estado válidos.');
 if(['Pendiente','Cancelado','No realizado'].includes(next['Estado de realización'])&&next.Planificación!=='Planificado')throw new Error('Ese estado corresponde a un plan.');
 for(const [start,end] of [['Fecha prevista','Fin previsto'],['Fecha real','Fin real']]){if(next[end]&&!next[start])throw new Error('Falta la fecha de inicio para '+end+'.');if(next[start]&&next[end]&&next[end]<next[start])throw new Error('El fin no puede ser anterior al inicio.');}
 if((next['Hora prevista']||next['Hora fin prevista'])&&!next['Fecha prevista'])throw new Error('Una hora prevista necesita fecha prevista.');
 if(next['Hora fin prevista']&&!next['Hora prevista'])throw new Error('Indica también la hora de inicio.');
 if(next['Hora fin prevista']&&(!next['Fin previsto']||next['Fin previsto']===next['Fecha prevista'])&&next['Hora fin prevista']<next['Hora prevista'])throw new Error('La hora final es anterior a la inicial; indica la fecha final si termina otro día.');
 const today=Math.floor(cellJSON_(new Date(),ctx.book.getSpreadsheetTimeZone()));
 if(next['Fecha real']&&next['Fecha real']>today||next['Fin real']&&next['Fin real']>today)throw new Error('La fecha real no puede estar en el futuro.');
 if(['Pendiente','Cancelado','No realizado'].includes(next['Estado de realización'])&&(next['Fecha real']||next['Fin real']))throw new Error('Un plan no realizado debe tener las fechas reales vacías.');
 if(next['Plan relacionado']){const hits=ctx.all.filter(r=>r.task.ID===next['Plan relacionado']&&r.task.Planificación==='Planificado');if(hits.length!==1||next['Plan relacionado']===next.ID)throw new Error('El plan relacionado debe ser otro plan existente.');let parent=hits[0].task;const seen=new Set([next.ID]);while(parent){if(seen.has(parent.ID))throw new Error('La relación entre planes no puede formar un ciclo.');seen.add(parent.ID);parent=ctx.all.find(r=>r.task.ID===parent['Plan relacionado'])?.task;}}
 return patch;
}
function updateMemory(payload){
 assertOwner_();const signature=taskRequest_(payload),lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw new Error('Hay otro cambio en curso. Conserva la ficha y reintenta.');
 try{let ctx=memoryContext_();if(taskPrevious_(ctx,payload,signature))return {id:payload.id,verified:true,replayed:true};const record=taskFind_(ctx,payload.id);
  if(typeof payload.expectedVersion!=='string'||taskVersion_(record.task)!==payload.expectedVersion)throw new Error('El registro cambió desde que abriste la ficha. Conserva tus cambios y compáralos con la fuente.');
  const patch=memoryValidate_(ctx,record,payload.fields);if(!Object.keys(patch).some(k=>JSON.stringify(patch[k]??null)!==JSON.stringify(record.task[k]??null)))return {id:payload.id,verified:true,unchanged:true};
  patch['Última actualización']=cellJSON_(new Date(),ctx.book.getSpreadsheetTimeZone());const after=Object.assign({},record.task,patch),requests=taskChanges_(ctx,record,patch);requests.push(taskAudit_(ctx,payload,signature,'Editar memoria',record.task,after));
  if(taskVersion_(taskFind_(memoryContext_(),payload.id).task)!==payload.expectedVersion)throw new Error('El registro cambió mientras se preparaba el guardado.');
  Sheets.Spreadsheets.batchUpdate({requests},HUB_CORE_ID);SpreadsheetApp.flush();ctx=memoryContext_();if(taskVersion_(taskFind_(ctx,payload.id).task)!==taskVersion_(after)||!taskPrevious_(ctx,payload,signature))throw new Error('El guardado necesita comprobación. Reintenta con el mismo contenido.');return {id:payload.id,verified:true};
 }finally{lock.releaseLock();}
}
