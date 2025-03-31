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

            if (!data.occurrenceTime) missingFields.push("occurrenceTime");
            if (data.quantity === undefined) missingFields.push("quantity");
            if (!data.substance) missingFields.push("substance");
            if (!data.category) missingFields.push("category");
            if (!data.circumstances) missingFields.push("circumstances");
            if (!data.remarks) missingFields.push("remarks");

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Missing required fields: ${missingFields.join(", ")}`
                });
            }

            if (isNaN(parseFloat(data.estimatedDischargedVolume))) {
                return res.status(400).json({ message: "Estimated discharged volume must be a number" });
            }

            if (typeof data.conformBWMPlan !== 'boolean') {
                return res.status(400).json({ message: "Conform BWM Plan must be a boolean value" });
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

            // Validate required fields
            let missingFields = [];
            if (!data.remarks) missingFields.push("remarks");

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

            // Validate required fields
            let missingFields = [];
            // Validation for required fields
            if (!data.tankIdentity) missingFields.push("tankIdentity");
            if (!data.startTime) missingFields.push("startTime");
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
    async function createRecord4(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID

            // Validate required fields
            let missingFields = [];
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
    async function createRecord5(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID

            // Validate required fields
            let missingFields = [];
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
    async function createRecord6(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID

            // Validate required fields
            let missingFields = [];
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
    } async function createRecord7(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID

            // Validate required fields
            let missingFields = [];
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
    } async function createRecord8(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID

            // Validate required fields
            let missingFields = [];
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
    } async function createRecord9(req, res) {
        try {
            const data = req.body.operationData;
            data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID

            // Validate required fields
            let missingFields = [];
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
        // } async function createRecord10(req, res) {
        //     try {
        //         const data = req.body.operationData;
        //         data.createdBy = parseInt(req.user.user_id); // Assign logged-in user ID

        //         // Validate required fields
        //         let missingFields = [];
        //         if (!data.recordDate) missingFields.push("recordDate");
        //         if (!data.recordTime) missingFields.push("recordTime");
        //         if (!data.position) missingFields.push("position");
        //         if (!data.portFacilityName) missingFields.push("portFacilityName");
        //         if (data.estimatedDischargedVolume === undefined) missingFields.push("estimatedDischargedVolume");
        //         if (data.conformBWMPlan === undefined) missingFields.push("conformBWMPlan");
        //         if (!data.vesselID) missingFields.push("vesselID");

        //         if (missingFields.length > 0) {
        //             return res.status(400).json({
        //                 message: `Missing required fields: ${missingFields.join(", ")}`
        //             });
        //         }

        //         // Call service function to create the record
        //         const result = await bwrService.createRecord2(data, vesselID);

        //         if (result.success) {
        //             res.status(201).json({
        //                 message: "Ballast Water Discharge Facility record created successfully.",
        //                 operationID: result.operationID,
        //                 operationType: 2
        //             });
        //         } else {
        //             res.status(500).json({ message: "Failed to create record." });
        //         }
        //     } catch (err) {
        //         console.error("Error in createRecord2 controller:", err);
        //         res.status(500).json({ message: "Internal Server Error", error: err.message });
        //     }
        // }
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

}

export default { createRecord, fetchRecords };