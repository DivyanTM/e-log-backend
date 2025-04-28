import { getPool } from "../config/DBConfig.js";

async function createRecord1(data, vesselID) {
    const pool = await getPool(); // Ensure fresh connection
    const transaction = pool.transaction();
    try {
        await transaction.begin();

        const formResult = await pool.request()
            .input("occurrenceTime", data.occurrenceTime)
            .input("quantity", parseFloat(data.quantity) || 0)  // decimal(10,2)
            .input("substance", data.substance)
            .input("category", data.category)
            .input("circumstances", data.circumstances)
            .input("remarks", data.remarks)
            .query(`
        INSERT INTO tbl_crb_accidentalDischarge_formEntries 
            (occurrenceTime, quantity, substance, category, circumstances, remarks)
        OUTPUT inserted.operationID
        VALUES 
            (@occurrenceTime, @quantity, @substance, @category, @circumstances, @remarks)
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
                INSERT INTO  tbl_crb_cargoRecord 
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
            .input("remarks", data.remarks)
            .query(`
            INSERT INTO tbl_crb_additionalProcedures_formEntries 
                (remarks, recordDate, recordTime)
            OUTPUT inserted.operationID
            VALUES 
                (@remarks, GETDATE(), GETDATE())
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
                INSERT INTO  tbl_crb_cargoRecord 
                    (additionalProcedures_ID, createdAt, createdBy, vesselID, approvedStatus)
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
            .input("tankIdentity", data.tankIdentity)
            .input("startTime", data.startTime)
            .query(`
        INSERT INTO tbl_crb_ballastingCargoTanks_formEntries 
            (tankIdentity, startTime)
        OUTPUT inserted.operationID
        VALUES 
            (@tankIdentity, @startTime)
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
                INSERT INTO  tbl_crb_cargoRecord 
                    (ballastingCargoTanks_ID, createdAt, createdBy, vesselID, approvedStatus)
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
                .input("tankDetails", data.tankDetails)
                .input("numCleaningMachines", parseInt(data.numCleaningMachines) || 0)
                .input("washDuration", parseInt(data.washDuration) || 0)
                .input("washType", data.washType)
                .input("unloadingPortFacility", data.unloadingPortFacility)
                .input("otherFacility", data.otherFacility || null)  // Optional field
                .input("tankWashingsTransferred", parseFloat(data.tankWashingsTransferred) || 0)
                .input("transferDateTime", data.transferDateTime)
                .query(`
                    INSERT INTO tbl_crb_cargoPrewash_formEntries 
                        (tankDetails, numCleaningMachines, washDuration, washType, 
                         unloadingPortFacility, otherFacility, tankWashingsTransferred, transferDateTime)
                    OUTPUT inserted.operationID
                    VALUES 
                        (@tankDetails, @numCleaningMachines, @washDuration, @washType,
                         @unloadingPortFacility, @otherFacility, @tankWashingsTransferred, @transferDateTime)
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
                INSERT INTO  tbl_crb_cargoRecord 
                    (cargoPrewash_ID, createdAt, createdBy, vesselID, approvedStatus)
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
            .input("cleaningTime", data.cleaningTime)
            .input("tankDetails", data.tankDetails)
            .input("washingProcedure", data.washingProcedure)
            .input("cleaningAgent", data.cleaningAgent || null) // Optional
            .input("cleaningAgentQuantity", parseFloat(data.cleaningAgentQuantity) || 0)
            .input("numFansUsed", parseInt(data.numFansUsed) || 0)
            .input("ventilationDuration", parseInt(data.ventilationDuration) || 0)
            .input("intoSea", Boolean(data.intoSea)) // Convert to bit/boolean
            .input("receptionFacility", data.receptionFacility || null) // Optional
            .input("slopTank", data.slopTank || null) // Optional
            .input("tankWashingsTransferred", parseFloat(data.tankWashingsTransferred) || 0)
            .input("transferDateTime", data.transferDateTime)
            .query(`
                INSERT INTO tbl_crb_cleaningCargoTanks_formEntries (
                    cleaningTime, tankDetails, washingProcedure, cleaningAgent,
                    cleaningAgentQuantity, numFansUsed, ventilationDuration, intoSea,
                    receptionFacility, slopTank, tankWashingsTransferred, transferDateTime
                )
                OUTPUT inserted.operationID
                VALUES (
                    @cleaningTime, @tankDetails, @washingProcedure, @cleaningAgent,
                    @cleaningAgentQuantity, @numFansUsed, @ventilationDuration, @intoSea,
                    @receptionFacility, @slopTank, @tankWashingsTransferred, @transferDateTime
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
                INSERT INTO  tbl_crb_cargoRecord 
                    (cleaningCargoTanks_ID, createdAt, createdBy, vesselID, approvedStatus)
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
            .input("port", data.port)
            .input("tankDetails", data.tankDetails)
            .input("substances", data.substances)
            .input("categories", data.categories)
            .input("tanksEmptied", Boolean(data.tanksEmptied))
            .input("prewashDone", Boolean(data.prewashDone))
            .input("tankWashingsDischarged", Boolean(data.tankWashingsDischarged))
            .input("exemptionGranted", Boolean(data.exemptionGranted))
            .input("exemptionReason", data.exemptionReason || null) // Required only if exemptionGranted is true
            .input("surveyorName", data.surveyorName || null) // Optional
            .input("surveyorSignature", data.surveyorSignature || null) // Optional
            .input("organization", data.organization || null) // Optional
            .query(`
            INSERT INTO tbl_crb_controlSurveyors_formEntries (
                port, tankDetails, substances, categories,
                tanksEmptied, prewashDone, tankWashingsDischarged,
                exemptionGranted, exemptionReason, surveyorName,
                surveyorSignature, organization
            )
            OUTPUT inserted.operationID
            VALUES (
                @port, @tankDetails, @substances, @categories,
                @tanksEmptied, @prewashDone, @tankWashingsDischarged,
                @exemptionGranted, @exemptionReason, @surveyorName,
                @surveyorSignature, @organization
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
                INSERT INTO  tbl_crb_cargoRecord 
                    (controlSurveyors_ID, createdAt, createdBy, vesselID, approvedStatus)
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
            .input("tankIdentity", data.tankIdentity)
            .input("dischargeMethod", data.dischargeMethod)
            .input("receptionFacility", data.receptionFacility || null) // Optional
            .input("startTime", data.startTime)
            .input("stopTime", data.stopTime)
            .input("shipSpeed", data.shipSpeed !== undefined ? parseFloat(data.shipSpeed) : null) // Optional
            .query(`
            INSERT INTO tbl_crb_dischargeBallastWater_formEntries (
                tankIdentity, dischargeMethod, receptionFacility,
                startTime, stopTime, shipSpeed
            )
            OUTPUT inserted.operationID
            VALUES (
                @tankIdentity, @dischargeMethod, @receptionFacility,
                @startTime, @stopTime, @shipSpeed
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
                INSERT INTO  tbl_crb_cargoRecord 
                    (dischargeBallastWater_ID, createdAt, createdBy, vesselID, approvedStatus)
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
            .input("tankDetails", data.tankDetails)
            .input("wereWashingsDischarged", Boolean(data.wereWashingsDischarged))
            .input("dischargeRate", data.dischargeRate)
            .input("quantityDischarged", data.quantityDischarged)
            .input("startTime", data.startTime )
            .input("stopTime", data.stopTime)
            .input("shipSpeed", data.shipSpeed)
            .input("wereSlopDischarged", data.wereSlopDischarged)
            .input("slopRate", data.slopRate)
            .query(`
            INSERT INTO tbl_crb_dischargeSea_formEntries (
                tankDetails, wereWashingsDischarged, dischargeRate,
                quantityDischarged, startTime, stopTime, shipSpeed, wereSlopDischarged,slopRate
            )
            OUTPUT inserted.operationID
            VALUES (
                @tankDetails, @wereWashingsDischarged, @dischargeRate,
                @quantityDischarged, @startTime, @stopTime, @shipSpeed,@wereSlopDischarged,@slopRate
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
                INSERT INTO  tbl_crb_cargoRecord 
                    (dischargeSea_ID, createdAt, createdBy, vesselID, approvedStatus)
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
            .input("nameOfCargo", data.nameOfCargo)
            .input("categoryOfCargo", data.categoryOfCargo)
            .input("tankFrom", data.tankFrom)
            .input("tankTo", data.tankTo)
            .input("wasTankEmptied", Boolean(data.wasTankEmptied))
            .query(`
            INSERT INTO tbl_crb_internalTransfer_formEntries (
                nameOfCargo, categoryOfCargo, tankFrom, tankTo, wasTankEmptied
            )
            OUTPUT inserted.operationID
            VALUES (
                @nameOfCargo, @categoryOfCargo, @tankFrom, @tankTo, @wasTankEmptied
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
                INSERT INTO  tbl_crb_cargoRecord 
                    (internalTransfer_ID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
            `);

        return { success: true, operationID };
    } catch (err) {
        console.error("Ballast Water Discharge Facility Service Error:", err.message);
        throw err;
    }
}
async function createRecord10(data, vesselID) {
    const pool = await getPool();
    try {
        const formResult = await pool.request()
            .input("placeOfUnloading", data.placeOfUnloading)
            .input("tanksUnloaded", data.tanksUnloaded)
            .input("wasTankEmptied", Boolean(data.wasTankEmptied))
            .input("prewashRequired", Boolean(data.prewashRequired))
            .input("failureTime", data.failureTime || null) // Optional
            .input("failureReason", data.failureReason || null) // Optional
            .input("operationalTime", data.operationalTime || null) // Optional
            .query(`
            INSERT INTO tbl_crb_unloadingCargo_formEntries (
                placeOfUnloading, tanksUnloaded, wasTankEmptied,
                prewashRequired, failureTime, failureReason, operationalTime
            )
            OUTPUT inserted.operationID
            VALUES (
                @placeOfUnloading, @tanksUnloaded, @wasTankEmptied,
                @prewashRequired, @failureTime, @failureReason, @operationalTime
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
                INSERT INTO  tbl_crb_cargoRecord 
                    (unloadingCargo_ID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@ballastWaterDischargeFacility_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
            `);

        return { success: true, operationID };
    } catch (err) {
        console.error("Ballast Water Discharge Facility Service Error:", err.message);
        throw err;
    }
}
async function createRecord11(data, vesselID) {
    const pool = await getPool();
    try {
        const formResult = await pool.request()
            .input("placeOfLoading", data.placeOfLoading)
            .input("tankIdentity", data.tankIdentity)
            .input("nameOfSubstance", data.nameOfSubstance)
            .input("category", data.category)
            .query(`
            INSERT INTO tbl_crb_loadingCargo_formEntries (
                placeOfLoading, tankIdentity, nameOfSubstance, category)
            OUTPUT inserted.operationID
            VALUES (
                @placeOfLoading, @tankIdentity, @nameOfSubstance, @category)
        `);

        const operationID = formResult.recordset?.[0]?.operationID;
        if (!operationID) throw new Error("Failed to retrieve operationID");

        await pool.request()
            .input("loadingCargo_ID", operationID)
            .input("createdAt", new Date())
            .input("createdBy", data.createdBy)
            .input("vesselID", vesselID)
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (loadingCargo_ID, createdAt, createdBy, vesselID, approvedStatus)
                VALUES 
                    (@loadingCargo_ID, @createdAt, @createdBy, @vesselID, @approvedStatus)
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
    r.recordID, r.createdAt, r.approvedBy, r.approvedStatus,  
    r.createdBy, r.vesselID, r.loadingCargo_ID,  
    r.ballastingCargoTanks_ID, r.additionalProcedures_ID,  
    r.internalTransfer_ID, r.dischargeSea_ID,  
    r.cargoPrewash_ID, r.controlSurveyors_ID,  
    r.accidentalDischarge_ID, r.dischargeBallastWater_ID,  
    r.unloadingCargo_ID, r.cleaningCargoTanks_ID,  
    COALESCE(u.fullName, 'Unknown') AS createdByName  
FROM tbl_crb_cargoRecord r  
LEFT JOIN tbl_user u ON u.user_id = r.createdBy  
WHERE vesselID = @vesselID
            `);

        console.log("Query result:", result.recordset.length, "records found.");
        return result.recordset;
    } catch (err) {
        console.error("Database Fetch Error:", err.message);
        throw err;
    }
}

export default { createRecord1, createRecord2, createRecord3, createRecord4, createRecord5, createRecord6, createRecord7, createRecord8, createRecord9, createRecord10, createRecord11, fetchRecords };
