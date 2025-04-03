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
            INSERT INTO [db_owner].[tbl_orb1_BallastingCleaning] (
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
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO  tbl_orb1_main 
                    (createdAt, createdBy, vesselID, ballastingCleaning_operationID, approvedStatus)
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
            .input("tankIdentity", data.tankIdentity)
            .input("startPosition", data.startPosition)
            .input("endPosition", data.endPosition)
            .input("shipSpeedDuringDischarge", data.shipSpeedDuringDischarge !== undefined ? parseFloat(data.shipSpeedDuringDischarge) : null) // Optional
            .input("dischargeMethod", data.dischargeMethod)
            .input("quantityDischarged", parseFloat(data.quantityDischarged))
            .query(`
            INSERT INTO [db_owner].[tbl_orb1_DischargeDirtyBallast] (
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
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO  tbl_orb1_main 
                    (dischargeDirtyBallast_operationID, createdAt, createdBy, vesselID, approvedStatus)
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
            INSERT INTO [db_owner].[tbl_orb1_OilResidues] (
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
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO  tbl_orb1_main 
                    (oilResidues_operationID, createdAt, createdBy, vesselID, approvedStatus)
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
        if (missingFields.length === 0) {

            const formResult = await pool.request()
                .input("tankIdentity", data.tankIdentity)
                .input("tankCapacity", parseFloat(data.tankCapacity))
                .input("totalQuantityRetention", parseFloat(data.totalQuantityRetention))
                .input("quantityResidueCollectedManually",
                    data.quantityResidueCollectedManually !== undefined ? parseFloat(data.quantityResidueCollectedManually) : null)
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
                .query(`
                INSERT INTO  tbl_orb1_main 
                    (nonAutoBilgeWater_operationID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
            `);

            return { success: true, operationID };
        }
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
            INSERT INTO [db_owner].[tbl_orb1_AutoBilgeWater] (
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
            .query(`
                INSERT INTO  tbl_orb1_main 
                    (autoBilgeWater_operationID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
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
            .query(`
                INSERT INTO  tbl_orb1_main 
                    (oilFiltering_operationID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
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
            INSERT INTO [db_owner].[tbl_orb1_AccidentalDischarges] (
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
            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO  tbl_orb1_main 
                    (accidentalDischarges_operationID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
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
            INSERT INTO [db_owner].[tbl_orb1_Bunkering] (
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
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO  tbl_orb1_main 
                    (bunkering_operationID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
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
            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO  tbl_orb1_main 
                    (additionalRemarks_operationID, createdAt, createdBy, vesselID, approvedStatus)
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
            r.recordID, 
            r.createdAt, 
            r.approvedBy, 
            r.approvedStatus,  
            r.createdBy, 
            r.vesselID, 
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

        console.log("Query result:", result.recordset.length, "records found.");
        return result.recordset;
    } catch (err) {
        console.error("Database Fetch Error:", err.message);
        throw err;
    }
}

export default { createRecord1, createRecord2, createRecord3, createRecord4, createRecord5, createRecord6, createRecord7, createRecord8, createRecord9, fetchRecords };
