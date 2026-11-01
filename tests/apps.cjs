const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),created=[],events={};
function node(){return {hidden:false,textContent:'',href:'',attributes:{},setAttribute(k,v){this.attributes[k]=v;},append(child){created.push(child);}};}
for(const selector of ['.apps-catalog','.apps-intro','.apps-toolbar','.apps-frames','.apps-current','.apps-open'])nodes.set(selector,node());
const root={hidden:true,innerHTML:'',querySelector:s=>nodes.get(s),addEventListener:(name,fn)=>events[name]=fn};
const location={hash:'#apps'},document={title:'',createElement:tag=>{assert.equal(tag,'iframe');return node();}};
const window={location,history:{replaceState(_state,_title,hash){location.hash=hash;}}};
vm.runInNewContext(fs.readFileSync(__dirname+'/../pages/apps.js','utf8'),{window,document});
const click=id=>events.click({target:{closest:()=>({dataset:id?{app:id}:{},hasAttribute:name=>!id&&name==='data-app-back'})}});
window.ARC_APPS.show(root);assert.equal(created.length,0,'No app loads before selection');
click('watch');const watch=created[0];watch.userDraft='still here';assert.equal(watch.src,'https://watch.arcdev.app/?hub=1');
assert.ok(watch.attributes.sandbox.includes('allow-modals'));assert.ok(!watch.attributes.sandbox.includes('allow-top-navigation'));
window.ARC_APPS.show(root);assert.equal(created.length,1,'Hub refresh must preserve the frame');assert.equal(watch.userDraft,'still here');
window.ARC_APPS.hide();assert.equal(root.hidden,true);window.ARC_APPS.show(root);assert.equal(watch.hidden,false);
click('');assert.equal(watch.hidden,true);click('watch');assert.equal(created.length,1);assert.equal(watch.userDraft,'still here');
click('flowgrid');assert.equal(created.length,2);assert.equal(watch.hidden,true);assert.equal(created[1].src,'https://flowgrid.arcdev.app/?hub=1');
location.hash='#apps/watch';window.ARC_APPS.show(root);assert.equal(watch.hidden,false);assert.equal(created[1].hidden,true);
location.hash='#apps/https://untrusted.invalid';window.ARC_APPS.show(root);assert.equal(created.length,2);assert.ok(created.every(frame=>frame.hidden));
console.log('PASS: app selection is lazy and allowlisted; navigation/refresh preserve sessions and drafts; direct routes work without token sharing.');
