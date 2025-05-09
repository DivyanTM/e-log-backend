import bwrService from "../services/bwrService.js";

async function createRecord(req, res) {
    try {
        const { operationType, operationData } = req.body;
        console.log("Received Request:", { operationType, operationData });

        if (!operationType || !operationData) {
            return res.status(400).send({
                message: "Both operationType and operationData are required"
            });
        }

        if (operationType === 1) {
            return await createRecord1(req, res, operationData);
        } else if (operationType === 2) {
            return await createRecord2(req, res, operationData);
        }
        else if (operationType === 3) {
            return await createRecord3(req, res, operationData);
        } else if (operationType === 4) {
            return await createRecord4(req, res, operationData);
        } else if (operationType === 5) {
            return await createRecord5(req, res, operationData);
        }

        else {
            return res.status(400).json({
                message: "Invalid operationType. Must be 1 (Ballast Water) or 2 (Additional Remarks)"
            });
        }
    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).json({ message: `Internal server error: ${err.message}` });
    }
    async function createRecord1(req, res, data) {
        try {
            let vesselID = parseInt(req.user.vessel_id);
            data.createdBy = parseInt(req.user.user_id);

            let missingFields = [];
            if (!data.recordDate) missingFields.push("recordDate");
            if (!data.recordTime) missingFields.push("recordTime");
            if (!data.position) missingFields.push("position");
            if (!data.estimatedDischargedVolume) missingFields.push("estimatedDischargedVolume");
            if (!data.circumstancesRemarks) missingFields.push("circumstancesRemarks");
            if (data.conformBWMPlan !== 0 && data.conformBWMPlan !== 1) missingFields.push("conformBWMPlan");
            if (!data.createdBy) missingFields.push("createdBy");

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            if (isNaN(parseFloat(data.estimatedDischargedVolume))) {
                return res.status(400).json({ message: "Estimated discharged volume must be a number" });
            }

           
            const success = await bwrService.createRecord1(data, vesselID);

            if (success) {
                res.status(201).json({
                    message: "Ballast water discharge record created successfully.",
                    operationType: 1
                });
            } else {
                res.status(500).json({ message: "Failed to create ballast water record." });
            }
        } catch (err) {
            throw err;
        }
    }
    async function createRecord2(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID
            let vesselID = parseInt(req.user.vessel_id);

            // Validate required fields
            let missingFields = [];
            if (!data.recordDate) missingFields.push("recordDate");
            if (!data.recordTime) missingFields.push("recordTime");
            if (!data.position) missingFields.push("position");
            if (!data.portFacilityName) missingFields.push("portFacilityName");
            if (!data.estimatedDischargedVolume) missingFields.push("estimatedDischargedVolume");
            if (data.conformBWMPlan !== 0 && data.conformBWMPlan !== 1) missingFields.push("conformBWMPlan");
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await bwrService.createRecord2(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "Ballast Water Discharge Facility record created successfully.",
                    operationID: result.operationID,
                    operationType: 2
                });
            } else {
                res.status(500).json({ message: "Failed to create record." });
            }
        } catch (err) {
            console.error("Error in createRecord2 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
    async function createRecord3(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID
            let vesselID = parseInt(req.user.vessel_id);

            // Validate required fields
            let missingFields = [];
            if (!data.recordDate) missingFields.push("recordDate");
            if (!data.recordTime) missingFields.push("recordTime");
            if (!data.position) missingFields.push("position");
            if (data.estimatedDischargedVolume === undefined) missingFields.push("estimatedDischargedVolume");
            if (!data.remainingVolume) missingFields.push("remainingVolume");
            if (data.conformBWMPlan !== 0 && data.conformBWMPlan !== 1) missingFields.push("conformBWMPlan");            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await bwrService.createRecord3(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "Ballast Water Discharge Facility record created successfully.",
                    operationID: result.operationID,
                    operationType: 3
                });
            } else {
                res.status(500).json({ message: "Failed to create record." });
            }
        } catch (err) {
            console.error("Error in createRecord3 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
    async function createRecord4(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID
            let vesselID = parseInt(req.user.vessel_id);

            // Validate required fields
            let missingFields = [];
            if (!data.recordDate) missingFields.push("recordDate");
            if (!data.recordTime) missingFields.push("recordTime");
            if (!data.position) missingFields.push("position");
            if (!data.estimatedCirculatedVolume) missingFields.push("estimatedCirculatedVolume");
            if (!data.treatmentSystemUsed) missingFields.push("treatmentSystemUsed");
            if (data.conformBWMPlan !== 0 && data.conformBWMPlan !== 1) missingFields.push("conformBWMPlan");
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await bwrService.createRecord4(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "Ballast Water Discharge Facility record created successfully.",
                    operationID: result.operationID,
                    operationType: 4
                });
            } else {
                res.status(500).json({ message: "Failed to create record." });
            }
        } catch (err) {
            console.error("Error in createRecord4 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
    async function createRecord5(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID
            let vesselID = parseInt(req.user.vessel_id);

            // Validate required fields
            let missingFields = [];
            if (!data.recordDate) missingFields.push("recordDate");
            if (!data.recordTime) missingFields.push("recordTime");
            if (!data.position) missingFields.push("position");
            if (!data.waterDepth) missingFields.push("waterDepth");
            if (!data.estimatedUptakeVolume) missingFields.push("estimatedUptakeVolume");

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await bwrService.createRecord5(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "Ballast Water Discharge Facility record created successfully.",
                    operationID: result.operationID,
                    operationType: 5
                });
            } else {
                res.status(500).json({ message: "Failed to create record." });
            }
        } catch (err) {
            console.error("Error in createRecord5 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }

}

async function fetchRecords(req, res) {
    try {
        const records = await bwrService.fetchRecords(req.user.vessel_id);
        res.status(200).json({ records });
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
            let verified=await bwrService.setRecordVerified(recordId,verifiedBy,vesselId);

            if(!verified){
                return res.status(500).send({message:"can't verifiy the record"});
            }

            return res.status(200).json({message:"Record verified"});
        }else if(Number(operation)===2){
            let rejected=await bwrService.setRecordRejected(recordId,verifiedBy,vesselId,remarks);

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


export default { createRecord, fetchRecords, updateRecordVerificationStatus };