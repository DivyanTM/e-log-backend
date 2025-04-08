import CEPendingRecordsService from "../services/CEPendingRecordsService.js";


async function getAllPendingRecordsForCE(req,res){
    try{

        let vesselID=req.user.vessel_id;
        const records=await CEPendingRecordsService.getAllPendingRecordsForCE(vesselID);
        return res.status(200).send({unverifiedRecords:records});

    }catch(err){

        console.log(err);
        return res.status(500).send({message:err.message||'Internal Server Error'});

    }
}

export default { getAllPendingRecordsForCE };