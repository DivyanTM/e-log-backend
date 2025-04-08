import { getOperationByName, insertODSRecord, insertODSEquipment, getODSEquipmentByOperation, getODSRecordsByOperation } from "../services/ODSRecordService.js";

async function insertRecords1(req, res) {
    try {
       
        const  equipment  = req.body;
        const operation1='Equipments containing ODS';
        const userid = req.user.user_id;
        const vesselid = req.user.vessel_id;
     
        // Get operation IDs
        const op1 = await getOperationByName(operation1,userid,vesselid);
        

        if (!op1 ) {
            return res.status(400).send({ message: "Invalid operation names" });
        }
        // Insert equipment
    
        const result =  await insertODSEquipment({ equipment:equipment, operationId: op1.operationId });
        

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

        // Get operation IDs
        const op2 = await getOperationByName(operation2,userid,vesselid);

        if ( !op2) {
            return res.status(400).send({ message: "Invalid operation names" });
        }

        // Insert records
       
            const result = await insertODSRecord({ records: records, operationId: op2.operationId });
        

        res.status(201).send({ result });
    } catch (err) {
        console.log(err);
        return res.status(500).send({message:err.message||'Internal Server Error'});
    }
}

async function getRecordsByOperation1(req, res) {
    try {
        
        const {  operationName } = req.params;
        
        const operation = await getOperationByName(operationName);
        if (!operation) {
            return res.status(404).send({ message: "Operation not found" });
        }

        
        const records = await getODSEquipmentByOperation(req.user.vessel_id);
        
        res.status(200).send({ operationName,  records });
    } catch (err) {
        console.log(err);
        return res.status(500).send({message:err.message||'Internal Server Error'});
    }
}


async function getRecordsByOperation2(req, res) {
    try {
        const { operationName } = req.params;
        
        const operation = await getOperationByName(operationName);
        if (!operation) {
            return res.status(404).send({ message: "Operation not found" });
        }

        const records = await getODSRecordsByOperation(req.user.vessel_id);
        
        
        res.status(200).send({ operationName, records });
    } catch (err) {
        console.log(err);
        return res.status(500).send({message:err.message||'Internal Server Error'});
    }
}


export  default { insertRecords1, insertRecords2 ,getRecordsByOperation1 ,getRecordsByOperation2};
