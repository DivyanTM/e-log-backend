import GRBService from "../services/GRBService.js";


async function createRecord(req, res) {
    try {
        const data = req.body;
        console.log("Received Data:", data);

        if (!data) {
            return res.status(400).send({ message: "No data to insert" });
        }

        let vesselID = parseInt(req.user.vessel_id);
        data.createdBy = parseInt(req.user.user_id);

        let missingFields = [];
        if (!data.occasion) missingFields.push("occasion");
        if (!data.area) missingFields.push("area");
        if (!data.date) missingFields.push("date");
        if (!data.time) missingFields.push("time");
        if (!data.position) missingFields.push("position");
        if (!data.methodOfDisposal) missingFields.push("methodOfDisposal");
        if (!data.createdBy) missingFields.push("createdBy");

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(", ")}`
            });
        }


        const wasteFields = ["plastics", "foodWaste", "domesticWaste", "cookingOil",
            "incineratorAsh", "operationalWaste", "animalCarcasses",
            "fishingGear", "eWaste"];

        let hasWaste = false;
        wasteFields.forEach(field => {
            if (data[field] !== undefined) {
                // console.log(`Before Conversion - ${field}:`, data[field], "Type:", typeof data[field]);
                data[field] = parseInt(data[field]) || 0; // Convert to number, default to 0 if NaN
                // console.log(`After Conversion - ${field}:`, data[field], "Type:", typeof data[field]);
                if (data[field] > 0) hasWaste = true;
            }
        });

        if (!hasWaste) {
            return res.status(400).json({ message: "At least one waste category must be provided." });
        }

        const success = await GRBService.createRecord(data, vesselID);

        if (success) {
            res.status(201).json({ message: " Garbage record created successfully." });
        } else {
            res.status(500).json({ message: "Failed to create Garbage record." });
        }

    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).json({ message: `Internal server error: ${err.message}` });
    }
}


async function fetchRecords(req, res) {
    try {
        const records = await GRBService.getRecords(req.user.vessel_id);
        res.status(200).json({records});
    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).json({ message: `Internal server error: ${err.message}` });
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

export default {createRecord,fetchRecords,updateRecordVerificationStatus};