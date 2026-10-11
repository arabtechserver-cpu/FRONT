const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const {NextRequest}=require('next/server');
let cookieWrites=0;
function load(file) {
 const filename=path.resolve(file), loaded=new Module(filename,module);
 loaded.filename=filename; loaded.paths=Module._nodeModulePaths(path.dirname(filename));
 loaded.require=name=>name==='next/headers'?{cookies:async()=>({get:()=>({value:'device-test'}),set:()=>cookieWrites++})}:Module.prototype.require.call(loaded,name);
 loaded._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
 return loaded.exports;
}
(async()=>{
 const originalFetch=global.fetch;
 const env={NODE_ENV:process.env.NODE_ENV,INTERNAL_API_URL:process.env.INTERNAL_API_URL,NEXT_PUBLIC_API_URL:process.env.NEXT_PUBLIC_API_URL};
 const request=body=>new NextRequest('https://borai.store/api/admin/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
 let calls=0,blocked=false;
 try {
 process.env.NODE_ENV='production'; process.env.INTERNAL_API_URL='http://obsolete:5000'; process.env.NEXT_PUBLIC_API_URL='http://other-obsolete:5000';
 global.fetch=async(url,options)=>{
  const parsed=new URL(url);assert.equal(parsed.origin,'https://api.borai.store');calls++;
  if(blocked)return Response.json({success:false,code:'IP_NOT_ALLOWED',error:'Access denied'},{status:403});
  if(parsed.pathname==='/api/auth/login'){
   assert.deepEqual(JSON.parse(options.body instanceof ArrayBuffer ? Buffer.from(options.body).toString() : options.body),{email:'admin-test',password:'test-password',deviceToken:'device-test'});
   return Response.json({success:true,requireOtp:true,challengeToken:'test-challenge'});
  }
  if(parsed.pathname.endsWith('verify-otp'))return Response.json({success:true,token:'test-token',user:{role:'admin'}});
  return Response.json({success:true});
 };
 const login={username:'admin-test',password:'test-password',deviceToken:'device-test'};
 const cases=[
 ['src/app/api/admin/login/route.ts',login,'requireOtp'],
 ['src/app/api/admin/login/verify-otp/route.ts',{challengeToken:'test-challenge',otp:'123456'},'token'],
 ['src/app/api/admin/login/resend-otp/route.ts',{challengeToken:'test-challenge'},'success']
 ];
 for(const[file,body,field]of cases){const res=await load(file).POST(request(body));assert.equal(res.status,200);assert.ok((await res.json())[field]);}
 assert.equal(cookieWrites,1);
 const actions=load('src/app/(admin)/admin/login/actions.ts');
 assert.equal((await actions.loginAdmin('admin-test','test-password')).requireOtp,true);
 assert.equal((await actions.verifyAdminOtpAction('test-challenge','123456')).success,true);
 assert.equal((await actions.resendAdminOtpAction('test-challenge')).success,true);
 const proxy=load('src/app/api/[...path]/route.ts');
 assert.equal((await proxy.POST(request({email:'admin-test',password:'test-password',deviceToken:'device-test'}),{params:Promise.resolve({path:['auth','login']})})).status,200);
 assert.equal((await load('src/app/uploads/[...path]/route.ts').GET(new NextRequest('https://borai.store/uploads/routing-test.png'),{params:Promise.resolve({path:['routing-test.png']})})).status,200);
 blocked=true;
 const denied=await load(cases[0][0]).POST(request(login));assert.equal(denied.status,403);assert.equal((await denied.json()).code,'IP_NOT_ALLOWED');
 assert.equal(calls,9);
 console.log('PASS: login, OTP routes/actions, API and uploads use deployed backend and preserve IP restrictions.');
 }finally{global.fetch=originalFetch;for(const[key,value]of Object.entries(env)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
})().catch(error=>{console.error(error);process.exitCode=1});
