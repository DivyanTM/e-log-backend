import fuelOilReceivedRecordService from "../services/fuelOilReceivedRecordService.js";

async function getAllRecords(req,res){
    try{
        let vesselID=req.user.vessel_id;
        const records=await fuelOilReceivedRecordService.getAllRecords(vesselID);
        return res.status(200).send({records:records});
    }catch(err){
        console.log(err);
        return res.status(500).send({message:err.message||'Internal Server Error'});
    }
}

async function createRecord(req,res){
    try{
        const data=req.body;
        console.log(data);
        if(!data){
            return res.status(400).send({message:"Data is required"});
        }

        if(!data.bunkerDeliveryNoteReferenceNumber){
            console.log('bunkerDeliveryNoteReferenceNumber is required');
                return res.status(400).send({message:"Bunker Delivery Note Reference Number is required"});
        }
        if(!data.portOfDelivery){
            console.log('portOfDelivery');
            return res.status(400).send({message:"Port Of Delivery is required"});
        }
        if(!data.date){
            console.log('date is required');
            return res.status(400).send({message:"Date is required"});
        }
        if(!data.grade){
            console.log('grade is required');
            return res.status(400).send({message:"Grade is required"});
        }
        if(!data.sulphur){
            console.log('sulphur is required');
            return res.status(400).send({message:"Sulphur amount is required"});
        }
        if(!data.tankNumber){
            console.log('tankNumber is required');
            return res.status(400).send({message:"Tank Number(s) is required"});
        }
        if(!data.quantity){
            console.log('quantity is required');
            return res.status(400).send({message:"Quantity is required"});
        }


        data.createdBy=req.user.user_id;
        let vesselID=req.user.vessel_id;

        let inserted=await fuelOilReceivedRecordService.createRecord(data,vesselID);

        if(!inserted){
            return res.status(400).send({message:"Record not created"});
        }

        return res.status(201).send({message:"Record created"});

    }catch(err){
        console.log(err);
        return res.status(400).send({message:err.message||'Internal Server Error'});
    }
}

export default {getAllRecords,createRecord};