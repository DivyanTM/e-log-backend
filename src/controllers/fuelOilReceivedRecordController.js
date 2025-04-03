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

export default {getAllRecords}