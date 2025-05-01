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
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (createdAt, createdBy, vesselID,verifiedBy, approvedBy, verifiedAt, accidentalDischarge_ID, approvedStatus)
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
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (additionalProcedures_ID, createdAt,verifiedBy, approvedBy, verifiedAt, createdBy, vesselID, approvedStatus)
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
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (ballastingCargoTanks_ID, createdAt,verifiedBy, approvedBy, verifiedAt, createdBy, vesselID, approvedStatus)
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
                .input("verifiedBy", data.createdBy)
                .input("approvedBy", data.createdBy)
                .input("verifiedAt", new Date())
                .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (cargoPrewash_ID, createdAt, createdBy,verifiedBy, approvedBy, verifiedAt, vesselID, approvedStatus)
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
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (cleaningCargoTanks_ID, createdAt, createdBy,verifiedBy, approvedBy, verifiedAt, vesselID, approvedStatus)
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
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (controlSurveyors_ID, createdAt, createdBy, vesselID,verifiedBy, approvedBy, verifiedAt, approvedStatus)
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
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .input("approvedStatus", 0)
            .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (dischargeBallastWater_ID, createdAt, createdBy,verifiedBy, approvedBy, verifiedAt, vesselID, approvedStatus)
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
            .input("dischargeRate", data.wereWashingsDischarged ? parseFloat(data.dischargeRate) : null)
            .input("quantityDischarged", data.wereWashingsDischarged ? parseFloat(data.quantityDischarged) : null)
            .input("startTime", data.wereWashingsDischarged ? data.startTime : null)
            .input("stopTime", data.wereWashingsDischarged ? data.stopTime : null)
            .input("shipSpeed", data.shipSpeed !== undefined ? parseFloat(data.shipSpeed) : null)
            .query(`
            INSERT INTO tbl_crb_dischargeSea_formEntries (
                tankDetails, wereWashingsDischarged, dischargeRate,
                quantityDischarged, startTime, stopTime, shipSpeed
            )
            OUTPUT inserted.operationID
            VALUES (
                @tankDetails, @wereWashingsDischarged, @dischargeRate,
                @quantityDischarged, @startTime, @stopTime, @shipSpeed
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
            .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (dischargeSea_ID, createdAt, createdBy, vesselID,verifiedBy, approvedBy, verifiedAt, approvedStatus)
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
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (internalTransfer_ID, createdAt, createdBy, vesselID, verifiedBy, approvedBy, verifiedAt,approvedStatus)
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
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())
            .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (unloadingCargo_ID, createdAt, createdBy, vesselID,verifiedBy, approvedBy, verifiedAt, approvedStatus)
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
            .input("verifiedBy", data.createdBy)
            .input("approvedBy", data.createdBy)
            .input("verifiedAt", new Date())

            .query(`
                INSERT INTO  tbl_crb_cargoRecord 
                    (loadingCargo_ID, createdAt, createdBy, vesselID,verifiedBy, approvedBy, verifiedAt, approvedStatus)
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
    r.createdBy, r.vesselID, r.loadingCargo_ID, r.verifiedBy, r.verifiedAt, r.verificationStatus, r.verificationRemarks,
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

        const mainRecords = result.recordset;
        const completeRecords = [];

        for (const record of mainRecords) {
            const completeRecord = { ...record };

            // Check each ID field and query the corresponding table if not null
            if (record.loadingCargo_ID) {
                const loadingResult = await pool.request()
                    .input('id', record.loadingCargo_ID)
                    .query('SELECT * FROM [dbo].[tbl_crb_loadingCargo_formEntries] WHERE operationID = @id');
                completeRecord.loadingData = loadingResult.recordset[0] || null;
            }

            if (record.ballastingCargoTanks_ID) {
                const ballastCargoResult = await pool.request()
                    .input('id', record.ballastingCargoTanks_ID)
                    .query('SELECT * FROM [dbo].[tbl_crb_ballastingCargoTanks_formEntries] WHERE operationID = @id');
                completeRecord.ballastCargoData = ballastCargoResult.recordset[0] || null;
            }

            if (record.additionalProcedures_ID) {
                const additionalResult = await pool.request()
                    .input('id', record.additionalProcedures_ID)
                    .query('SELECT * FROM [dbo].[tbl_crb_additionalProcedures_formEntries] WHERE operationID = @id');
                completeRecord.additionalData = additionalResult.recordset[0] || null;
            }

            if (record.internalTransfer_ID) {
                const internalResult = await pool.request()
                    .input('id', record.internalTransfer_ID)
                    .query('SELECT * FROM [dbo].[tbl_crb_internalTransfer_formEntries] WHERE operationID = @id');
                completeRecord.internalData = internalResult.recordset[0] || null;
            }

            if (record.dischargeSea_ID) {
                const dischargeSeaResult = await pool.request()
                    .input('id', record.dischargeSea_ID)
                    .query('SELECT * FROM [dbo].[tbl_crb_dischargeSea_formEntries] WHERE operationID = @id');
                completeRecord.dischargeSeaData = dischargeSeaResult.recordset[0] || null;
            }
            if (record.cargoPrewash_ID) {
                const cargoPrewashResult = await pool.request()
                    .input('id', record.cargoPrewash_ID)
                    .query('SELECT * FROM [dbo].[tbl_crb_cargoPrewash_formEntries] WHERE operationID = @id');
                completeRecord.cargoPrewashData = cargoPrewashResult.recordset[0] || null;
            }
            if (record.controlSurveyors_ID) {
                const controlSurveyorsResult = await pool.request()
                    .input('id', record.controlSurveyors_ID)
                    .query('SELECT * FROM [dbo].[tbl_crb_controlSurveyors_formEntries] WHERE operationID = @id');
                completeRecord.controlSurveyorsData = controlSurveyorsResult.recordset[0] || null;
            }
            if (record.accidentalDischarge_ID) {
                const accidentalDischargeResult = await pool.request()
                    .input('id', record.accidentalDischarge_ID)
                    .query('SELECT * FROM [dbo].[tbl_crb_accidentalDischarge_formEntries] WHERE operationID = @id');
                completeRecord.accidentalDischargeData = accidentalDischargeResult.recordset[0] || null;
            }
            if (record.dischargeBallastWater_ID) {
                const dischargeSeaResult = await pool.request()
                    .input('id', record.dischargeBallastWater_ID)
                    .query('SELECT * FROM [dbo].[tbl_crb_dischargeBallastWater_formEntries] WHERE operationID = @id');
                completeRecord.dischargeSeaData = dischargeSeaResult.recordset[0] || null;
            }
            if (record.unloadingCargo_ID) {
                const unloadingCargoResult = await pool.request()
                    .input('id', record.unloadingCargo_ID)
                    .query('SELECT * FROM [dbo].[tbl_crb_unloadingCargo_formEntries] WHERE operationID = @id');
                completeRecord.unloadingCargoData = unloadingCargoResult.recordset[0] || null;
            }
            if (record.cleaningCargoTanks_ID) {
                const cleaningCargoTanksResult = await pool.request()
                    .input('id', record.cleaningCargoTanks_ID)
                    .query('SELECT * FROM [dbo].[tbl_crb_cleaningCargoTanks_formEntries] WHERE operationID = @id');
                completeRecord.cleaningCargoTanksData = cleaningCargoTanksResult.recordset[0] || null;
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
                    ...(record.loadingData && { loadingData: record.loadingData }),
                    ...(record.ballastCargoData && { ballastCargoData: record.ballastCargoData }),
                    ...(record.additionalData && { additionalData: record.additionalData }),
                    ...(record.dischargeFacilityData && { dischargeFacilityData: record.dischargeFacilityData }),
                    ...(record.internalData && { dischargeFacilityData: record.internalData }),
                    ...(record.cargoPrewashData && { cargoPrewashData: record.cargoPrewashData }),
                    ...(record.controlSurveyorsData && { controlSurveyorsData: record.controlSurveyorsData }),
                    ...(record.accidentalDischargeData && { accidentalDischargeData: record.accidentalDischargeData }),
                    ...(record.dischargeSeaData && { dischargeSeaData: record.dischargeSeaData }),
                    ...(record.unloadingCargoData && { unloadingCargoData: record.unloadingCargoData }),
                    ...(record.cleaningCargoTanksData && { cleaningCargoTanksData: record.cleaningCargoTanksData })
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

export default { createRecord1, createRecord2, createRecord3, createRecord4, createRecord5, createRecord6, createRecord7, createRecord8, createRecord9, createRecord10, createRecord11, fetchRecords };
