/* Each app keeps its own origin, data connection and session. No token exchange. */
(() => {
  'use strict';
  const catalog = Object.freeze([
    { id: 'watch', name: 'Watch Tracker', description: 'Tu biblioteca de series y películas.', url: 'https://watch.arcdev.app/', color: 'sage', mark: '▤' },
    { id: 'flowgrid', name: 'FlowGrid', description: 'Tus cuentas y movimientos, a mano.', url: 'https://flowgrid.arcdev.app/', color: 'sand', mark: '▦' }
  ]);
  let root, selected = '', initialized = false;
  const frames = new Map();
  function choose(id, updateHash = true) {
    const app = catalog.find(item => item.id === id);
    selected = app?.id || '';
    root.querySelector('.apps-catalog').hidden = !!app;
    root.querySelector('.apps-intro').hidden = !!app;
    root.querySelector('.apps-toolbar').hidden = !app;
    if (app && !frames.has(app.id)) {
      const frame = document.createElement('iframe');
      frame.title = app.name + ' dentro del hub';
      frame.src = app.url + '?hub=1';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads');
      frame.setAttribute('allow', 'clipboard-write');
      frame.className = 'app-frame';
      root.querySelector('.apps-frames').append(frame);
      frames.set(app.id, frame);
    }
    frames.forEach((frame, key) => { frame.hidden = key !== selected; });
    if (app) {
      root.querySelector('.apps-current').textContent = app.name;
      root.querySelector('.apps-open').href = app.url;
    }
    document.title = app ? app.name + ' · ARC' : 'Apps · ARC';
    if (updateHash) window.history.replaceState(null, '', '#apps' + (selected ? '/' + selected : ''));
    if (updateHash && app && typeof window.CustomEvent === 'function') window.dispatchEvent(new window.CustomEvent('arc-module-open', { detail: { key: 'app:' + app.id } }));
  }
  function show(target) {
    root = target;
    root.hidden = false;
    if (!initialized) {
      root.innerHTML = `<div class="apps-intro"><div class="eyebrow">Tu espacio personal</div><h1>Tus apps</h1><p class="subtitle">Elige cómo entrar. Tus datos son los mismos.</p></div>
        <div class="apps-catalog">${catalog.map(app => `<article class="app-card ${app.color}"><span class="app-mark" aria-hidden="true">${app.mark}</span><h2>${app.name}</h2><p>${app.description}</p><div class="app-card-actions"><button class="button dark" data-app="${app.id}">Usar en el hub</button><a class="button light" href="${app.url}" target="_blank" rel="noopener noreferrer">Abrir aparte ↗</a></div></article>`).join('')}</div>
        <div class="apps-toolbar" hidden><button class="button light" data-app-back>← Apps</button><h1 class="apps-current"></h1><a class="button light apps-open" target="_blank" rel="noopener noreferrer">Abrir aparte ↗</a></div>
        <div class="apps-frames"></div><p class="apps-session-note">Cada aplicación conserva su propia sesión. Puedes volver a ella desde el menú Apps sin recargarla.</p>`;
      root.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (button?.dataset.app) choose(button.dataset.app);
        else if (button?.hasAttribute('data-app-back')) choose('');
      });
      initialized = true;
    }
    const hash = window.location.hash;
    choose(hash.startsWith('#apps/') ? hash.slice(6) : hash === '#apps' ? '' : selected, false);
  }
  function hide() { if (root) root.hidden = true; }
  window.ARC_APPS = Object.freeze({ show, hide, catalog });
})();
