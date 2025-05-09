import LSFOService from "../services/LSFOService.js";

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
        if (!data.begin_LSFO_datetime) missingFields.push("begin_LSFO_datetime");
        if (!data.begin_LSFO_latitude) missingFields.push("begin_LSFO_latitude");
        if (!data.begin_LSFO_longitude) missingFields.push("begin_LSFO_longitude");
        if (!data.complete_LSFO_datetime) missingFields.push("complete_LSFO_datetime");
        if (!data.complete_LSFO_latitude) missingFields.push("complete_LSFO_latitude");
        if (!data.complete_LSFO_longitude) missingFields.push("complete_LSFO_longitude");
        if (!data.lsfo_volume_completion) missingFields.push("lsfo_volume_completion");
        if (!data.regulated_entry_datetime) missingFields.push("regulated_entry_datetime");
        if (!data.regulated_entry_latitude) missingFields.push("regulated_entry_latitude");
        if (!data.regulated_entry_longitude) missingFields.push("regulated_entry_longitude");
        if (!data.regulated_exit_datetime) missingFields.push("regulated_exit_datetime");
        if (!data.regulated_exit_latitude) missingFields.push("regulated_exit_latitude");
        if (!data.regulated_exit_longitude) missingFields.push("regulated_exit_longitude");
        if (!data.begin_HSFO_datetime) missingFields.push("begin_HSFO_datetime");
        if (!data.begin_HSFO_latitude) missingFields.push("begin_HSFO_latitude");
        if (!data.begin_HSFO_longitude) missingFields.push("begin_HSFO_longitude");
        if (!data.complete_HSFO_datetime) missingFields.push("complete_HSFO_datetime");
        if (!data.complete_HSFO_latitude) missingFields.push("complete_HSFO_latitude");
        if (!data.complete_HSFO_longitude) missingFields.push("complete_HSFO_longitude");
        if (!data.lsfo_volume_start) missingFields.push("lsfo_volume_start");
        if (!data.createdBy) missingFields.push("createdBy");

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(", ")}`
            });
        }

        const success = await LSFOService.createRecord(data, vesselID);

        if (success) {
            res.status(201).json({ message: "Record created successfully." });
        } else {
            res.status(500).json({ message: "Failed to create record." });
        }

    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).json({ message: `Internal server error: ${err.message}` });
    }
}

async function fetchRecords(req, res) {
    try {
        const records = await LSFOService.getRecords(req.user.vessel_id);
        res.status(200).json({ records });
    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).json({ message: `Internal server error: ${err.message}` });
    }
}

async function updateRecordVerificationStatus(req, res) {
    try {

        let data = req.body;


        if (!data) {
            return res.status(400).send({ message: "no inputs found" });
        }

        let recordId = data.recordId;
        let verifiedBy = req.user.user_id;
        let vesselId = req.user.vessel_id;
        let operation = data.operation;
        let remarks = data.remarks || null;


        if (!recordId) {
            return res.status(400).send({ message: "Record ID is required" });
        }

        if (!vesselId) {
            return res.status(400).send({ message: "Vessel ID is required" });
        }

        if (!verifiedBy) {
            return res.status(400).send({ message: "id of the verifier is missing" });
        }

        if (operation === null || operation === undefined || operation === '') {
            return res.status(400).json({ message: "Operation type is is required" });
        }


        if (Number(operation) === 1) {
            let verified = await LSFOService.setRecordVerified(recordId, verifiedBy, vesselId);

            if (!verified) {
                return res.status(500).send({ message: "can't verifiy the record" });
            }

            return res.status(200).json({ message: "Record verified" });
        } else if (Number(operation) === 2) {
            let rejected = await LSFOService.setRecordRejected(recordId, verifiedBy, vesselId, remarks);

            if (!rejected) {
                return res.status(500).send({ message: "verfication update failed", operation: "rejection" });
            }

        }

        return res.status(200).json({ message: "verification status updated" });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: err.message || "internal server error" });
    }
}

export default { createRecord, fetchRecords, updateRecordVerificationStatus };
