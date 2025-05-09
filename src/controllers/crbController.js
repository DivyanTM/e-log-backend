import crbService from "../services/crbService.js";

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
        else if (operationType === 6) {
            return await createRecord6(req, res, operationData);
        }
        else if (operationType === 7) {
            return await createRecord7(req, res, operationData);
        }

        else if (operationType === 8) {
            return await createRecord8(req, res, operationData);
        }
        else if (operationType === 9) {
            return await createRecord9(req, res, operationData);
        }
        else if (operationType === 10) {
            return await createRecord10(req, res, operationData);
        }
        else if (operationType === 11) {
            return await createRecord11(req, res, operationData);
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

            if (!data.occurrenceTime) missingFields.push("occurrenceTime");
            if (!data.quantity) missingFields.push("quantity");
            if (!data.substance) missingFields.push("substance");
            if (!data.category) missingFields.push("category");
            if (!data.circumstances) missingFields.push("circumstances");
            if (!data.remarks) missingFields.push("remarks");

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            

            const success = await crbService.createRecord1(data, vesselID);

            if (success) {
                res.status(201).json({
                    message: "cargo record created successfully.",
                    operationType: 1
                });
            } else {
                res.status(500).json({ message: "Failed to create cargo record." });
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
            data.createdBy = parseInt(req.user.user_id);
            let missingFields = [];

            if (!data.createdBy) missingFields.push("createdBy");
            // Validate required fields
            if (!data.remarks) missingFields.push("remarks");

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await crbService.createRecord2(data, vesselID);

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
            let vesselID = parseInt(req.user.vessel_id);
            data.createdBy = parseInt(req.user.user_id);
            let missingFields = [];

            if (!data.createdBy) missingFields.push("createdBy");
            // Validate required fields
            // Validation for required fields
            if (!data.tankIdentity) missingFields.push("tankIdentity");
            if (!data.startTime) missingFields.push("startTime");
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await crbService.createRecord3(data, vesselID);
            if (result.success) {
                res.status(201).json({
                    message: "Ballast Water Discharge Facility record created successfully.",
                    operationID: result.operationID,
                    operationType: 3
                });
            } else {
                res.status(500).json({ messag7e: "Failed to create record." });
            }
        } catch (err) {
            console.error("Error in createRecord2 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
    async function createRecord4(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID
            let vesselID = parseInt(req.user.vessel_id);
            data.createdBy = parseInt(req.user.user_id);
            let missingFields = [];

            if (!data.createdBy) missingFields.push("createdBy");
            // Validate required fields
            if (!data.tankDetails) missingFields.push("tankDetails");
            if (data.numCleaningMachines === undefined) missingFields.push("numCleaningMachines");
            if (data.washDuration === undefined) missingFields.push("washDuration");
            if (!data.washType) missingFields.push("washType");
            if (!data.unloadingPortFacility) missingFields.push("unloadingPortFacility");
            if (data.tankWashingsTransferred === undefined) missingFields.push("tankWashingsTransferred");
            if (!data.transferDateTime) missingFields.push("transferDateTime");
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await crbService.createRecord4(data, vesselID);

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
            console.error("Error in createRecord2 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
    async function createRecord5(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID
            let vesselID = parseInt(req.user.vessel_id);
            data.createdBy = parseInt(req.user.user_id);
            let missingFields = [];

            if (!data.createdBy) missingFields.push("createdBy");
            // Validate required fields
            if (!data.cleaningTime) missingFields.push("cleaningTime");
            if (!data.tankDetails) missingFields.push("tankDetails");
            if (!data.washingProcedure) missingFields.push("washingProcedure");
            if (data.cleaningAgentQuantity === undefined) missingFields.push("cleaningAgentQuantity");
            if (data.numFansUsed === undefined) missingFields.push("numFansUsed");
            if (data.ventilationDuration === undefined) missingFields.push("ventilationDuration");
            if (data.intoSea === undefined) missingFields.push("intoSea");
            if (data.tankWashingsTransferred === undefined) missingFields.push("tankWashingsTransferred");
            if (!data.transferDateTime) missingFields.push("transferDateTime");


            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await crbService.createRecord5(data, vesselID);

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
            console.error("Error in createRecord2 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
    async function createRecord6(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID
            let vesselID = parseInt(req.user.vessel_id);
            data.createdBy = parseInt(req.user.user_id);
            let missingFields = [];

            if (!data.createdBy) missingFields.push("createdBy");
            // Validate required fields
            if (!data.port) missingFields.push("port");
            if (!data.tankDetails) missingFields.push("tankDetails");
            if (!data.substances) missingFields.push("substances");
            if (!data.categories) missingFields.push("categories");
            if (data.tanksEmptied === undefined) missingFields.push("tanksEmptied");
            if (data.prewashDone === undefined) missingFields.push("prewashDone");
            if (data.tankWashingsDischarged === undefined) missingFields.push("tankWashingsDischarged");
            if (data.exemptionGranted === undefined) missingFields.push("exemptionGranted");
            if (data.exemptionGranted && !data.exemptionReason) missingFields.push("exemptionReason");

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await crbService.createRecord6(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "Ballast Water Discharge Facility record created successfully.",
                    operationID: result.operationID,
                    operationType: 6
                });
            } else {
                res.status(500).json({ message: "Failed to create record." });
            }
        } catch (err) {
            console.error("Error in createRecord2 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    } async function createRecord7(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID
            let vesselID = parseInt(req.user.vessel_id);
            data.createdBy = parseInt(req.user.user_id);
            let missingFields = [];

            if (!data.createdBy) missingFields.push("createdBy");
            // Validate required fields
            if (!data.tankIdentity) missingFields.push("tankIdentity");
            if (!data.dischargeMethod) missingFields.push("dischargeMethod");
            if (!data.startTime) missingFields.push("startTime");
            if (!data.stopTime) missingFields.push("stopTime");


            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await crbService.createRecord7(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "Ballast Water Discharge Facility record created successfully.",
                    operationID: result.operationID,
                    operationType: 7
                });
            } else {
                res.status(500).json({ message: "Failed to create record." });
            }
        } catch (err) {
            console.error("Error in createRecord2 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    } async function createRecord8(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID
            let vesselID = parseInt(req.user.vessel_id);
            data.createdBy = parseInt(req.user.user_id);
            let missingFields = [];

            if (!data.createdBy) missingFields.push("createdBy");
            // Validate required fields
            if (!data.tankDetails) missingFields.push("tankDetails");
            if (data.wereWashingsDischarged === undefined) missingFields.push("wereWashingsDischarged");
            if (data.wereWashingsDischarged && data.dischargeRate === undefined) {
                missingFields.push("dischargeRate");
            }
            if (data.wereWashingsDischarged && data.quantityDischarged === undefined) {
                missingFields.push("quantityDischarged");
            }
            if (data.wereWashingsDischarged && !data.startTime) {
                missingFields.push("startTime");
            }
            if (data.wereWashingsDischarged && !data.stopTime) {
                missingFields.push("stopTime");
            }
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await crbService.createRecord8(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "Ballast Water Discharge Facility record created successfully.",
                    operationID: result.operationID,
                    operationType: 8
                });
            } else {
                res.status(500).json({ message: "Failed to create record." });
            }
        } catch (err) {
            console.error("Error in createRecord2 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    } async function createRecord9(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID
            let vesselID = parseInt(req.user.vessel_id);
            data.createdBy = parseInt(req.user.user_id);
            let missingFields = [];

            if (!data.createdBy) missingFields.push("createdBy");
            // Validate required fields
            if (!data.nameOfCargo) missingFields.push("nameOfCargo");
            if (!data.categoryOfCargo) missingFields.push("categoryOfCargo");
            if (!data.tankFrom) missingFields.push("tankFrom");
            if (!data.tankTo) missingFields.push("tankTo");
            if (data.wasTankEmptied === undefined) missingFields.push("wasTankEmptied");

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await crbService.createRecord9(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "Ballast Water Discharge Facility record created successfully.",
                    operationID: result.operationID,
                    operationType: 9
                });
            } else {
                res.status(500).json({ message: "Failed to create record." });
            }
        } catch (err) {
            console.error("Error in createRecord2 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
    async function createRecord10(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID
            let vesselID = parseInt(req.user.vessel_id);
            data.createdBy = parseInt(req.user.user_id);
            let missingFields = [];

            if (!data.createdBy) missingFields.push("createdBy");
            // Validate required fields
            if (!data.placeOfUnloading) missingFields.push("placeOfUnloading");
            if (!data.tanksUnloaded) missingFields.push("tanksUnloaded");
            if (data.wasTankEmptied === undefined) missingFields.push("wasTankEmptied");
            if (data.prewashRequired === undefined) missingFields.push("prewashRequired");

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await crbService.createRecord10(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "Ballast Water Discharge Facility record created successfully.",
                    operationID: result.operationID,
                    operationType: 10
                });
            } else {
                res.status(500).json({ message: "Failed to create record." });
            }
        } catch (err) {
            console.error("Error in createRecord2 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
    async function createRecord11(req, res) {
        try {
            const data = req.body.operationData;
            let vesselID = parseInt(req.user.vessel_id);
            data.createdBy = parseInt(req.user.user_id);
            let missingFields = [];

            if (!data.createdBy) missingFields.push("createdBy");
            // Validate required fields
            if (!data.placeOfLoading) missingFields.push("placeOfLoading");
            if (!data.tankIdentity) missingFields.push("tankIdentity");
            if (!data.nameOfSubstance) missingFields.push("nameOfSubstance");
            if (!data.category) missingFields.push("category");

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await crbService.createRecord11(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "Ballast Water Discharge Facility record created successfully.",
                    operationID: result.operationID,
                    operationType: 10
                });
            } else {
                res.status(500).json({ message: "Failed to create record." });
            }
        } catch (err) {
            console.error("Error in createRecord2 controller:", err);
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
}

async function fetchRecords(req, res) {
    try {
        const records = await crbService.fetchRecords(req.user.vessel_id);
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
            let verified=await crbService.setRecordVerified(recordId,verifiedBy,vesselId);

            if(!verified){
                return res.status(500).send({message:"can't verifiy the record"});
            }

            return res.status(200).json({message:"Record verified"});
        }else if(Number(operation)===2){
            let rejected=await crbService.setRecordRejected(recordId,verifiedBy,vesselId,remarks);

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
export default { createRecord, fetchRecords, updateRecordVerificationStatus};