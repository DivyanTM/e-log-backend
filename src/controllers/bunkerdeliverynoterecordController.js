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

async function downloadPdf(req, res) {
    const { id } = req.params;

    try {
        const fileData = await bunkerdeliverynoterecordService.getPdf(id);

        
        if (!fileData || fileData.length === 0 || !fileData[0].supplierDeclarationFile) {
            return res.status(404).send('File not found');
        }

        const buffer = fileData[0].supplierDeclarationFile;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=supplier-declaration-${id}.pdf`);
        return res.send(buffer); 
    } catch (err) {
        console.error("Error in downloadPdf:", err.message);
        return res.status(500).send(`Error downloading PDF: ${err.message}`);
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
            let verified=await GRBService.setRecordVerified(recordId,verifiedBy,vesselId);

            if(!verified){
                return res.status(500).send({message:"can't verifiy the record"});
            }

            return res.status(200).json({message:"Record verified"});
        }else if(Number(operation)===2){
            let rejected=await GRBService.setRecordRejected(recordId,verifiedBy,vesselId,remarks);

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

export default { getAllRecord,createRecord,downloadPdf,updateRecordVerificationStatus };