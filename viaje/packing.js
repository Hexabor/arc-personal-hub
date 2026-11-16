/* Checklist content and checked state live only in the existing private trip source. */
(() => {
  'use strict';
  const marker = 'ARC_EQUIPAJE_V1';
  const keys = ['Plan','Tipo','Estado','Fecha inicio','Hora inicio','Fecha fin','Hora fin','Lugar','Personas','Depende de','Coste previsto (€)','Enlace','Notas'];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isPacking = plan => String(plan.Notas || '').split(/\r?\n/)[0] === marker;
  function parse(notes) {
    const lines = String(notes || '').split(/\r?\n/), groups = [], intro = [];
    let group;
    lines.slice(1).forEach((line, index) => {
      if (line.startsWith('## ')) { group = {title:line.slice(3), items:[]}; groups.push(group); return; }
      const item = /^- \[([ xX])\] (.+)$/.exec(line);
      if (item) {
        if (!group) { group = {title:'Equipaje',items:[]}; groups.push(group); }
        group.items.push({line:index + 1, done:item[1].toLowerCase() === 'x', text:item[2]});
      } else if (!group && line.trim()) intro.push(line);
    });
    return {lines, groups, intro:intro.join(' '), items:groups.flatMap(group => group.items)};
  }
  let host, api, data, record, problem = '', message = '', request = null, saving = false, generation = 0;
  function receive(fresh) {
    data = fresh;
    const matches = fresh.plans.filter(isPacking);
    record = matches.length === 1 ? matches[0] : null;
    problem = matches.length > 1 ? 'Hay más de una lista de equipaje. Revisa los datos del viaje.' : '';
    draw();
  }
  function draw() {
    if (!host?.isConnected) return;
    if (!record) {
      host.innerHTML = `<section class="pack-empty"><h1>Maleta</h1><p>${esc(problem || (data ? 'No se encuentra la lista de equipaje en este viaje.' : 'Leyendo la lista de equipaje…'))}</p><button class="button light" data-pack-refresh>Actualizar</button></section>`;
      return;
    }
    const list = parse(record.Notas), completed = list.items.filter(item => item.done).length;
    host.innerHTML = `<section class="pack-app"><header class="pack-heading"><div><h1>Maleta</h1><p>${esc(list.intro)}</p></div><button class="text-button" data-pack-refresh ${saving ? 'disabled' : ''}>Actualizar</button></header><div class="pack-summary"><strong>${completed} de ${list.items.length} preparados</strong><span>${list.items.length - completed} pendientes</span><progress value="${completed}" max="${Math.max(1,list.items.length)}" aria-label="Equipaje preparado"></progress></div><a class="pack-jump" href="#pack-final">Repaso antes de salir ↓</a><div class="pack-feedback" role="status" aria-live="polite">${esc(problem || message)}${request && !saving ? ' <button class="text-button" data-pack-retry>Reintentar guardado</button>' : ''}</div><div class="pack-groups">${list.groups.map((group, index) => `<section class="pack-group" ${index === list.groups.length - 1 ? 'id="pack-final"' : ''}><header><h2>${esc(group.title)}</h2><span>${group.items.filter(item => item.done).length}/${group.items.length}</span></header>${group.items.map(item => {
      const split = item.text.indexOf(' — '), title = split < 0 ? item.text : item.text.slice(0, split), detail = split < 0 ? '' : item.text.slice(split + 3);
      const checked = request?.line === item.line ? request.checked : item.done;
      return `<label class="pack-item ${item.done ? 'is-done' : ''}"><input type="checkbox" data-pack-line="${item.line}" ${checked ? 'checked' : ''} ${request || saving ? 'disabled' : ''}><span><span class="pack-item-title">${esc(title)}</span>${detail ? `<small>${esc(detail)}</small>` : ''}</span></label>`;
    }).join('')}</section>`).join('')}</div><p class="pack-foot">Las marcas se guardan en tu viaje. Marca cada cosa cuando esté dentro de la maleta o apartada para llevarla puesta.</p></section>`;
  }
  async function refresh() {
    if (saving) return;
    const current = generation; saving = true; message = 'Actualizando…'; problem = ''; draw();
    try {
      const fresh = await api('getVacationData');
      if (current !== generation) return;
      request = null; receive(fresh); message = 'Lista actualizada.';
    } catch (error) { if (current === generation) problem = error.message || 'No se ha podido actualizar.'; }
    finally { if (current === generation) { saving = false; draw(); } }
  }
  async function persist() {
    if (saving || !request) return;
    const current = generation; saving = true; problem = ''; message = 'Guardando y comprobando…'; draw();
    try {
      const result = await api('saveVacationPlan', request.payload);
      if (current !== generation) return;
      if (!result.verified) throw new Error('No se ha confirmado el guardado.');
      request = null; receive(result.data); message = 'Guardado.';
    } catch (error) {
      if (current === generation) problem = (error.message || 'No se ha podido confirmar el guardado.') + ' Reintenta o pulsa Actualizar para comprobar la lista guardada.';
    } finally { if (current === generation) { saving = false; draw(); } }
  }
  function toggle(line, checked) {
    if (!record || saving || request) return;
    const list = parse(record.Notas), item = list.items.find(item => item.line === line);
    if (!item) return;
    list.lines[line] = `- [${checked ? 'x' : ' '}] ${item.text}`;
    const fields = Object.fromEntries(keys.map(key => [key,record[key] ?? '']));
    for (const key of ['Fecha inicio','Fecha fin']) fields[key] = window.ARC_VACATION.iso(fields[key]);
    for (const key of ['Hora inicio','Hora fin']) fields[key] = window.ARC_VACATION.clock(fields[key]);
    fields.Notas = list.lines.join('\n');
    request = {line, checked, payload:{requestId:crypto.randomUUID(), id:record.ID, version:record._version, fields}};
    persist();
  }
  document.addEventListener('change', event => {
    if (host?.contains(event.target) && event.target.matches('[data-pack-line]')) toggle(Number(event.target.dataset.packLine),event.target.checked);
  });
  document.addEventListener('click', event => {
    if (!host?.contains(event.target)) return;
    if (event.target.closest('[data-pack-refresh]')) refresh();
    else if (event.target.closest('[data-pack-retry]')) persist();
  });
  window.ARC_PACKING = Object.freeze({
    isPacking, parse,
    mount(element, call) { host = element; api = call; draw(); },
    receive,
    reset() { generation++; host = null; data = record = request = null; saving = false; problem = message = ''; }
  });
})();

