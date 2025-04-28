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
            return res.status(400).send({message:"Fuel oil received record not created"});
        }

        return res.status(201).send({message:"Fuel oil received record created"});

    }catch(err){
        console.log(err);
        return res.status(500).send({message:err.message||'Internal Server Error'});
    }
}


async function updateRecordVerificationStatus(req,res){
    try{

        let data=req.body;


        if(!data){
            return res.status(400).send({message:"no inputs found"});
        }

        let recordId=data.recordId;
        let verifiedBy=req.user.user_id;
        let vesselId=req.user.vessel_id;
        let operation=data.operation;
        let remarks=data.remarks || null;


        if(!recordId){
            return res.status(400).send({message:"Record ID is required"});
        }

        if(!vesselId){
            return res.status(400).send({message:"Vessel ID is required"});
        }

        if(!verifiedBy){
            return res.status(400).send({message:"id of the verifier is missing"});
        }

        if(operation===null || operation===undefined || operation === ''){
            return res.status(400).json({message:"Operation type is is required"});
        }






        if(Number(operation)===1){
            let verified=await fuelOilReceivedRecordService.setRecordVerified(recordId,verifiedBy,vesselId);

            if(!verified){
                return res.status(500).send({message:"can't verifiy the record"});
            }

            return res.status(200).json({message:"Record verified"});
        }else if(Number(operation)===2){
            let rejected=await fuelOilReceivedRecordService.setRecordRejected(recordId,verifiedBy,vesselId,remarks);

            if(!rejected){
                return res.status(500).send({message:"verfication update failed",operation:"rejection"});
            }

        }

        return res.status(200).json({message:"verification status updated"});

    }catch(err){
        console.log(err);
        return res.status(500).send({message:err.message||"internal server error"});
    }
}

export default {getAllRecords,createRecord,updateRecordVerificationStatus};