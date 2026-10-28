const {test}=require('node:test');
const assert=require('node:assert/strict');
const {getPurchaseFieldDefinitions,getPurchaseTargetValue}=require('./src/lib/purchase-service-fields');
test('dashboard manual fields retain player IDs, optional fields and select choices in both purchase views',()=>{
 const fields=getPurchaseFieldDefinitions({requiresCustom:JSON.stringify({player_id:{label:'Player ID',fieldtype:'text',required:true},server:{label:'Server',fieldtype:'select',options:['Asia','Europe'],required:'1'},note:{required:'0'},internal:{adminonly:true},QNT:{fieldtype:'quantity'}})});
 assert.deepEqual(fields.map(f=>f.field_id),['player_id','server','note']);
 assert.deepEqual(fields[1].options,['Asia','Europe']);assert.equal(fields[2].required,false);
 assert.deepEqual(getPurchaseFieldDefinitions({requiresCustom:'invalid json'}),[]);
});
test('player ID stays the order target when PostgreSQL reorders JSON object keys',()=>{
 const fields=getPurchaseFieldDefinitions({requiresCustom:{zone_id:{label:'Zone ID'},player_id:{label:'Player ID'}}});
 assert.equal(getPurchaseTargetValue(fields,{zone_id:'555',player_id:'123456789'}),'123456789');
 assert.equal(getPurchaseTargetValue([],{}),'N/A');
});
