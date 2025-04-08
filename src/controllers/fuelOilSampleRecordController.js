import fuelOIlSampleRecordService  from "../services/fuelOIlSampleRecordService.js";


async function createRecord(req,res){
    try{
        const data=req.body;


        if(!data){
            return res.status(400).send({message:"No Data To Insert"});
        }

        if(!data.date){
            return res.status(400).send({message:"Date is required"});
        }
        if(!data.sampleSealNumber){
            return res.status(400).send({message:"Sample Seal Number is required"});
        }   
        if(data.letterOfProtestIssued===undefined){
            return res.status(400).send({message:"Letter of Protest is required"});
        }

        data.createdBy=req.user.user_id;
        let vesselID=req.user.vessel_id;
        let inserted=await fuelOIlSampleRecordService.createRecord(data,vesselID);
        if(!inserted){
            return res.status(400).send({message:"data not created"});
        }
        return res.status(201).send({message:"Data created"});

    }catch(err){
        console.log(err);
        return res.status(500).send({message:err.message||"Data not created"});
    }
}
async function getAllRecords(req,res){
    try{
        let vesselID=req.user.vessel_id;
        let records=await fuelOIlSampleRecordService.getAllRecords(vesselID);
        return res.status(200).send({records:records});
    }catch(err){
        console.log(err);
        return res.status(500).send({message:err.message||"internal server error"});
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
            let verified=await fuelOIlSampleRecordService.setRecordVerified(recordId,verifiedBy,vesselId);

            if(!verified){
                return res.status(500).send({message:"can't verifiy the record"});
            }

            return res.status(200).json({message:"Record verified"});
        }else if(Number(operation)===2){
            let rejected=await fuelOIlSampleRecordService.setRecordRejected(recordId,verifiedBy,vesselId,remarks);

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

export default { createRecord,getAllRecords ,updateRecordVerificationStatus};