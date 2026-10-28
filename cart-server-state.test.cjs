const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const {requestCart}=require('./src/lib/cart-api');
const {getUserAuthToken}=require('./src/lib/client-auth-token');
const response=(status,data)=>({ok:status>=200&&status<300,status,json:async()=>data});
function harness(fetcher,guests=[]){
 const data=new Map([['user_session',JSON.stringify({id:'user',balance:20})],['user_token','synthetic-user-token']]);
 if(guests.length)data.set('guest_cart',JSON.stringify(guests));
 const storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
 const states=[],events=[];
 const react={...React,useState:initial=>{const entry={value:initial};states.push(entry);return[initial,value=>{entry.value=typeof value==='function'?value(entry.value):value;}];},useRef:initial=>({current:initial}),useCallback:fn=>fn,useMemo:fn=>fn(),useEffect:()=>{}};
 const module={exports:{}};
 const source=ts.transpileModule(fs.readFileSync('src/context/CartContext.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(source,{module,exports:module.exports,require:name=>name==='react'?react:name==='@/lib/cart-api'?{requestCart}:name==='@/lib/client-auth-token'?{getUserAuthToken}:require(name),localStorage:storage,window:{dispatchEvent:event=>events.push(event.type)},Event,fetch:fetcher});
 const cart=module.exports.CartProvider({children:null}).props.value;
 return{cart,data,states,events};
}
const item={serviceId:'service',serviceName:'100 💎',targetInput:'123456789',quantity:1,price:1};

test('a logged-in cart returning 500 never reports a successful addition or creates a guest item',async()=>{
 const app=harness(async()=>response(500,{success:false,error:'database failure'}));
 await assert.rejects(app.cart.addToCart(item),/database failure/);
 assert.equal(app.data.has('guest_cart'),false);assert.equal(app.states[1].value,false);
 assert.equal(app.states[4].value,'database failure');
});
test('rejected updates and deletes preserve both the server view and pending guest items',async()=>{
 const app=harness(async()=>response(500,{error:'database failure'}),[item]);
 const guest=app.data.get('guest_cart');
 await app.cart.updateQuantity('server-id',2);await app.cart.removeFromCart('server-id');await app.cart.clearCart();
 assert.equal(app.data.get('guest_cart'),guest);
});
test('expired sessions request another login while preserving pending cart items',async()=>{
 const app=harness(async()=>response(401,{error:'expired'}),[item]);
 await assert.rejects(app.cart.addToCart(item),/انتهت جلسة/);
 assert.equal(app.data.has('user_session'),false);assert.equal(app.data.has('user_token'),false);
 assert.ok(app.data.has('guest_cart'));assert.ok(app.events.includes('user_session_change'));
});
test('old guest fallbacks synchronize before checkout and an unsuccessful sync cannot charge a wallet',async()=>{
 const calls=[];
 const app=harness(async(url,options)=>{calls.push(url);assert.equal(options.credentials,'include');assert.equal(options.headers.Authorization,'Bearer synthetic-user-token');return url.endsWith('/sync')?response(200,{success:true,items:[item]}):response(200,{success:true,newBalance:17,orderIds:['order']});},[item]);
 assert.equal((await app.cart.checkout()).success,true);
 assert.deepEqual(calls,['/api/cart/sync','/api/cart/checkout']);assert.equal(app.data.has('guest_cart'),false);
 assert.equal(JSON.parse(app.data.get('user_session')).balance,17);
 const failedCalls=[];
 const failed=harness(async url=>{failedCalls.push(url);return response(500,{error:'sync failed'});},[item]);
 assert.equal((await failed.cart.checkout()).success,false);assert.deepEqual(failedCalls,['/api/cart/sync']);assert.ok(failed.data.has('guest_cart'));
});
test('simultaneous login and checkout synchronization sends a single request',async()=>{
 let release,calls=0;
 const app=harness(async()=>{calls++;return new Promise(resolve=>{release=()=>resolve(response(200,{success:true,items:[]}));});},[item]);
 const first=app.cart.syncGuestCart(),second=app.cart.syncGuestCart();release();await Promise.all([first,second]);
 assert.equal(calls,1);
});
test('cookie-only sessions are forwarded and invalid local tokens do not shadow a valid legacy token',async()=>{
 const storage={getItem:key=>key==='user_token'?'null':key==='token'?'legacy-token':null};
 await requestCart(async(_url,options)=>{assert.equal(options.headers.Authorization,'Bearer legacy-token');assert.equal(options.credentials,'include');return response(200,{success:true,items:[]});},storage,'/api/cart');
 await requestCart(async(_url,options)=>{assert.equal(options.headers.Authorization,undefined);assert.equal(options.credentials,'include');return response(200,{success:true,items:[]});},{getItem:()=>null},'/api/cart');
});
