/* Public code only. OAuth tokens stay in memory; personal records are never built into Pages. */
(() => {
  'use strict';
  const scopes = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email';
  const methods = new Set(['getHubData', 'captureIncoming']);
  const config = window.ARC_PUBLIC_CONFIG || {};
  let token = '', expiresAt = 0, tokenClient, pendingLogin = false, session = 0;
  const configured = /^[\w.-]+\.apps\.googleusercontent\.com$/.test(config.clientId || '') && /^[\w-]{20,}$/.test(config.apiDeploymentId || '');
  const notify = () => window.dispatchEvent(new Event('arc-auth-changed'));
  const ready = () => !!token && Date.now() + 360000 < expiresAt;
  function disconnect() {
    token = ''; expiresAt = 0; pendingLogin = false; session++; notify();
  }
  function connect() {
    if (!configured) throw new Error('La conexión de esta versión todavía no está configurada.');
    if (!window.google?.accounts?.oauth2) throw new Error('No se ha podido cargar el acceso a Google. Revisa la conexión y vuelve a intentarlo.');
    if (pendingLogin) return;
    tokenClient ||= google.accounts.oauth2.initTokenClient({
      client_id: config.clientId, scope: scopes,
      callback(response) {
        pendingLogin = false;
        if (response.error || !response.access_token || !Number.isFinite(Number(response.expires_in))) {
          disconnect(); return;
        }
        token = response.access_token; expiresAt = Date.now() + Number(response.expires_in) * 1000;
        session++; notify();
      },
      error_callback() { pendingLogin = false; notify(); }
    });
    pendingLogin = true;
    try { tokenClient.requestAccessToken({prompt: ''}); }
    catch (error) { pendingLogin = false; throw error; }
  }
  async function call(method, ...parameters) {
    if (!methods.has(method)) throw new Error('Operación no permitida desde este HUB.');
    if (!ready()) { disconnect(); throw new Error('Vuelve a conectar con Google. El borrador se conserva.'); }
    const requestSession = session;
    let response;
    try {
      response = await fetch('https://script.googleapis.com/v1/scripts/' + encodeURIComponent(config.apiDeploymentId) + ':run', {
        method:'POST', cache:'no-store', credentials:'omit', redirect:'error',
        headers:{'Authorization':'Bearer ' + token, 'Content-Type':'application/json'},
        body: JSON.stringify({function:method, parameters, devMode:false})
      });
    } catch (_) {
      throw new Error('No se ha podido confirmar la operación. Conserva el borrador y reintenta con el mismo texto.');
    }
    if (requestSession !== session) throw new Error('La sesión ha cambiado. Comprueba Incoming antes de repetir la captura.');
    if (response.status === 401) { disconnect(); throw new Error('La sesión ha caducado. Vuelve a conectar con Google.'); }
    let result;
    try { result = await response.json(); }
    catch (_) { throw new Error('Google no ha devuelto una respuesta verificable. Conserva el borrador.'); }
    if (requestSession !== session) throw new Error('La sesión ha cambiado. Comprueba Incoming antes de repetir la captura.');
    if (!response.ok || result.error) {
      if (result.error?.details?.[0]?.errorMessage) throw new Error(result.error.details[0].errorMessage);
      throw new Error(response.status === 403 ? 'Google no permite esta operación. Revisa la cuenta y su autorización.' : 'Google no ha confirmado la operación. Conserva el borrador.');
    }
    if (result.done !== true || !result.response || !Object.prototype.hasOwnProperty.call(result.response,'result'))
      throw new Error('La operación no tiene un resultado confirmado. Conserva el borrador.');
    return result.response.result;
  }
  window.ARC_BACKEND = Object.freeze({configured, ready, connect, disconnect, call});
  setInterval(() => { if (token && !ready()) disconnect(); }, 30000);
})();
