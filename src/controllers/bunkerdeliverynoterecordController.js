import bunkerdeliverynoterecordService from "../services/bunkerdeliverynoterecordService.js";

async function getAllRecord(req,res){
    try{
        let vesselID=req.user.vessel_id;
        const records=await bunkerdeliverynoterecordService.getAllRecords(vesselID);
        return res.status(200).send({records:records});
    }catch(err){
        console.log(err);
        return res.status(500).send({message:err.message||'Internal Server Error'});
    }
}

async function createRecord(req,res) {
    try {
const data = req.body;
        const supplierDeclarationFile = req.file ? req.file.buffer : null;
        data.supplierDeclaration = supplierDeclarationFile;
        data.createdBy=req.user.user_id;
        let vesselID=req.user.vessel_id;
        const inserted = await bunkerdeliverynoterecordService.createRecords(data,vesselID);
        if(!inserted)
        {
            return res.status(400).send({inserted});
        }
        return res.status(200).send({inserted});

    } catch (error) {
        return res.status(500).send({error});

    }
    
}

export default { getAllRecord,createRecord };