import orb1Service from "../services/orb1Service.js";

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
        else {
            return res.status(400).json({
                message: "Invalid operationType. Must be 1 (orb1) or 2 (Additional Remarks)"
            });
        }
    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).json({ message: `Internal server error: ${err.message}` });
    }
    async function createRecord1(req, res, data) {
        try {
            let vesselID = parseInt(req.user.vessel_id);
            let missingFields = [];

            data.createdBy = parseInt(req.user.user_id);
            if (!data.tankIdentity) missingFields.push("tankIdentity");
            if (data.cleanedSinceLastOil === undefined) missingFields.push("cleanedSinceLastOil");

            // Conditional validation based on cleanedSinceLastOil
                if (!data.cleaningProcessStartTime) missingFields.push("cleaningProcessStartTime");
                if (!data.cleaningProcessEndTime) missingFields.push("cleaningProcessEndTime");
                if (!data.cleaningMethod) missingFields.push("cleaningMethod");
                if (!data.ballastingStartTime) missingFields.push("ballastingStartTime");
                if (!data.ballastingEndTime) missingFields.push("ballastingEndTime");
                if (!data.chemicalsUsed) missingFields.push("chemicalsUsed");
                if (!data.ballastingEndLatitude) missingFields.push("ballastingEndLatitude");
                if (!data.ballastingEndLongitude) missingFields.push("ballastingEndLongitude");
                if (!data.quantityBallastIfNotCleaned) missingFields.push("quantityBallastIfNotCleaned");
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

           
           
            const success = await orb1Service.createRecord1(data, vesselID);

            if (success) {
                res.status(201).json({
                    message: "orb1 discharge record created successfully.",
                    operationType: 1
                });
            } else {
                res.status(500).json({ message: "Failed to create orb1 record." });
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
            if (!data.tankIdentity) missingFields.push("tankIdentity");
            if (!data.startPosition) missingFields.push("startPosition");
            if (!data.endPosition) missingFields.push("endPosition");
            if (!data.dischargeMethod) missingFields.push("dischargeMethod");
            if (!data.quantityDischarged) missingFields.push("quantityDischarged");
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await orb1Service.createRecord2(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "orb1 Discharge Facility record created successfully.",
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
            // Validation for required fields
            if (!data.collectionTankIdentity) missingFields.push("collectionTankIdentity");
            if (!data.collectionTankCapacity) missingFields.push("collectionTankCapacity");
            if (!data.collectionTotalQuantityRetained) missingFields.push("collectionTotalQuantityRetained");
            if (!data.transferDisposalMethod) missingFields.push("transferDisposalMethod");
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await orb1Service.createRecord3(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "orb1 Discharge Facility record created successfully.",
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

            // Validate required fields
            let missingFields = [];
            if (!data.tankIdentity) missingFields.push("tankIdentity");
            if (!data.tankCapacity) missingFields.push("tankCapacity");
            if (!data.totalQuantityRetention) missingFields.push("totalQuantityRetention");
            if (!data.quantityResidueCollectedManually) missingFields.push("quantityResidueCollectedManually");
            if (!data.methodsTransferDisposal) missingFields.push("methodsTransferDisposal");
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await orb1Service.createRecord4(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "orb1 Discharge Facility record created successfully.",
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

            // Validate required fields
            let missingFields = [];
            if (data.dischargeOverboardTime || data.dischargeOverboardLatitude || data.dischargeOverboardLongitude) {
                if (!data.dischargeOverboardTime) missingFields.push("dischargeOverboardTime");
                if (!data.dischargeOverboardLatitude) missingFields.push("dischargeOverboardLatitude");
                if (!data.dischargeOverboardLongitude) missingFields.push("dischargeOverboardLongitude");
            }

            // Validate transfer to holding tank fields (all required together if any is present)
            if (data.transferToHoldingTankTime || data.transferToHoldingTankLatitude || data.transferToHoldingTankLongitude) {
                if (!data.transferToHoldingTankTime) missingFields.push("transferToHoldingTankTime");
                if (!data.transferToHoldingTankLatitude) missingFields.push("transferToHoldingTankLatitude");
                if (!data.transferToHoldingTankLongitude) missingFields.push("transferToHoldingTankLongitude");
            }

            // Validate at least one operation type is provided
            const operationTypesProvided = [
                data.dischargeOverboardTime,
                data.transferToHoldingTankTime,
                data.systemPutToManualModeTime
            ].some(Boolean);

            if (!operationTypesProvided) {
                missingFields.push("At least one operation time must be provided (dischargeOverboardTime, transferToHoldingTankTime, or systemPutToManualModeTime)");
            }
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await orb1Service.createRecord5(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "orb1 Discharge Facility record created successfully.",
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

            // Validate required fields
            let missingFields = [];
            if (!data.systemFailureTime) missingFields.push("systemFailureTime");
            if (!data.systemOperationalTime) missingFields.push("systemOperationalTime");
            if (!data.failureReason) missingFields.push("failureReason");
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await orb1Service.createRecord6(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "orb1 Discharge Facility record created successfully.",
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

            // Validate required fields
            let missingFields = [];
            if (!data.timeOfOccurrence) missingFields.push("timeOfOccurrence");
            if (!data.latitude) missingFields.push("latitude");
            if (!data.longitude) missingFields.push("longitude");
            if (!data.quantityOfOil) missingFields.push("quantityOfOil");
            if (!data.typeOfOil) missingFields.push("typeOfOil");
            if (!data.circumstancesOfDischarge) missingFields.push("circumstancesOfDischarge");
            if (!data.actionsTaken) missingFields.push("actionsTaken");
            
            // Validate numeric fields
            if (data.quantityOfOil !== undefined && data.quantityOfOil !== null && isNaN(parseFloat(data.quantityOfOil))) {
                missingFields.push("quantityOfOil must be a valid number");
            }
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await orb1Service.createRecord7(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "orb1 Discharge Facility record created successfully.",
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

            // Validate required fields
            let missingFields = [];
            if (!data.placeOfBunkering) missingFields.push("placeOfBunkering");
            if (!data.timeOfBunkering) missingFields.push("timeOfBunkering");
            if (!data.fuelOilType) missingFields.push("fuelOilType");
            if (!data.fuelOilQuantityAdded) missingFields.push("fuelOilQuantityAdded");
            if (!data.fuelOilTotalContent) missingFields.push("fuelOilTotalContent");
            if (!data.fuelOilTankIdentity) missingFields.push("fuelOilTankIdentity");
            if (!data.lubricatingOilType) missingFields.push("lubricatingOilType");
            if (!data.lubricatingOilQuantityAdded) missingFields.push("lubricatingOilQuantityAdded");
            if (!data.lubricatingOilTotalContent) missingFields.push("lubricatingOilTotalContent");
            if (!data.lubricatingOilTankIdentity) missingFields.push("lubricatingOilTankIdentity");
            if (!data.fuelOilType && !data.lubricatingOilType) {
                missingFields.push("fuelOilType or lubricatingOilType");
            }
            // Call service function to create the record
            const result = await orb1Service.createRecord8(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "orb1 Discharge Facility record created successfully.",
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

            // Validate required fields
            let missingFields = [];
            if (!data.date) missingFields.push("date");

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            // Call service function to create the record
            const result = await orb1Service.createRecord9(data, vesselID);

            if (result.success) {
                res.status(201).json({
                    message: "orb1 Discharge Facility record created successfully.",
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
}
async function fetchRecords(req, res) {
    try {
        const records = await orb1Service.fetchRecords(req.user.vessel_id);
        res.status(200).json({ records });
    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).json({ message: `Internal server error: ${err.message}` });
    }
}
export default { createRecord, fetchRecords };