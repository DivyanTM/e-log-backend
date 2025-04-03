import NOXTierChangeOverRecordService from "../services/NOXTierChangeOverRecordService.js";


async function createRecord(req, res) {
    try{
        const data=req.body;

        // console.log(data);

        if(!data){
            return res.status(400).send({message:"No Data To Insert"});
        }

        if(!data.date){
            return res.status(400).send({message:"Date is required"});
        }

        if(!data.smtTime){
            return res.status(400).send({message:"SMT time is required"});
        }

        if(!data.position){
            return res.status(400).send({message:"Position is required"});
        }

        if(!data.event){
            return res.status(400).send({message:"Event is required"});
        }

        if(!data.engineName){
            return res.status(400).send({message:"Engine name is required"});
        }

        if(!data.engineStatus){
            return res.status(400).send({message:"Engine status is required"});
        }

        if(!data.engineTierStatus){
            return res.status(400).send({message:"Engine tier status is required"});
        }

        data.createdBy=req.user.user_id;
        let vesselID=req.user.vessel_id;

        let inserted=await NOXTierChangeOverRecordService.createRecord(data,vesselID);

        if(!inserted){
            return res.status(400).send({message:"Cannot create record"});
        }

        return res.status(201).send({message:"Data created"});


    }catch(err){
        console.log(err);
        return res.status(500).send({message:err.message||"Data not created"});
    }
}


async function getRecords(req, res) {
    try{
        let vesselID=req.user.vessel_id;
        let records=await NOXTierChangeOverRecordService.getRecords(vesselID);
        return res.status(200).send({records:records});

    }catch(err){
        console.log(err);
        return res.status(500).send({message:err.message||"internal server error"});
    }
}

export default {createRecord,getRecords}