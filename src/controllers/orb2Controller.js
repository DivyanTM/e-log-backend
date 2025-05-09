import { fetchOperation, processOperation } from "../services/orb2Service.js";
  
async function handleOperation(req, res) {
    try {
        const { operationType, formData } = req.body;
        console.log(operationType,formData);
        console.log(req.body);
        if (!operationType || !formData) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        const user = req.user.user_id;
        const vessel = req.user.vessel_id;
        const result = await processOperation(operationType, formData, user, vessel);
        return res.status(200).json(result);

    } catch (error) {
        console.error("Error handling operation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


async function getallOperations(req,res) {
    try {
        const vessel = req.user.vessel_id;
        const result = await fetchOperation( vessel);
        return res.status(200).json({message:'Data received successfully',records:result});

    } catch (error) {
        console.error("Error handling operation:", error);
        return res.status(500).json({ message: error.message });
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

export default { handleOperation, getallOperations,updateRecordVerificationStatus };
