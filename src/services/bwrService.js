import { getPool } from "../config/DBConfig.js";

async function createRecord1(data, vesselID) {
    const pool = await getPool(); // Ensure fresh connection
    const transaction = pool.transaction();
    try {
        await transaction.begin();

        const dischargeResult = await transaction.request()
            .input("recordDate", data.recordDate)
            .input("recordTime", data.recordTime)
            .input("position", data.position)
            .input("estimatedDischargedVolume", parseFloat(data.estimatedDischargedVolume) || 0)
            .input("circumstancesRemarks", data.circumstancesRemarks)
            .input("conformBWMPlan", data.conformBWMPlan)
            .query(`
                INSERT INTO tbl_bwr_ballastWaterAccidentalDischarge_formEntries 
                    (recordDate, recordTime, position, estimatedDischargedVolume, 
                     circumstancesRemarks, conformBWMPlan)
                OUTPUT inserted.operationID
                VALUES 
                    (@recordDate, @recordTime, @position, @estimatedDischargedVolume, 
                     @circumstancesRemarks, @conformBWMPlan)
            `);

        const operationID = dischargeResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await transaction.request()
            .input("accidentalDischarge_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO tbl_bwr_ballastWater_main 
                    (createdAt, createdBy, vesselID, accidentalDischarge_ID, approvedStatus)
                VALUES 
                    (@createdAt, @createdBy, @vesselID, @accidentalDischarge_ID, @approvedStatus)
            `);

        await transaction.commit();
        return { success: true, operationID };
    } catch (err) {
        await transaction.rollback();
        console.error("Ballast Water Service Error:", err.message);
        throw err;
    }
}

async function createRecord2(data, vesselID) {
    const pool = await getPool();
    try {
        const formResult = await pool.request()
            .input("recordDate", data.recordDate)
            .input("recordTime", data.recordTime)
            .input("position", data.position)
            .input("portFacilityName", data.portFacilityName)
            .input("estimatedDischargedVolume", parseFloat(data.estimatedDischargedVolume) || 0)
            .input("conformBWMPlan", data.conformBWMPlan)
            .query(`
                INSERT INTO tbl_bwr_ballastWaterDischargeFacility_formEntries 
                    (recordDate, recordTime, position, portFacilityName, estimatedDischargedVolume, conformBWMPlan)
                OUTPUT inserted.operationID
                VALUES 
                    (@recordDate, @recordTime, @position, @portFacilityName, @estimatedDischargedVolume, @conformBWMPlan)
            `);

        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeFacility_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO tbl_bwr_ballastWater_main 
                    (ballastWaterDischargeFacility_ID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
            `);

        return { success: true, operationID };
    } catch (err) {
        console.error("Ballast Water Discharge Facility Service Error:", err.message);
        throw err;
    }
}
async function createRecord3(data, vesselID) {
    const pool = await getPool();
    try {
        const formResult = await pool.request()
            .input("recordDate", data.recordDate)
            .input("recordTime", data.recordTime)
            .input("position", data.position)
            .input("estimatedDischargedVolume", parseFloat(data.estimatedDischargedVolume) || 0)
            .input("remainingVolume", parseFloat(data.remainingVolume) || 0)
            .input("conformBWMPlan", data.conformBWMPlan ? 1 : 0) // Ensuring BIT type (1 for true, 0 for false)
            .query(`
        INSERT INTO tbl_bwr_ballastWaterDischargeSea_formEntries 
            (recordDate, recordTime, position, estimatedDischargedVolume, remainingVolume, conformBWMPlan)
        OUTPUT inserted.operationID
        VALUES 
            (@recordDate, @recordTime, @position, @estimatedDischargedVolume, @remainingVolume, @conformBWMPlan)
    `);

        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeSea_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO tbl_bwr_ballastWater_main 
                    (ballastWaterDischargeSea_ID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeSea_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
            `);

        return { success: true, operationID };
    } catch (err) {
        console.error("Ballast Water Discharge Facility Service Error:", err.message);
        throw err;
    }
}
async function createRecord4(data, vesselID) {
    const pool = await getPool();
    try {
        const formResult = await pool.request()
            .input("recordDate", data.recordDate)
            .input("recordTime", data.recordTime)
            .input("position", data.position)
            .input("estimatedCirculatedVolume", parseFloat(data.estimatedCirculatedVolume) || 0)
            .input("treatmentSystemUsed", data.treatmentSystemUsed)
            .input("conformBWMPlan", data.conformBWMPlan ? 1 : 0) // Ensuring BIT type (1 for true, 0 for false)
            .query(`
        INSERT INTO tbl_bwr_ballastWaterTreatment_formEntries 
            (recordDate, recordTime, position, estimatedCirculatedVolume, treatmentSystemUsed, conformBWMPlan)
        OUTPUT inserted.operationID
        VALUES 
            (@recordDate, @recordTime, @position, @estimatedCirculatedVolume, @treatmentSystemUsed, @conformBWMPlan)
    `);
        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeFacility_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO tbl_bwr_ballastWater_main 
                    (ballastWaterTreatment_ID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
            `);

        return { success: true, operationID };
    } catch (err) {
        console.error("Ballast Water Discharge Facility Service Error:", err.message);
        throw err;
    }
}
async function createRecord5(data, vesselID) {
    const pool = await getPool();
    try {
        const formResult = await pool.request()
            .input("recordDate", data.recordDate)
            .input("recordTime", data.recordTime)
            .input("position", data.position)
            .input("waterDepth", parseFloat(data.waterDepth) || 0)  // Ensuring decimal(5,2)
            .input("estimatedUptakeVolume", parseFloat(data.estimatedUptakeVolume) || 0) // Ensuring decimal(10,2)
            .query(`
            INSERT INTO tbl_bwr_ballastWaterUptake_formEntries 
                (recordDate, recordTime, position, waterDepth, estimatedUptakeVolume)
            OUTPUT inserted.operationID
            VALUES 
                (@recordDate, @recordTime, @position, @waterDepth, @estimatedUptakeVolume)
        `);
        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeFacility_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO tbl_bwr_ballastWater_main 
                    (ballastWaterDischargeFacility_ID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
            `);

        return { success: true, operationID };
    } catch (err) {
        console.error("Ballast Water Discharge Facility Service Error:", err.message);
        throw err;
    }
}
async function fetchRecords(vesselID) {
    const pool = await getPool(); // Ensure fresh connection
    try {
        const result = await pool.request()
            .input('vesselID', vesselID)
            .query(`
                SELECT 
                    r.recordID, r.createdAt, r.approvedBy, r.approvedStatus, r.verifiedBy, r.verifiedAt, r.verificationStatus, r.verificationRemarks, 
                    r.createdBy, r.vesselID, r.ballastWaterUptake_ID, 
                    r.ballastWaterTreatment_ID, r.ballastWaterDischargeSea_ID, 
                    r.ballastWaterDischargeFacility_ID, r.accidentalDischarge_ID, 
                    COALESCE(u.fullName, 'Unknown') AS createdByName
                FROM tbl_bwr_ballastWater_main r
                LEFT JOIN tbl_user u ON u.user_id = r.createdBy
                WHERE vesselID = @vesselID
            `);
        const mainRecords = result.recordset;
        const completeRecords = [];

        for (const record of mainRecords) {
            const completeRecord = { ...record };

            // Check each ID field and query the corresponding table if not null
            if (record.ballastWaterUptake_ID) {
                const uptakeResult = await pool.request()
                    .input('id', record.ballastWaterUptake_ID)
                    .query('SELECT * FROM tbl_bwr_ballastWaterUptake_formEntries WHERE operationID = @id');
                completeRecord.uptakeData = uptakeResult.recordset[0] || null;
            }

            if (record.ballastWaterTreatment_ID) {
                const treatmentResult = await pool.request()
                    .input('id', record.ballastWaterTreatment_ID)
                    .query('SELECT * FROM tbl_bwr_ballastWaterTreatment_formEntries WHERE operationID = @id');
                completeRecord.treatmentData = treatmentResult.recordset[0] || null;
            }

            if (record.ballastWaterDischargeSea_ID) {
                const dischargeSeaResult = await pool.request()
                    .input('id', record.ballastWaterDischargeSea_ID)
                    .query('SELECT * FROM tbl_bwr_ballastWaterDischargeSea_formEntries WHERE operationID = @id');
                completeRecord.dischargeSeaData = dischargeSeaResult.recordset[0] || null;
            }

            if (record.ballastWaterDischargeFacility_ID) {
                const dischargeFacilityResult = await pool.request()
                    .input('id', record.ballastWaterDischargeFacility_ID)
                    .query('SELECT * FROM tbl_bwr_ballastWaterDischargeFacility_formEntries WHERE operationID = @id');
                completeRecord.dischargeFacilityData = dischargeFacilityResult.recordset[0] || null;
            }

            if (record.accidentalDischarge_ID) {
                const accidentalResult = await pool.request()
                    .input('id', record.accidentalDischarge_ID)
                    .query('SELECT * FROM tbl_bwr_ballastWaterAccidentalDischarge_formEntries WHERE operationID = @id');
                completeRecord.accidentalData = accidentalResult.recordset[0] || null;
            }

            completeRecords.push(completeRecord);
        }
        console.log("Complete result:", completeRecords);
        function cleanResultRecords(records) {
            return records.map(record => {
                // Create a new object without the ID fields
                const cleanRecord = {
                    recordID: record.recordID,
                    createdAt: record.createdAt,
                    approvedBy: record.approvedBy,
                    approvedStatus: record.approvedStatus,
                    createdBy: record.createdBy,
                    vesselID: record.vesselID,
                    createdByName: record.createdByName,
                    verifiedBy: record.verifiedBy,
                    verifiedAt: record.verifiedAt,
                    verificationStatus: record.verificationStatus,
                    verificationRemarks: record.verificationRemarks,
                    // Include any data objects that exist
                    ...(record.uptakeData && { uptakeData: record.uptakeData }),
                    ...(record.treatmentData && { treatmentData: record.treatmentData }),
                    ...(record.dischargeSeaData && { dischargeSeaData: record.dischargeSeaData }),
                    ...(record.dischargeFacilityData && { dischargeFacilityData: record.dischargeFacilityData }),
                    ...(record.accidentalData && { accidentalData: record.accidentalData })
                };

                return cleanRecord;
            });
        }

        // Usage:
        const cleanedRecords = cleanResultRecords(completeRecords);


        console.log("Query result:", result.recordset.length, "records found.");
        return cleanedRecords;
    } catch (err) {
        console.error("Database Fetch Error:", err.message);
        throw err;
    }
}

export default { createRecord1, createRecord2, createRecord3, createRecord4, createRecord5, fetchRecords };
