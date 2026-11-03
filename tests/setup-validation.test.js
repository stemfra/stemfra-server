const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const {createRequire}=require('node:module');
const cmsRequire=createRequire(path.resolve(__dirname,'../../stemfra_platform/package.json'));
const ts=cmsRequire('typescript');const mod={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../../stemfra_platform/stemfra_cms/src/lib/setupValidation.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:mod,exports:mod.exports,require:cmsRequire});
const {validateSetupBusiness,firstRequiredSetupStep}=mod.exports;
const valid={phone:'+14165550123',email:'owner@example.test',address:'123 Test Street',city:'Toronto',country:'CA',hoursValid:true};
test('valid test details pass while blank and malformed required fields fail',()=>{
 assert.equal(Object.keys(validateSetupBusiness(valid)).length,0);
 assert.ok(validateSetupBusiness({...valid,phone:''}).phone);
 assert.ok(validateSetupBusiness({...valid,phone:'123'}).phone);
 assert.ok(validateSetupBusiness({...valid,email:'invalid'}).email);
 for(const [field,error]of [['email','email'],['address','address'],['city','city'],['country','country']])assert.ok(validateSetupBusiness({...valid,[field]:''})[error]);
 assert.ok(validateSetupBusiness({...valid,hoursValid:false}).hours);
});
test('required stage selection blocks skipping business/services/team but allows optional branding',()=>{
 assert.equal(firstRequiredSetupStep([false,true,true,true]),0);
 assert.equal(firstRequiredSetupStep([true,false,true,true]),1);
 assert.equal(firstRequiredSetupStep([true,true,false,true]),2);
 assert.equal(firstRequiredSetupStep([true,true,true,false]),-1);
});
