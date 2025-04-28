import {  insertODSRecord, insertODSEquipment, getODSRecordsByOperation } from "../services/ODSRecordService.js";

async function insertRecords1(req, res) {
    try {
       
        const  equipment  = req.body;
        const operation1='Equipments containing ODS';
        const userid = req.user.user_id;
        const vesselid = req.user.vessel_id;
        equipment.operation1 = operation1;
        equipment.userId = userid;
        equipment.vesselId = vesselid;
        const result =  await insertODSEquipment({ equipment:equipment});
        

        res.status(201).send({ result });
    } catch (err) {
        
        return res.status(500).send({message:err.message||'Internal Server Error'});   
    }
}

async function insertRecords2(req, res) {
    try {
        
        const records = req.body;
        const userid = req.user.user_id;
        const vesselid = req.user.vessel_id;
        const operation2 = 'Record of Ozone-Depleting Substances';
        records.userId = userid;
        records.vesselId = vesselid;
        records.operation2 = operation2;
        

        // Insert records
       
            const result = await insertODSRecord({ records: records });
        

        res.status(201).send({ result });
    } catch (err) {
        console.log(err);
        return res.status(500).send({message:err.message||'Internal Server Error'});
    }
}

async function getRecordsByOperation(req, res) {
    try {
        const records = await getODSRecordsByOperation(req.user.vessel_id);
        
        return res.status(200).send( { records });
    } catch (err) {
        console.log(err);
        return res.status(500).send({message:err.message||'Internal Server Error'});
    }
}





export  default { insertRecords1, insertRecords2 ,getRecordsByOperation };
