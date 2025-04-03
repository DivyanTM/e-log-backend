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
export default { createRecord,getAllRecords };