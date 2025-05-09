import { getPool } from "../config/DBConfig.js";

async function createRecord1(data, vesselID) {
    const pool = await getPool(); // Ensure fresh connection
    const transaction = pool.transaction();
    try {
        await transaction.begin();

        const formResult = await pool.request()
            // Base fields
            .input("tankIdentity", data.tankIdentity)
            .input("cleanedSinceLastOil", Boolean(data.cleanedSinceLastOil))
            .input("tankNumber", data.tankNumber || null)

            // Cleaning process fields (conditionally included)
            .input("cleaningProcessStartLatitude", data.cleanedSinceLastOil ? data.cleaningProcessStartLatitude || null : null)
            .input("cleaningProcessStartLongitude", data.cleanedSinceLastOil ? data.cleaningProcessStartLongitude || null : null)
            .input("cleaningProcessStartTime", data.cleanedSinceLastOil ? data.cleaningProcessStartTime : null)
            .input("cleaningProcessEndLatitude", data.cleanedSinceLastOil ? data.cleaningProcessEndLatitude || null : null)
            .input("cleaningProcessEndLongitude", data.cleanedSinceLastOil ? data.cleaningProcessEndLongitude || null : null)
            .input("cleaningProcessEndTime", data.cleanedSinceLastOil ? data.cleaningProcessEndTime : null)
            .input("tankForCleaningWaterTransfer", data.cleanedSinceLastOil ? data.tankForCleaningWaterTransfer || null : null)
            .input("cleaningMethod", data.cleanedSinceLastOil ? data.cleaningMethod : null)
            .input("chemicalsUsed", data.cleanedSinceLastOil ? parseFloat(data.chemicalsUsed) || null : null)

            // Ballasting fields (conditionally included)
            .input("ballastingStartLatitude", !data.cleanedSinceLastOil ? data.ballastingStartLatitude || null : null)
            .input("ballastingStartLongitude", !data.cleanedSinceLastOil ? data.ballastingStartLongitude || null : null)
            .input("ballastingStartTime", !data.cleanedSinceLastOil ? data.ballastingStartTime : null)
            .input("ballastingEndLatitude", !data.cleanedSinceLastOil ? data.ballastingEndLatitude || null : null)
            .input("ballastingEndLongitude", !data.cleanedSinceLastOil ? data.ballastingEndLongitude || null : null)
            .input("ballastingEndTime", !data.cleanedSinceLastOil ? data.ballastingEndTime : null)
            .input("quantityBallastIfNotCleaned", !data.cleanedSinceLastOil ? parseFloat(data.quantityBallastIfNotCleaned) : null)

            .query(`
            INSERT INTO tbl_orb1_BallastingCleaning (
                tankIdentity, cleanedSinceLastOil, cleaningProcessStartLatitude, cleaningProcessStartLongitude,
                cleaningProcessStartTime, cleaningProcessEndLatitude, cleaningProcessEndLongitude,
                cleaningProcessEndTime, tankNumber, tankForCleaningWaterTransfer, cleaningMethod,
                chemicalsUsed, ballastingStartLatitude, ballastingStartLongitude, ballastingStartTime,
                ballastingEndLatitude, ballastingEndLongitude, ballastingEndTime, quantityBallastIfNotCleaned
            )
            OUTPUT inserted.operationID
            VALUES (
                @tankIdentity, @cleanedSinceLastOil, @cleaningProcessStartLatitude, @cleaningProcessStartLongitude,
                @cleaningProcessStartTime, @cleaningProcessEndLatitude, @cleaningProcessEndLongitude,
                @cleaningProcessEndTime, @tankNumber, @tankForCleaningWaterTransfer, @cleaningMethod,
                @chemicalsUsed, @ballastingStartLatitude, @ballastingStartLongitude, @ballastingStartTime,
                @ballastingEndLatitude, @ballastingEndLongitude, @ballastingEndTime, @quantityBallastIfNotCleaned
            )
        `);
        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await transaction.request()
            .input("accidentalDischarge_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .input("approvedStatus", 0)
            .input("verificationStatus", 0)
            .query(`
                INSERT INTO tbl_orb1_main 
                    (createdAt, createdBy, approvedBy, vesselID, ballastingCleaning_operationID, approvedStatus)
                VALUES 
                    (@createdAt, @createdBy, @approvedBy, @vesselID, @accidentalDischarge_ID, @approvedStatus)
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
            .input("tankIdentity", data.tankIdentity)
            .input("startPosition", data.startPosition)
            .input("endPosition", data.endPosition)
            .input("shipSpeedDuringDischarge", data.shipSpeedDuringDischarge !== undefined ? parseFloat(data.shipSpeedDuringDischarge) : null) // Optional
            .input("dischargeMethod", data.dischargeMethod)
            .input("quantityDischarged", parseFloat(data.quantityDischarged))
            .query(`
            INSERT INTO tbl_orb1_DischargeDirtyBallast (
                tankIdentity, startPosition, endPosition,
                shipSpeedDuringDischarge, dischargeMethod, quantityDischarged
            )
            OUTPUT inserted.operationID
            VALUES (
                @tankIdentity, @startPosition, @endPosition,
                @shipSpeedDuringDischarge, @dischargeMethod, @quantityDischarged
            )
        `);
        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeFacility_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .input("approvedStatus", 0)
            .input("verificationStatus", 0)

            .query(`
                INSERT INTO tbl_orb1_main 
                    (dischargeDirtyBallast_operationID, createdAt, createdBy, approvedBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @approvedBy, @vesselID, @approvedStatus)
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
            // Collection fields
            .input("collectionTankIdentity", data.collectionTankIdentity)
            .input("collectionTankCapacity", parseFloat(data.collectionTankCapacity))
            .input("collectionTotalQuantityRetained", parseFloat(data.collectionTotalQuantityRetained))
            .input("collectionQuantityCollectedManually",
                data.collectionQuantityCollectedManually !== undefined ? parseFloat(data.collectionQuantityCollectedManually) : null)

            // Transfer/Disposal fields
            .input("transferDisposalMethod", data.transferDisposalMethod)
            .input("transferDisposalQuantity",
                data.transferDisposalQuantity !== undefined ? parseFloat(data.transferDisposalQuantity) : null)
            .input("transferDisposalTanksEmptied", data.transferDisposalTanksEmptied || null)
            .input("transferDisposalQuantityRetained",
                data.transferDisposalQuantityRetained !== undefined ? parseFloat(data.transferDisposalQuantityRetained) : null)

            .query(`
            INSERT INTO tbl_orb1_OilResidues (
                collectionTankIdentity, collectionTankCapacity, collectionTotalQuantityRetained,
                collectionQuantityCollectedManually, transferDisposalMethod, transferDisposalQuantity,
                transferDisposalTanksEmptied, transferDisposalQuantityRetained
            )
            OUTPUT inserted.operationID
            VALUES (
                @collectionTankIdentity, @collectionTankCapacity, @collectionTotalQuantityRetained,
                @collectionQuantityCollectedManually, @transferDisposalMethod, @transferDisposalQuantity,
                @transferDisposalTanksEmptied, @transferDisposalQuantityRetained
            )
        `);

        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeSea_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .input("approvedStatus", 0)
            .input("verificationStatus", 0)

            .query(`
                INSERT INTO tbl_orb1_main 
                    (oilResidues_operationID,  createdAt, createdBy, approvedBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeSea_ID, @createdAt, @createdBy, @approvedBy, @vesselID, @approvedStatus)
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
            .input("tankIdentity", data.tankIdentity)
            .input("tankCapacity", parseFloat(data.tankCapacity))
            .input("totalQuantityRetention", parseFloat(data.totalQuantityRetention))
            .input("quantityResidueCollectedManually", data.quantityResidueCollectedManually)
            .input("methodsTransferDisposal", data.methodsTransferDisposal)
            .query(`
                INSERT INTO [db_owner].[tbl_orb1_NonAutoBilgeWater] (
                    tankIdentity, tankCapacity, totalQuantityRetention,
                    quantityResidueCollectedManually, methodsTransferDisposal
                )
                OUTPUT inserted.operationID
                VALUES (
                    @tankIdentity, @tankCapacity, @totalQuantityRetention,
                    @quantityResidueCollectedManually, @methodsTransferDisposal
                )
            `);
        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeFacility_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .input("verificationStatus", 0)

            .query(`
                INSERT INTO  tbl_orb1_main 
                    (nonAutoBilgeWater_operationID,  createdAt, createdBy, approvedBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @approvedBy, @vesselID, @approvedStatus)
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
            // Discharge overboard fields
            .input("dischargeOverboardTime", data.dischargeOverboardTime || null)
            .input("dischargeOverboardLatitude", data.dischargeOverboardLatitude || null)
            .input("dischargeOverboardLongitude", data.dischargeOverboardLongitude || null)

            // Transfer to holding tank fields
            .input("transferToHoldingTankTime", data.transferToHoldingTankTime || null)
            .input("transferToHoldingTankLatitude", data.transferToHoldingTankLatitude || null)
            .input("transferToHoldingTankLongitude", data.transferToHoldingTankLongitude || null)

            // Manual mode field
            .input("systemPutToManualModeTime", data.systemPutToManualModeTime || null)

            .query(`
            INSERT INTO tbl_orb1_AutoBilgeWater (
                dischargeOverboardTime, dischargeOverboardLatitude, dischargeOverboardLongitude,
                transferToHoldingTankTime, transferToHoldingTankLatitude, transferToHoldingTankLongitude,
                systemPutToManualModeTime
            )
            OUTPUT inserted.operationID
            VALUES (
                @dischargeOverboardTime, @dischargeOverboardLatitude, @dischargeOverboardLongitude,
                @transferToHoldingTankTime, @transferToHoldingTankLatitude, @transferToHoldingTankLongitude,
                @systemPutToManualModeTime
            )
        `);

        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeFacility_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .input("verifiedBy", data.createdBy)
            .input("verificationStatus", 0)

            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .query(`
                INSERT INTO tbl_orb1_main 
                    (autoBilgeWater_operationID, createdAt, createdBy, approvedBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID,@createdAt, @createdBy, @approvedBy, @vesselID, @approvedStatus)
            `);

        return { success: true, operationID };
    } catch (err) {
        console.error("Ballast Water Discharge Facility Service Error:", err.message);
        throw err;
    }
}

async function createRecord6(data, vesselID) {
    const pool = await getPool();
    try {
        const formResult = await pool.request()
            .input("systemFailureTime", data.systemFailureTime)
            .input("systemOperationalTime", data.systemOperationalTime)
            .input("failureReason", data.failureReason)
            .query(`
        INSERT INTO tbl_orb1_OilFiltering 
            (systemFailureTime, systemOperationalTime, failureReason)
        OUTPUT inserted.operationID
        VALUES 
            (@systemFailureTime, @systemOperationalTime, @failureReason)
    `);


        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeFacility_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .input("verificationStatus", 0)

            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .query(`
                INSERT INTO tbl_orb1_main 
                    (oilFiltering_operationID,  createdAt, createdBy, approvedBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @approvedBy, @vesselID, @approvedStatus)
            `);

        return { success: true, operationID };
    } catch (err) {
        console.error("Ballast Water Discharge Facility Service Error:", err.message);
        throw err;
    }
}

async function createRecord7(data, vesselID) {
    const pool = await getPool();
    try {
        const formResult = await pool.request()
            .input("timeOfOccurrence", data.timeOfOccurrence)
            .input("latitude", data.latitude)
            .input("longitude", data.longitude)
            .input("quantityOfOil", parseFloat(data.quantityOfOil))
            .input("typeOfOil", data.typeOfOil)
            .input("circumstancesOfDischarge", data.circumstancesOfDischarge)
            .input("actionsTaken", data.actionsTaken)
            .input("remarks", data.remarks || null) // Optional field
            .query(`
            INSERT INTO tbl_orb1_AccidentalDischarges (
                timeOfOccurrence, latitude, longitude,
                quantityOfOil, typeOfOil, circumstancesOfDischarge,
                actionsTaken, remarks
            )
            OUTPUT inserted.operationID
            VALUES (
                @timeOfOccurrence, @latitude, @longitude,
                @quantityOfOil, @typeOfOil, @circumstancesOfDischarge,
                @actionsTaken, @remarks
            )
        `);
        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeFacility_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("verificationStatus", 0)
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())

            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO tbl_orb1_main 
                    (accidentalDischarges_operationID, createdAt, createdBy, approvedBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @approvedBy, @vesselID, @approvedStatus)
            `);

        return { success: true, operationID };
    } catch (err) {
        console.error("Ballast Water Discharge Facility Service Error:", err.message);
        throw err;
    }
}
async function createRecord8(data, vesselID) {
    const pool = await getPool();
    try {
        const formResult = await pool.request()
            .input("placeOfBunkering", data.placeOfBunkering)
            .input("timeOfBunkering", data.timeOfBunkering)
            // Fuel oil parameters
            .input("fuelOilType", data.fuelOilType || null)
            .input("fuelOilQuantityAdded", data.fuelOilQuantityAdded !== undefined ? parseFloat(data.fuelOilQuantityAdded) : null)
            .input("fuelOilTotalContent", data.fuelOilTotalContent !== undefined ? parseFloat(data.fuelOilTotalContent) : null)
            .input("fuelOilTankIdentity", data.fuelOilTankIdentity || null)
            // Lubricating oil parameters
            .input("lubricatingOilType", data.lubricatingOilType || null)
            .input("lubricatingOilQuantityAdded", data.lubricatingOilQuantityAdded !== undefined ? parseFloat(data.lubricatingOilQuantityAdded) : null)
            .input("lubricatingOilTotalContent", data.lubricatingOilTotalContent !== undefined ? parseFloat(data.lubricatingOilTotalContent) : null)
            .input("lubricatingOilTankIdentity", data.lubricatingOilTankIdentity || null)
            .query(`
            INSERT INTO tbl_orb1_Bunkering (
                placeOfBunkering, timeOfBunkering,
                fuelOilType, fuelOilQuantityAdded, fuelOilTotalContent, fuelOilTankIdentity,
                lubricatingOilType, lubricatingOilQuantityAdded, lubricatingOilTotalContent, lubricatingOilTankIdentity
            )
            OUTPUT inserted.operationID
            VALUES (
                @placeOfBunkering, @timeOfBunkering,
                @fuelOilType, @fuelOilQuantityAdded, @fuelOilTotalContent, @fuelOilTankIdentity,
                @lubricatingOilType, @lubricatingOilQuantityAdded, @lubricatingOilTotalContent, @lubricatingOilTankIdentity
            )
        `);


        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeFacility_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("verificationStatus", 0)

            .input("approvedStatus", 0)
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .query(`
                INSERT INTO tbl_orb1_main 
                    (bunkering_operationID, createdAt, createdBy, approvedBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @approvedBy, @vesselID, @approvedStatus)
            `);

        return { success: true, operationID };
    } catch (err) {
        console.error("Ballast Water Discharge Facility Service Error:", err.message);
        throw err;
    }
}
async function createRecord9(data, vesselID) {
    const pool = await getPool();
    try {
        const formResult = await pool.request()
            .input("date", data.date)
            .input("time", data.time)
            .input("remarks", data.remarks)
            .query(`
        INSERT INTO tbl_orb1_AdditionalRemarks 
            (date, time, remarks)
        OUTPUT inserted.operationID
        VALUES 
            (@date, @time, @remarks)
    `);
        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("ballastWaterDischargeFacility_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("verificationStatus", 0)

            .input("vesselID", vesselID)
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())

            .input("approvedStatus", 0)
            .query(`
                INSERT INTO tbl_orb1_main 
                    (additionalRemarks_operationID,  createdAt, createdBy, approvedBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @approvedBy, @vesselID, @approvedStatus)
            `);

        return { success: true, operationID };
    } catch (err) {
        console.error("Ballast Water Discharge Facility Service Error:", err.message);
        throw err;
    }
}

async function fetchRecords(vesselID) {
    const pool = await getPool(); 
    try {
        const result = await pool.request()
            .input('vesselID', vesselID)
            .query(`
            SELECT  
            r.recordID, 
            r.createdAt, 
            r.approvedBy, 
            r.approvedStatus,  
            r.createdBy, 
            r.vesselID,r.verifiedBy, r.verifiedAt, r.verificationStatus, r.verificationRemarks, 
            r.ballastingCleaning_operationID,
            r.dischargeDirtyBallast_operationID,
            r.oilResidues_operationID,
            r.nonAutoBilgeWater_operationID,
            r.autoBilgeWater_operationID,
            r.oilFiltering_operationID,
            r.accidentalDischarges_operationID,
            r.bunkering_operationID,
            r.additionalRemarks_operationID,
            COALESCE(u.fullName, 'Unknown') AS createdByName  
        FROM tbl_orb1_main r  
        LEFT JOIN tbl_user u ON u.user_id = r.createdBy  
        WHERE r.vesselID = @vesselID
            `);


        const mainRecords = result.recordset;
        const completeRecords = [];

        for (const record of mainRecords) {
            const completeRecord = { ...record };

            // Check each ID field and query the corresponding table if not null
            if (record.ballastingCleaning_operationID) {
                const ballastingCleaningResult = await pool.request()
                    .input('id', record.ballastingCleaning_operationID)
                    .query('SELECT * FROM [dbo].[tbl_orb1_BallastingCleaning] WHERE operationID = @id');
                completeRecord.ballastingCleaningData = ballastingCleaningResult.recordset[0] || null;
            }

            if (record.dischargeDirtyBallast_operationID) {
                const dischargeDirtyBallastResult = await pool.request()
                    .input('id', record.dischargeDirtyBallast_operationID)
                    .query('SELECT * FROM [dbo].[tbl_orb1_DischargeDirtyBallast] WHERE operationID = @id');
                completeRecord.dischargeDirtyBallastData = dischargeDirtyBallastResult.recordset[0] || null;
            }

            if (record.oilResidues_operationID) {
                const oilResiduesResult = await pool.request()
                    .input('id', record.oilResidues_operationID)
                    .query('SELECT * FROM [dbo].[tbl_orb1_OilResidues] WHERE operationID = @id');
                completeRecord.oilResiduesData = oilResiduesResult.recordset[0] || null;
            }

            if (record.nonAutoBilgeWater_operationID) {
                const nonAutoBilgeWaterResult = await pool.request()
                    .input('id', record.nonAutoBilgeWater_operationID)
                    .query('SELECT * FROM [dbo].[tbl_orb1_NonAutoBilgeWater] WHERE operationID = @id');
                completeRecord.nonAutoBilgeWaterData = nonAutoBilgeWaterResult.recordset[0] || null;
            }

            if (record.autoBilgeWater_operationID) {
                const autoBilgeWaterResult = await pool.request()
                    .input('id', record.autoBilgeWater_operationID)
                    .query('SELECT * FROM [dbo].[tbl_orb1_AutoBilgeWater] WHERE operationID = @id');
                completeRecord.autoBilgeWaterData = autoBilgeWaterResult.recordset[0] || null;
            }
            if (record.oilFiltering_operationID) {
                const oilFilteringResult = await pool.request()
                    .input('id', record.oilFiltering_operationID)
                    .query('SELECT * FROM [dbo].[tbl_orb1_OilFiltering] WHERE operationID = @id');
                completeRecord.oilFilteringData = oilFilteringResult.recordset[0] || null;
            }
            if (record.accidentalDischarges_operationID) {
                const accidentalDischargesResult = await pool.request()
                    .input('id', record.accidentalDischarges_operationID)
                    .query('SELECT * FROM [dbo].[tbl_orb1_AccidentalDischarges] WHERE operationID = @id');
                completeRecord.accidentalDischargesData = accidentalDischargesResult.recordset[0] || null;
            }
            if (record.bunkering_operationID) {
                const bunkeringResult = await pool.request()
                    .input('id', record.bunkering_operationID)
                    .query('SELECT * FROM [dbo].[tbl_orb1_Bunkering] WHERE operationID = @id');
                completeRecord.bunkeringData = bunkeringResult.recordset[0] || null;
            }
            if (record.additionalRemarks_operationID) {
                const additionalRemarksResult = await pool.request()
                    .input('id', record.additionalRemarks_operationID)
                    .query('SELECT * FROM [dbo].[tbl_orb1_AdditionalRemarks] WHERE operationID = @id');
                completeRecord.additionalRemarksData = additionalRemarksResult.recordset[0] || null;
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

                    ...(record.ballastingCleaningData && { ballastingCleaningData: record.ballastingCleaningData }),
                    ...(record.dischargeDirtyBallastData && { dischargeDirtyBallastData: record.dischargeDirtyBallastData }),
                    ...(record.oilResiduesData && { oilResiduesData: record.oilResiduesData }),
                    ...(record.nonAutoBilgeWaterData && { nonAutoBilgeWaterData: record.nonAutoBilgeWaterData }),
                    ...(record.autoBilgeWaterData && { autoBilgeWaterData: record.autoBilgeWaterData }),
                    ...(record.oilFilteringData && { oilFilteringData: record.oilFilteringData }),
                    ...(record.accidentalDischargesData && { accidentalDischargesData: record.accidentalDischargesData }),
                    ...(record.bunkeringData && { bunkeringData: record.bunkeringData }),
                    ...(record.additionalRemarksData && { additionalRemarksData: record.additionalRemarksData })
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


async function getAllUnverifiedRecords(vesselID) {
    
    try {
        const pool = await getPool();
        const request = pool.request();
        request.input('vesselID', vesselID);

        let query = `
            select 'Oil Record Book' as recordName,t. *,u.fullname from tbl_orb1_main t
                                                                left join tbl_user u on u.user_id=t.createdBy
            where t.verificationStatus=0 and t.vesselID=@vesselID;
        
        `;

        const result = await request.query(query);

        if (result.recordset.length > 0) {
            return result.recordset;
        }

        return [];

    } catch (err) {
        console.log("ORB-1 service : ", err);
        throw new Error(`Database error: ${err.message}`);
    }
}

async function setRecordVerified(recordId, verifiedBy, vesselID) {
    try {
        const pool = await getPool();
        const request = pool.request();

        const now = new Date();

        request.input('recordID', recordId);
        request.input('verifiedBy', verifiedBy);
        request.input('verifiedAt', now);
        request.input('status', 1);


        const result = await request.query(`
            UPDATE tbl_orb1_main
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
            WHERE recordID=@recordID;
        `);


        const auditRequest = pool.request();

        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'Oil Record Book');
        auditRequest.input('remarks', 'Oil-1 Record Verified');
        auditRequest.input('status', 'Verified');


        await auditRequest.query(`
            INSERT INTO tbl_audit_log (CreatedAt, CreatedBy, VesselID, RecordBook, RecordID, Operation, Remarks, Status) 
            VALUES (@verifiedAt, @verifiedBy, @vesselID, @recordBook, @recordID, @Operation, @remarks, @status);
        `);

        return !!(result.rowsAffected && result.rowsAffected[0] > 0);
    } catch (err) {
        console.error('Service error:', err);
        throw new Error(`Database error: ${err.message}`);
    }
}

async function setRecordRejected(recordId, verifiedBy, vesselID, remarks) {

    try {
        const pool = await getPool();
        const request = pool.request();

        const now = new Date();

        request.input('recordID', recordId);
        request.input('verifiedBy', verifiedBy);
        request.input('verifiedAt', now);
        request.input('status', 2);
        request.input('remarks', remarks);

        const result = await request.query(`
            UPDATE tbl_orb1_main
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status,verificationRemarks=@remarks
            WHERE recordID=@recordID;
        `);

        const auditRequest = await pool.request();

        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'Garbage Record Book');
        auditRequest.input('remarks', remarks);
        auditRequest.input('status', 'Rejected');


        await auditRequest.query(`
            INSERT INTO tbl_audit_log (CreatedAt, CreatedBy, VesselID, RecordBook, RecordID, Operation, Remarks, Status) 
            VALUES (@verifiedAt, @verifiedBy, @vesselID, @recordBook, @recordID, @Operation, @remarks, @status);
        `);

        return !!(result.rowsAffected && result.rowsAffected[0] > 0);

    } catch (err) {

        console.error('Service error:', err);
        throw new Error(`Database error: ${err.message}`);

    }
}

async function getVerifiedRecordsForUser(userId,vesselID) {
    try{

        let request=await pool.request();

        request.input('ID',userId);
        request.input('vesselID',vesselID);

        let query=`select * from tbl_orb1_main where verificationStatus=1 and verifiedBy=@ID and vesselID=@vesselID;`;

        const result = await request.query(query);

        if(result.recordset.length>0){
            return result.recordset;
        }

        return [];

    }catch(err){
        console.error('Service error:', err);
        throw new Error(`Database error: ${err.message}`);
    }
}

export default {getVerifiedRecordsForUser , createRecord1, createRecord2, createRecord3, createRecord4, createRecord5, createRecord6, createRecord7, createRecord8, createRecord9, fetchRecords, getAllUnverifiedRecords, setRecordRejected, setRecordVerified };
