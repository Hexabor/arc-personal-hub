const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../pages/google-backend.js','utf8');
function runtime(config={clientId:'synthetic.apps.googleusercontent.com',apiDeploymentId:'synthetic-deployment-1234567890'}) {
  let callback,timer,events=0,requests=[],now=1000;
  const browser={window:{ARC_PUBLIC_CONFIG:config,dispatchEvent(){events++;}},Event:class{},Date:{now:()=>now},Set,Number,Object,JSON,Error,encodeURIComponent,setInterval(fn){timer=fn;},
    google:{accounts:{oauth2:{initTokenClient(options){callback=options.callback;return {requestAccessToken(){}};}}}},
    fetch:async(url,options)=>{requests.push({url,options});return {ok:true,status:200,json:async()=>({done:true,response:{result:{verified:true,id:'INC-TEST'}}})};}};
  browser.window.google=browser.google;vm.createContext(browser);vm.runInContext(source,browser);
  return {browser,api:browser.window.ARC_BACKEND,requests,login(){browser.window.ARC_BACKEND.connect();callback({access_token:'synthetic-token',expires_in:3600});},expire(){now+=4000000;timer();},events:()=>events};
}
(async()=>{
  const empty=runtime({});assert.equal(empty.api.configured,false);assert.throws(()=>empty.api.connect(),/configurada/);
  const r=runtime();assert.equal(r.api.ready(),false);await assert.rejects(r.api.call('getHubData'),/conectar/);assert.equal(r.requests.length,0);
  r.login();assert.equal(r.api.ready(),true);await assert.rejects(r.api.call('setupHub'),/permitida/);assert.equal(r.requests.length,0);
  const receipt=await r.api.call('captureIncoming',{text:'=literal',requestId:'request-0001'});assert.equal(receipt.verified,true);
  assert.ok(r.requests[0].url.endsWith('synthetic-deployment-1234567890:run'));
  assert.equal(r.requests[0].options.cache,'no-store');assert.equal(r.requests[0].options.credentials,'omit');
  assert.equal(JSON.parse(r.requests[0].options.body).parameters[0].text,'=literal');
  assert.equal(JSON.parse(r.requests[0].options.body).devMode,false);
  r.browser.fetch=async()=>({ok:true,status:200,json:async()=>({done:true,error:{details:[{errorMessage:'Acceso privado rechazado'}]}})});
  await assert.rejects(r.api.call('getHubData'),/Acceso privado rechazado/);
  r.browser.fetch=async()=>({ok:true,status:200,json:async()=>({done:false})});await assert.rejects(r.api.call('getHubData'),/confirmado/);
  r.browser.fetch=async()=>({ok:false,status:401,json:async()=>({})});await assert.rejects(r.api.call('getHubData'),/caducado/);assert.equal(r.api.ready(),false);
  r.login();r.expire();assert.equal(r.api.ready(),false);
  r.login();r.browser.fetch=async()=>({ok:true,status:200,json:async()=>{r.api.disconnect();return {done:true,response:{result:{secret:'never returned'}}};}});
  await assert.rejects(r.api.call('getHubData'),/sesión ha cambiado/);
  r.login();r.browser.fetch=async()=>{throw Error('Network lost')};await assert.rejects(r.api.call('captureIncoming',{text:'Keep draft',requestId:'retry-001'}),/Conserva el borrador/);
  assert.ok(!source.includes('localStorage'));assert.ok(!source.includes('console.log'));
  // The shared interface must not read or show private data before sign-in.
  const elements=new Map(),listeners={};
  function element(id){if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',value:'',dataset:{},hidden:false,addEventListener(){},focus(){},close(){this.open=false}});return elements.get(id);}
  const ui={document:{getElementById:element,querySelectorAll:()=>[],addEventListener:(event,fn)=>listeners[event]=fn,activeElement:null},window:{ARC_BACKEND:empty.api,addEventListener(){},scrollTo(){}},Intl,Date,URL,console,localStorage:{getItem:()=>null},setInterval(){},setTimeout(){},clearTimeout(){}};
  vm.createContext(ui);vm.runInContext(fs.readFileSync(__dirname+'/../dist/app.js','utf8'),ui);
  assert.ok(element('main').innerHTML.includes('migración está preparada'));
  assert.ok(!element('main').innerHTML.includes('tareas abiertas'));
  listeners.click({target:{closest:()=>({dataset:{},hasAttribute:k=>k==='data-capture'})}});
  assert.ok(element('main').innerHTML.includes('migración está preparada'));
  console.log('PASS: no unauthenticated calls, method allowlist, OAuth in memory, API errors, expiration, stale-session rejection, literal payload and uncertain-write handling. Live Google connection not tested.');
})().catch(error=>{console.error(error);process.exit(1)});
