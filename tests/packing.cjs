const assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs');
const source = fs.readFileSync('viaje/packing.js','utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));
async function main() {
  const handlers = {}, host = {isConnected:true,innerHTML:'',contains:() => true};
  const window = {ARC_VACATION:{iso:v => v == null || v === '' ? '' : '2026-11-17',clock:v => v == null || v === '' ? '' : '06:58'}};
  vm.runInNewContext(source,{window,document:{addEventListener:(name,fn) => handlers[name] = fn},crypto:{randomUUID:() => 'test-checklist-request-0001'}});
  const module = window.ARC_PACKING;
  const notes = 'ARC_EQUIPAJE_V1\r\nCantidades de ejemplo.\r\n## Ropa\r\n- [ ] Camiseta — ejemplo.\r\n- [x] Calcetines\r\n## Repaso\r\n- [ ] Objeto <script>.';
  assert.equal(module.parse(notes).items.length,3);
  assert.equal(module.parse(notes).items[1].done,true);
  const record = {ID:'PLAN-9999',Plan:'Lista de prueba',Tipo:'Otro',Estado:'Por concretar',Notas:notes,_version:'before',Lugar:'Conservar',Referencias:'No modificar'};
  const data = {plans:[record]}, calls = [];
  let fail = true, held;
  const api = async(method,payload) => {
    calls.push({method,payload});
    if(method === 'getVacationData') return data;
    if(held) return held;
    if(fail) throw new Error('Conexión interrumpida.');
    return {verified:true,data:{plans:[{...record,Notas:payload.fields.Notas,_version:'after'}]}};
  };
  module.mount(host,api); module.receive(data);
  assert.match(host.innerHTML,/1 de 3 preparados/);
  assert.ok(!host.innerHTML.includes('<script>'));
  const toggle = (line,checked) => handlers.change({target:{matches:() => true,dataset:{packLine:String(line)},checked}});
  const click = selector => handlers.click({target:{closest:value => value === selector}});
  toggle(3,true); await flush();
  assert.match(host.innerHTML,/Reintentar guardado/);
  const original = calls[0].payload;
  assert.equal(original.version,'before');
  assert.equal(original.fields.Lugar,'Conservar');
  assert.equal(original.fields['Fecha inicio'],'');
  assert.equal(original.fields.Referencias,undefined);
  assert.match(original.fields.Notas,/- \[x\] Camiseta/);
  toggle(6,true); assert.equal(calls.length,1,'Block further edits while a result is uncertain');
  fail = false; click('[data-pack-retry]'); await flush();
  assert.equal(calls[1].payload,original,'Retry uses the same request and immutable contents');
  assert.match(host.innerHTML,/2 de 3 preparados/);
  // Refresh after a conflict adopts the remote version, never overwriting it blindly.
  fail = true; toggle(6,true); await flush();
  record._version = 'remote'; record.Notas = notes.replace('[ ] Camiseta','[x] Camiseta');
  click('[data-pack-refresh]'); await flush();
  assert.match(host.innerHTML,/Lista actualizada/);
  fail = false; toggle(6,true); await flush();
  assert.equal(calls.at(-1).payload.version,'remote');
  assert.match(calls.at(-1).payload.fields.Notas,/- \[x\] Camiseta/);
  // A response from an old login cannot restore private content after reset.
  let resolve; held = new Promise(done => resolve = done); toggle(3,false);
  module.reset(); host.innerHTML = 'Desconectado';
  resolve({verified:true,data}); await flush();
  assert.equal(host.innerHTML,'Desconectado');
  console.log('packing: parsing, escaping, persistence, idempotent retries, refresh and session reset passed');
}
main().catch(error => {console.error(error);process.exitCode=1;});
