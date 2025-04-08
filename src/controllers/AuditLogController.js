import AuditLogService from "../services/AuditLogService.js";

async function getAllAuditLog(req,res){
    try{
        let vesselID=req.user.vessel_id;
        let records=await AuditLogService.getAllLogs(vesselID);
        return res.status(200).send({logs:records});
    }catch(err){
        console.log('Audit log controller : ',err);
        return res.status(500).send({message:err.message||"internal server error"});
    }
}

export default { getAllAuditLog };