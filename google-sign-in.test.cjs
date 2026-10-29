const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');

async function renderWidget(config){
 const states=[],effects=[],calls=[],container={};let cursor=0;
 const google={initialize:options=>calls.push(['initialize',options.client_id]),renderButton:()=>calls.push(['button'])};
 const react={...React,useState:initial=>{const i=cursor++;if(!states[i])states[i]={value:initial};return[states[i].value,value=>states[i].value=value];},useRef:()=>({current:container}),useCallback:fn=>fn,useEffect:fn=>effects.push(fn)};
 const module={exports:{}};
 const Script=()=>null;
 const source=ts.transpileModule(fs.readFileSync('src/components/GoogleSignIn.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(source,{module,exports:module.exports,require:name=>name==='react'?react:name==='next/script'?Script:require(name),AbortController,window:{google:{accounts:{id:google}}},fetch:async(url,options)=>{assert.equal(url,'/api/auth/google/config');assert.equal(options.cache,'no-store');return{ok:true,json:async()=>config};}});
 const render=()=>{cursor=0;effects.length=0;return module.exports.default({lang:'ar',onCredential:()=>{}});};
 render();effects[0]();await new Promise(resolve=>setImmediate(resolve));
 const tree=render();return{tree,effects,calls};
}
test('disabled Google config shows email sign-in guidance without initializing Google',async()=>{
 const app=await renderWidget({enabled:false,clientId:null});
 assert.equal(app.tree.props.role,'status');assert.match(app.tree.props.children,/البريد وكلمة المرور/);assert.deepEqual(app.calls,[]);
});
test('Google initialization uses the configured backend client',async()=>{
 const app=await renderWidget({enabled:true,clientId:'replacement.apps.googleusercontent.com'});
 app.effects.at(-1)();assert.deepEqual(app.calls,[['initialize','replacement.apps.googleusercontent.com'],['button']]);
});
