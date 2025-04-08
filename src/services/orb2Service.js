import sql from "mssql";
import {getPool} from "../config/DBConfig.js";

let pool;

(async () => {
    try {
            pool = await getPool();
        } catch (err) {
            console.error('Error while getting pool in ODS record Services', err);
        }
})();

async function checkAndCreate(operation, user, vessel) {
    try {
       
        const approvedby = 1;
        const approvalStatus = 0;
        
        // Check if operation exists
        const res = await pool
            .request()
            .input("operationName", sql.NVarChar, operation)
            .query("SELECT recordId FROM tbl_orb_2 WHERE recordName = @operationName");

        if (!res.recordset.length) {
           
            
            await pool
                .request()
                .input("operationName", sql.NVarChar, operation)
                .input("createdBy", sql.Int, user)
                .input("vesselId", sql.Int, vessel)
                .input("approvedby", sql.Int, approvedby)
                .input("approvalStatus", sql.Int, approvalStatus)
                .query(`INSERT INTO tbl_orb_2 (recordName, createdBy, vesselId, approvedby, approvalStatus) 
                        VALUES (@operationName, @createdBy, @vesselId, @approvedby, @approvalStatus)`);
            
            console.log("Operation created successfully at", new Date());
        } else {
            console.log("Operation already exists");
        }
    } catch (error) {
        console.error("Error in checkAndCreate:", error.message);
        throw new Error("Database operation failed: " + error.message);
    }
}

async function getOperationByName(operationName, user, vessel) {
    try {
        await checkAndCreate(operationName, user, vessel);

        const result = await pool
            .request()
            .input("operationName", sql.NVarChar, operationName)
            .query("SELECT recordId, vesselId, createdBy FROM tbl_orb_2 WHERE recordName = @operationName");

        return result.recordset.length ? result.recordset[0] : null;
    } catch (error) {
        console.error("Error in getOperationByName:", error.message);
        throw new Error("Database query failed: " + error.message);
    }
}

async function processOperation(operationType, formData, user, vessel) {
    try {
        switch (operationType) {
            case "A":
        const res = await getOperationByName('Loading of oil cargo', user, vessel);
        if (!res) {
        throw new Error("Failed to retrieve operation recordId");
            }
        return await insertLoadingOilCargo(res.recordId, formData);

            case "B":
                const resIT = await getOperationByName('Internal transfer of oil cargo during voyage', user, vessel);
                if (!resIT) {
                throw new Error("Failed to retrieve operation recordId");
                }
                return await insertInternalTransfer(resIT.recordId, formData);
            case "C":
                
                const resUOOC = await getOperationByName('Unloading of oil cargo', user, vessel);
                if (!resUOOC) {
                throw new Error("Failed to retrieve operation recordId");
                }
                return await insertUnloadingCargo(resUOOC.recordId, formData);
            case 'D':
                const resCOW = await getOperationByName('Crude Oil Washing (COW Tankers only)', user, vessel);
                if (!resCOW) {
                throw new Error("Failed to retrieve operation recordId");
                }
                return await insertCrudeOilWashing(resCOW.recordId, formData);
                case 'E':
                    const resBCT = await getOperationByName('Ballasting of cargo tanks', user, vessel);
                    if (!resBCT) {
                    throw new Error("Failed to retrieve operation recordId");
                    }
                    return await insertBallastingOfCargoTanks(resBCT.recordId, formData);
            
            case 'F':
                        const resCBT = await getOperationByName('Ballasting of dedicated clean ballasting tanks (CBT Tankers only)', user, vessel);
                    if (!resCBT) {
                    throw new Error("Failed to retrieve operation recordId");
                    }
                    return await insertCleanBallastingTanks(resCBT.recordId, formData);
            case 'G':
                    const resCOCT = await getOperationByName('Cleaning of cargo tanks', user, vessel);
                    if (!resCOCT) {
                    throw new Error("Failed to retrieve operation recordId");
                    }
                    return await insertCleaningOfCargoTanks(resCOCT.recordId, formData);
            case 'H':
                const resDODB = await getOperationByName('Discharge of dirty ballast', user, vessel);
                if (!resDODB) {
                throw new Error("Failed to retrieve operation recordId");
                }
                return await insertDischargeOfDirtyBallast(resDODB.recordId, formData);
            case 'I':
                const resDWST = await getOperationByName('Discharge of water from slop tanks into the sea', user, vessel);
                if (!resDWST) {
                throw new Error("Failed to retrieve operation recordId");
                }
                return await insertDischargeOfSlopTanks(resDWST.recordId, formData);
            case 'J':
                const resCTDR = await getOperationByName('Collection, Transfer and disposal of residues not otherwise dealt with',user,vessel);
                if (!resCTDR) {
                    throw new Error("Failed to retrieve operation recordId");
                    }
                    return await insertCTDR(resCTDR.recordId, formData);
            case 'K':
                const resCBCICT = await getOperationByName('Discharge of clean ballast contained in cargo tanks',user,vessel);
                if (!resCBCICT) {
                    throw new Error("Failed to retrieve operation recordId");
                    }
                    return await insertCleanBallastContainedInCargoTanks(resCBCICT.recordId, formData);
            case 'L':
              const resDCBT = await getOperationByName('Discharge of ballast from dedicated clean ballast tanks (CBT Tankers only)',user,vessel);
                if (!resDCBT) {
                    throw new Error("Failed to retrieve operation recordId");
                    }
                    return await insertDischargeOfDedicatedCBT(resDCBT.recordId, formData);
            case 'M':
                const resODMS = await getOperationByName('Condition of oil discharge monitoring and control system',user,vessel);
                if(!resODMS)
                {
                    throw new Error("Failed to retrieve operation recordId");
                }
                return await insertOilDischargeMonitoringSystem(resODMS.recordId, formData);
            case 'N':
                const resAOOEDOO = await getOperationByName('Accidental or other exceptional discharges of oil',user,vessel);
                if(!resAOOEDOO)
                {
                    throw new Error("Failed to retrieve operation recordId");
                }
                return await insertAccidentOtherDischarge(resAOOEDOO.recordId, formData);
            case 'O':
                const resAOP = await getOperationByName('Additional operational procedures and general remarks',user,vessel);
                if(!resAOP)
                {
                    throw new Error("Failed to retrieve operation recordId");
                }
                return await insertAdditionalProcedure(resAOP.recordId, formData);
            
            case 'P':
                const resLBW = await getOperationByName('Loading of ballast water',user,vessel);
                if(!resLBW)
                {
                    throw new Error("Failed to retrieve operation recordId");
                }
                return await insertLoadingBallastWater(resLBW.recordId, formData);
            
                case 'Q':
                    const resROBW = await getOperationByName('Re-allocation of ballast water within the ship',user,vessel);
                    if(!resROBW)
                    {
                        throw new Error("Failed to retrieve operation recordId");
                    }
                    return await insertReallocationBallastWater(resROBW.recordId, formData);
            
                case 'R':
                        const resBWDRF = await getOperationByName('Ballast water discharge to reception facility',user,vessel);
                        if(!resBWDRF)
                        {
                            throw new Error("Failed to retrieve operation recordId");
                        }
                        return await insertBallastWaterDischargeTORF(resBWDRF.recordId, formData);
            
            default:
                
                return { message: "Operation not implemented" };
        }
    } catch (error) {
        console.error("Service error:", error);
        throw new Error("Database operation failed");
    }
}

async function fetchOperation(operationType, user, vessel) {
    try {
        const optype = operationType.operationType;
        switch (optype) {
        case 'A':
                
        const res = await getOperationByName('Loading of oil cargo', user, vessel);
        if (!res) {
        throw new Error("Failed to retrieve operation recordId");
            }
        return await fetchLoadingOilCargo(vessel);

            case "B":
                const resIT = await getOperationByName('Internal transfer of oil cargo during voyage', user, vessel);
                if (!resIT) {
                throw new Error("Failed to retrieve operation recordId");
                }
                return await fetchInternalTransfer(vessel);
            case "C":
                const resUOOC = await getOperationByName('Unloading of oil cargo', user, vessel);
                if (!resUOOC) {
                throw new Error("Failed to retrieve operation recordId");
                }
                return await fetchUnloadingCargo(vessel);
            case 'D':
                const resCOW = await getOperationByName('Crude Oil Washing (COW Tankers only)', user, vessel);
                if (!resCOW) {
                throw new Error("Failed to retrieve operation recordId");
                }
                return await fetchCrudeOilWashing(resCOW.recordId,user,vessel);
            case 'E':
                    const resBCT = await getOperationByName('Ballasting of cargo tanks', user, vessel);
                    if (!resBCT) {
                    throw new Error("Failed to retrieve operation recordId");
                    }
                    return await fetchBallastingOfCargoTanks(vessel);
                case 'F':
                    const resCBT = await getOperationByName('Ballasting of dedicated clean ballasting tanks (CBT Tankers only)', user, vessel);
                    if (!resCBT) {
                    throw new Error("Failed to retrieve operation recordId");
                    }
                    return await fetchCleanBallastingTanks(vessel);
                case 'G':
                        const resCOCT = await getOperationByName('Cleaning of cargo tanks', user, vessel);
                        if (!resCOCT) {
                        throw new Error("Failed to retrieve operation recordId");
                        }
                        return await fetchCargoTankCleaning(vessel);
                 case 'H':
                            const resDODB = await getOperationByName('Discharge of dirty ballast', user, vessel);
                            if (!resDODB) {
                            throw new Error("Failed to retrieve operation recordId");
                            }
                            return await fetchDODB(vessel);
                case 'I':
                        const resDOWFST = await getOperationByName('Discharge of water from slop tanks into the sea', user, vessel);
                        if (!resDOWFST) {
                        throw new Error("Failed to retrieve operation recordId");
                        }
                        return await fetchDischargeWaterSlopTanks(vessel);
                        case 'J':
                            const resCTDOR = await getOperationByName('Collection,Transfer and disposal of residues not otherwise dealt with', user, vessel);
                            if (!resCTDOR) {
                            throw new Error("Failed to retrieve operation recordId");
                            }
                            return await fetchCTDOfResidues(vessel);
                    case 'K':
                        const resDOCBCT = await getOperationByName('Discharge of clean ballast contained in cargo tanks', user, vessel);
                        if (!resDOCBCT) {
                        throw new Error("Failed to retrieve operation recordId");
                        }
                        return await fetchDischargeOfCleanBallast(vessel);
                    case 'L':
                            const resDOBFD = await getOperationByName('Discharge of ballast from dedicated clean ballast tanks (CBT Tankers only)', user, vessel);
                            if (!resDOBFD) {
                            throw new Error("Failed to retrieve operation recordId");
                            }
                            return await fetchDischargeOfBallastFromDedicated(vessel);

                    case 'M':
                        const resCOODMAC = await getOperationByName('Condition of oil discharge monitoring and control system', user, vessel);
                        if (!resCOODMAC) {
                        throw new Error("Failed to retrieve operation recordId");
                        }
                        return await fetchConditionOfODMAC(vessel);
                    case 'N':
                            const resAOOED = await getOperationByName('Accidental or other exceptional discharges of oil', user, vessel);
                            if (!resAOOED) {
                            throw new Error("Failed to retrieve operation recordId");
                            }
                            return await fetchAccidentOrOtherExceptional(vessel);
                    case 'O':
                        const resAOP = await getOperationByName('Additional operational procedures and general remarks', user, vessel);
                        if (!resAOP) {
                        throw new Error("Failed to retrieve operation recordId");
                        }
                        return await fetchAdditionalOperationalProcedures(vessel);
                    case 'P':
                            const resLBW = await getOperationByName('Loading of ballast water', user, vessel);
                            if (!resLBW) {
                            throw new Error("Failed to retrieve operation recordId");
                            }
                            return await fetchLoadingOfBallastWater(vessel);
                    case 'Q':
                        const resROBW = await getOperationByName('Re-allocation of ballast water within the ship', user, vessel);
                        if (!resROBW) {
                        throw new Error("Failed to retrieve operation recordId");
                        }
                        return await fetchReallocationOfBallastWater(vessel);
                    case 'R':
                            const resBWDTRF = await getOperationByName('Ballast water discharge to reception facility', user, vessel);
                            if (!resBWDTRF) {
                            throw new Error("Failed to retrieve operation recordId");
                            }
                            return await fetchBallastWaterDischargeToRF(vessel);
                   
            default:
                return { message: "Operation not implemented" };
        }
    } catch (error) {
        console.error("Service error:", error);
        throw new Error("Database operation failed");
    }
}

async function insertReallocationBallastWater(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        // Validate recordId
        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid recordId.");
        }

        const { reasonForReallocation } = data;

        // Validate reasonForReallocation
        if (!reasonForReallocation || typeof reasonForReallocation !== "string" || reasonForReallocation.trim().length < 3) {
            throw new Error("Reason for reallocation must be at least 3 characters long.");
        }

        // Begin transaction
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        // SQL Insert
        const insertQuery = `
            INSERT INTO ReallocationBallastWater (recordId, reason)
            VALUES (@recordId, @reason);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("reason", sql.NVarChar(sql.MAX), reasonForReallocation.trim())
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted ReallocationBallastWater with operationId:", operationId);

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: "Reallocation of ballast water recorded successfully.", operationId };

    } catch (error) {
        console.error("Error in insertReallocationBallastWater:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertBallastWaterDischargeTORF(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        // Validate recordId
        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid recordId.");
        }

        // Extract and validate data
        const { portOfDischarge, receptionFacility, totalQuantityDischarged_m3 } = data;

        if (!portOfDischarge || typeof portOfDischarge !== "string" || portOfDischarge.trim().length < 2) {
            throw new Error("Port of discharge must be at least 2 characters long.");
        }

        if (!receptionFacility || typeof receptionFacility !== "string" || receptionFacility.trim().length < 2) {
            throw new Error("Reception facility must be at least 2 characters long.");
        }

        if (
            totalQuantityDischarged_m3 === undefined ||
            isNaN(totalQuantityDischarged_m3) ||
            Number(totalQuantityDischarged_m3) <= 0
        ) {
            throw new Error("Total quantity discharged must be a valid positive number.");
        }

        // Helper function
        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(Number(value).toFixed(scale));
        }

        // Begin transaction
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        // Insert Query
        const insertQuery = `
            INSERT INTO BallastWaterDischargeReception 
                (recordId, portName, receptionFacility, totalQuantityDischarged)
            VALUES 
                (@recordId, @portName, @receptionFacility, @totalQuantityDischarged);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("portName", sql.NVarChar(255), portOfDischarge.trim())
            .input("receptionFacility", sql.NVarChar(255), receptionFacility.trim())
            .input("totalQuantityDischarged", sql.Decimal(10, 2), validateDecimal(totalQuantityDischarged_m3))
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted BallastWaterDischargeReception with operationId:", operationId);

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: "Ballast water discharge to reception facility recorded successfully.", operationId };

    } catch (error) {
        console.error("Error in insertBallastWaterDischargeTORF:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertLoadingBallastWater(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        // Validate recordId
        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid recordId.");
        }

        // Extract data
        const { tanksLoaded, positionOfShip, quantityOfBallast, remarks } = data;

        // Field Validations
        if (!positionOfShip || typeof positionOfShip !== "string" || positionOfShip.trim() === "") {
            throw new Error("Position of ship is required.");
        }

        if (!quantityOfBallast || isNaN(quantityOfBallast) || Number(quantityOfBallast) <= 0) {
            throw new Error("Quantity of ballast water must be a valid positive number.");
        }

        if (!remarks || typeof remarks !== "string" || remarks.trim().length < 3) {
            throw new Error("Remarks must be at least 3 characters long.");
        }

        if (!Array.isArray(tanksLoaded) || tanksLoaded.length === 0) {
            throw new Error("At least one tank must be specified for ballast water loading.");
        }
        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into LoadingBallastWater table
        const insertDischargeQuery = `
            INSERT INTO LoadingBallastWater (recordId, positionOfShip, totalQuantityM3, remarks)
            VALUES (@recordId, @positionOfShip, @totalQuantityM3, @remarks);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("positionOfShip", sql.NVarChar(255), positionOfShip.trim())
            .input("totalQuantityM3", sql.Decimal(10, 2),validateDecimal(quantityOfBallast))
            .input("remarks", sql.NVarChar(sql.MAX), remarks.trim())
            .query(insertDischargeQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted LoadingBallastWater with operationId:", operationId);

        // Insert into LoadingBallastWater_Tanks table
        for (const tank of tanksLoaded) {
            if (typeof tank === "string" && tank.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(255), tank.trim())
                    .query(`
                        INSERT INTO LoadingBallastWaterTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: "Loading ballast water data inserted successfully.", operationId };

    } catch (error) {
        console.error("Error in insertLoadingBallastWater:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertAdditionalProcedure(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

       
        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid recordId.");
        }

      
        const { additionalOperationalProcedures, generalRemarks } = data;

      
        if (!additionalOperationalProcedures || additionalOperationalProcedures.trim().length < 3) {
            throw new Error("Additional operational procedures must be at least 3 characters long.");
        }

        if (!generalRemarks || generalRemarks.trim().length < 3) {
            throw new Error("General remarks must be at least 3 characters long.");
        }

       
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        
        const insertQuery = `
            INSERT INTO AdditionalProcedures (recordId, additionalProcedures, generalRemarks)
            VALUES (@recordId, @additionalProcedures, @generalRemarks);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("additionalProcedures", sql.NVarChar(sql.MAX), additionalOperationalProcedures.trim())
            .input("generalRemarks", sql.NVarChar(sql.MAX), generalRemarks.trim())
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted AdditionalProcedures with operationId:", operationId);

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: "Additional procedures recorded successfully.", operationId };

    } catch (error) {
        console.error("Error in insertAdditionalProcedure:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertAccidentOtherDischarge(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid recordId.");
        }

        const {
            timeOfOccurrence,
            portAtTimeOfOccurrence,
            positionAtTimeOfOccurrence,
            approximateQuantityM3,
            typeOfOil,
            circumstancesOfDischarge,
            reasons,
            generalRemarks
        } = data;

        // === Validations ===
        if (!timeOfOccurrence || typeof timeOfOccurrence !== "string") {
            throw new Error("Time of occurrence is required.");
        }

        if (!portAtTimeOfOccurrence || typeof portAtTimeOfOccurrence !== "string" || portAtTimeOfOccurrence.trim() === "") {
            throw new Error("Port at time of occurrence is required.");
        }

        if (!positionAtTimeOfOccurrence || typeof positionAtTimeOfOccurrence !== "string" || positionAtTimeOfOccurrence.trim() === "") {
            throw new Error("Position of ship is required.");
        }

        const quantity = parseFloat(approximateQuantityM3);
        if (isNaN(quantity) || quantity < 0) {
            throw new Error("Approximate quantity must be a valid non-negative number.");
        }

        if (!typeOfOil || typeof typeOfOil !== "string" || typeOfOil.trim() === "") {
            throw new Error("Type of oil is required.");
        }

        if (!circumstancesOfDischarge || circumstancesOfDischarge.toString().trim().length < 3) {
            throw new Error("Circumstances of discharge must be at least 3 characters.");
        }

        if (!reasons || reasons.toString().trim().length < 3) {
            throw new Error("Reasons for discharge must be at least 3 characters.");
        }

        if (!generalRemarks || generalRemarks.toString().trim().length < 3) {
            throw new Error("General remarks must be at least 3 characters.");
        }

        // Convert time string to SQL Time
        const toSQLTime = (timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, h, m, 0);
        };
        const sqlTime = toSQLTime(timeOfOccurrence);

        // === Start Transaction ===
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const insertQuery = `
            INSERT INTO AccidentalDischarge (
                recordId, 
                timeOfOccurrence,
                portAtTimeOfOccurrence,
                positionOfShip,
                approximateQuantityM3,
                typeOfOil,
                circumstances,
                reasons,
                generalRemarks
            ) VALUES (
                @recordId,
                @timeOfOccurrence,
                @port,
                @position,
                @quantity,
                @typeOfOil,
                @circumstances,
                @reasons,
                @remarks
            );
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("timeOfOccurrence", sql.Time(7), sqlTime)
            .input("port", sql.NVarChar(100), portAtTimeOfOccurrence.trim())
            .input("position", sql.NVarChar(255), positionAtTimeOfOccurrence.trim())
            .input("quantity", sql.Float, quantity)
            .input("typeOfOil", sql.NVarChar(100), typeOfOil.trim())
            .input("circumstances", sql.NVarChar(500), circumstancesOfDischarge.toString().trim())
            .input("reasons", sql.NVarChar(sql.MAX), reasons.toString().trim())
            .input("remarks", sql.NVarChar(sql.MAX), generalRemarks.toString().trim())
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted AccidentalDischarge with operationId:", operationId);

        await transaction.commit();
        console.log("Transaction committed.");
        return { message: "Accidental discharge recorded successfully.", operationId };

    } catch (error) {
        console.error("Error in insertAccidentOtherDischarge:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertOilDischargeMonitoringSystem(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid recordId.");
        }

        const { timeOfSystemFailure, timeSystemOperational, reasonForFailure } = data;

        // === Validation ===
        if (!timeOfSystemFailure || typeof timeOfSystemFailure !== "string") {
            throw new Error("Time of system failure is required.");
        }

        if (!timeSystemOperational || typeof timeSystemOperational !== "string") {
            throw new Error("Time when system became operational is required.");
        }

        if (!reasonForFailure || typeof reasonForFailure !== "string" || reasonForFailure.trim().length < 5) {
            throw new Error("Reason for failure must be at least 5 characters.");
        }

        // Ensure operational time is after failure time
        const toSQLTime = (timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, h, m, 0);
        };

        const failTime = toSQLTime(timeOfSystemFailure);
        const opTime = toSQLTime(timeSystemOperational);
        if (opTime <= failTime) {
            throw new Error("System operational time must be after the system failure time.");
        }

        // === Start DB Transaction ===
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const insertQuery = `
            INSERT INTO OilDischargeMonitoringSystem 
            (recordId, timeOfSystemFailure, timeSystemOperational, reasonForFailure)
            VALUES 
            (@recordId, @timeOfSystemFailure, @timeSystemOperational, @reasonForFailure);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("timeOfSystemFailure", sql.Time(7), failTime)
            .input("timeSystemOperational", sql.Time(7), opTime)
            .input("reasonForFailure", sql.NVarChar(sql.MAX), reasonForFailure.trim())
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted OilDischargeMonitoringSystem with operationId:", operationId);

        await transaction.commit();
        console.log("Transaction committed.");
        return { message: "Oil discharge monitoring system failure logged successfully.", operationId };

    } catch (error) {
        console.error("Error in insertOilDischargeMonitoringSystem:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertDischargeOfDedicatedCBT(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        if (!recordId || isNaN(recordId)) throw new Error("Invalid recordId.");

        const {
            positionStart,
            timeStart,
            positionCompletion,
            timeCompletion,
            quantityDischargedSea,
            quantityDischargedRF,
            portRF,
            oilContamination,
            dischargeMonitored,
            valvePosition,
            valveTime,
            dischargedTanks
        } = data;

        // === Validation ===
        if (!positionStart || typeof positionStart !== "string" || positionStart.trim() === "")
            throw new Error("Position at start of discharge is required.");

        if (!timeStart || typeof timeStart !== "string")
            throw new Error("Time at start of discharge is required.");

        if (!positionCompletion || typeof positionCompletion !== "string" || positionCompletion.trim() === "")
            throw new Error("Position at completion of discharge is required.");

        if (!timeCompletion || typeof timeCompletion !== "string")
            throw new Error("Time at completion of discharge is required.");

        const validateDecimal = (value, label) => {
            const num = Number(value);
            if (isNaN(num) || num < 0) throw new Error(`${label} must be a valid non-negative number.`);
            return parseFloat(num.toFixed(2));
        };

        const qtySea = validateDecimal(quantityDischargedSea, "Quantity discharged into the sea");
        const qtyReception = validateDecimal(quantityDischargedRF, "Quantity discharged into reception facility");

        if (!portRF || typeof portRF !== "string" || portRF.trim() === "")
            throw new Error("Port of reception facility is required.");

        if (!["Yes", "No"].includes(oilContamination))
            throw new Error("Oil contamination must be 'Yes' or 'No'.");

        if (!["Yes", "No"].includes(dischargeMonitored))
            throw new Error("Discharge monitored must be 'Yes' or 'No'.");

        if (!valvePosition || typeof valvePosition !== "string" || valvePosition.trim() === "")
            throw new Error("Valve closing position is required.");

        if (!valveTime || typeof valveTime !== "string")
            throw new Error("Valve closing time is required.");

        if (!Array.isArray(dischargedTanks) || dischargedTanks.length === 0)
            throw new Error("At least one discharged tank is required.");

        const toSQLTime = (timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, h, m, 0); // JavaScript Date obj
        };

        // === DB Transaction ===
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const insertQuery = `
            INSERT INTO CbtBallastDischarge 
            (recordId, posStart, timeStart, posCompletion, timeCompletion, qtySea, qtyReception, portReception, 
             oilContamination, monitoredByOilMeter, valveClosePos, valveCloseTime)
            VALUES 
            (@recordId, @posStart, @timeStart, @posCompletion, @timeCompletion, @qtySea, @qtyReception, @portReception,
             @oilContamination, @monitoredByOilMeter, @valveClosePos, @valveCloseTime);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("posStart", sql.NVarChar(255), positionStart.trim())
            .input("timeStart", sql.Time(7), toSQLTime(timeStart))
            .input("posCompletion", sql.NVarChar(255), positionCompletion.trim())
            .input("timeCompletion", sql.Time(7), toSQLTime(timeCompletion))
            .input("qtySea", sql.Decimal(10, 2), qtySea)
            .input("qtyReception", sql.Decimal(10, 2), qtyReception)
            .input("portReception", sql.NVarChar(255), portRF.trim())
            .input("oilContamination", sql.Bit, oilContamination === "Yes" ? 1 : 0)
            .input("monitoredByOilMeter", sql.Bit, dischargeMonitored === "Yes" ? 1 : 0)
            .input("valveClosePos", sql.NVarChar(255), valvePosition.trim())
            .input("valveCloseTime", sql.Time(7), toSQLTime(valveTime))
            .query(insertQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted CbtBallastDischarge with operationId:", operationId);

        // Insert tanks
        for (const tank of dischargedTanks) {
            if (typeof tank === "string" && tank.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tank.trim())
                    .query(`
                        INSERT INTO CbtBallastDischargeTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        await transaction.commit();
        console.log("Transaction committed.");
        return { message: "CBT discharge operation saved successfully.", operationId };

    } catch (error) {
        console.error("Error in insertDischargeOfDedicatedCBT:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}

async function insertCleanBallastContainedInCargoTanks(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        if (!recordId || isNaN(recordId)) throw new Error("Invalid recordId.");

        const {
            positionStart,
            positionCompletion,
            regularCheckup,
            tanksEmptyOnCompletion,
            dischargedTanks
        } = data;

        if (!positionStart || typeof positionStart !== "string" || positionStart.trim() === "") {
            throw new Error("Start position is required.");
        }

        if (!positionCompletion || typeof positionCompletion !== "string" || positionCompletion.trim() === "") {
            throw new Error("Completion position is required.");
        }

        if (typeof regularCheckup !== "string" || !["Yes", "No"].includes(regularCheckup)) {
            throw new Error("Regular checkup must be 'Yes' or 'No'.");
        }

        if (typeof tanksEmptyOnCompletion !== "string" || !["Yes", "No"].includes(tanksEmptyOnCompletion)) {
            throw new Error("Tanks empty on completion must be 'Yes' or 'No'.");
        }

        if (!Array.isArray(dischargedTanks) || dischargedTanks.length === 0) {
            throw new Error("At least one discharged tank identity is required.");
        }

        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const insertDischargeQuery = `
            INSERT INTO CleanBallastDischarge 
            (recordId, positionStart, positionCompletion, tankEmptyCompletion, regularCheck)
            VALUES (@recordId, @positionStart, @positionCompletion, @tankEmptyCompletion, @regularCheck);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("positionStart", sql.NVarChar(255), positionStart.trim())
            .input("positionCompletion", sql.NVarChar(255), positionCompletion.trim())
            .input("tankEmptyCompletion", sql.Bit, tanksEmptyOnCompletion === "Yes" ? 1 : 0)
            .input("regularCheck", sql.Bit, regularCheckup === "Yes" ? 1 : 0)
            .query(insertDischargeQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted CleanBallastDischarge with operationId:", operationId);

        for (const tank of dischargedTanks) {
            if (typeof tank === "string" && tank.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tank.trim())
                    .query(`
                        INSERT INTO CleanBallastDischargeTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: "Clean ballast discharge data inserted successfully.", operationId };

    } catch (error) {
        console.error("Error in insertCleanBallastContainedInCargoTanks:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        transaction?.release?.();
    }
}


async function insertCTDR(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        if (!recordId || isNaN(recordId)) throw new Error("Invalid recordId.");
        if (!data.method_of_disposal) throw new Error("Method of disposal is required.");
        if (!data.dynamic_data) throw new Error("Dynamic data section is missing.");

        const method = data.method_of_disposal;
        const dynamic = data.dynamic_data;

        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into ResidueTransferDisposal
        const disposalResult = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("methodOfDisposal", sql.NVarChar(255), method)
            .query(`
                INSERT INTO ResidueTransferDisposal (recordId, methodOfDisposal)
                VALUES (@recordId, @methodOfDisposal);
                SELECT SCOPE_IDENTITY() AS operationId;
            `);

        const operationId = disposalResult.recordset[0].operationId;
        console.log("Inserted ResidueTransferDisposal with operationId:", operationId);
         function validateDecimal(value, precision = 10, scale = 2) 
         {
        if (typeof value !== "number" || isNaN(value)) return 0.0;
        return parseFloat(value.toFixed(scale));
                            }
        // Handle method-specific insertions
        if (method === 'disposal to reception facilities') {
            const { port, quantity_involved } = dynamic;

            if (!port) throw new Error("Port name is required.");
            if (!quantity_involved || isNaN(quantity_involved)) {
                throw new Error("Valid quantity involved is required.");
            }

            await transaction.request()
                .input("operationId", sql.Int, operationId)
                .input("portName", sql.NVarChar(255), port)
                .input("quantityInvolved", sql.Decimal(10, 2),validateDecimal( parseFloat(quantity_involved)))
                .query(`
                    INSERT INTO DisposalReceptionFacility (operationId, portName, quantityInvolved)
                    VALUES (@operationId, @portName, @quantityInvolved);
                `);

        } else if (method === 'mixed with cargo') {
            const { quantity_involved } = dynamic;

            if (!quantity_involved || isNaN(quantity_involved)) {
                throw new Error("Valid quantity mixed is required.");
            }

            await transaction.request()
                .input("operationId", sql.Int, operationId)
                .input("quantityMixed", sql.Decimal(10, 2),validateDecimal(parseFloat(quantity_involved)))
                .query(`
                    INSERT INTO DisposalMixedCargo (operationId, quantityMixed)
                    VALUES (@operationId, @quantityMixed);
                `);

        } else if (method === 'other method') {
            const { method_name, quantity_disposed } = dynamic;

            if (!method_name) throw new Error("Other method name is required.");
            if (!quantity_disposed || isNaN(quantity_disposed)) {
                throw new Error("Valid quantity disposed is required.");
            }

            await transaction.request()
                .input("operationId", sql.Int, operationId)
                .input("methodName", sql.NVarChar(255), method_name)
                .input("quantityDisposed", sql.Decimal(10, 2),validateDecimal(parseFloat(quantity_disposed)))
                .query(`
                    INSERT INTO DisposalOtherMethod (operationId, methodName, quantityDisposed)
                    VALUES (@operationId, @methodName, @quantityDisposed);
                `);

        } else if (method === 'transferred to or from (an)other tank(s) including transfer from machinery space oil residue(sludge) and oily bilge water tanks') {
            const { transferred_quantity, total_quantity, tank_identities } = dynamic;

            if (!transferred_quantity || isNaN(transferred_quantity)) {
                throw new Error("Transferred quantity must be valid.");
            }
            if (!total_quantity || isNaN(total_quantity)) {
                throw new Error("Total quantity must be valid.");
            }
            if (!Array.isArray(tank_identities) || tank_identities.length === 0) {
                throw new Error("At least one transfer tank identity is required.");
            }

            const transferResult = await transaction.request()
                .input("operationId", sql.Int, operationId)
                .input("quantityTransferred", sql.Decimal(10, 2),validateDecimal( parseFloat(transferred_quantity)))
                .input("totalQuantity", sql.Decimal(10, 2),validateDecimal( parseFloat(total_quantity)))
                .query(`
                    INSERT INTO DisposalTransferTanks (operationId, quantityTransferred, totalQuantity)
                    VALUES (@operationId, @quantityTransferred, @totalQuantity);
                    SELECT SCOPE_IDENTITY() AS transferId;
                `);

            const transferId = transferResult.recordset[0].transferId;

            for (const tank of tank_identities) {
                if (tank && typeof tank === "string" && tank.trim() !== "") {
                    await transaction.request()
                        .input("transferId", sql.Int, transferId)
                        .input("tankIdentity", sql.NVarChar(255), tank.trim())
                        .query(`
                            INSERT INTO DisposalTransferTankList (transferId, tankIdentity)
                            VALUES (@transferId, @tankIdentity);
                        `);
                }
            }
        } else {
            throw new Error("Unsupported method of disposal.");
        }

        await transaction.commit();
        console.log("Transaction committed.");

        return {
            message: "Residue Transfer & Disposal data inserted successfully.",
            operationId
        };

    } catch (error) {
        console.error("Error in insertCTDR:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        if (transaction) transaction.release?.();
    }
}

async function insertDischargeOfSlopTanks(recordId, data) {
    let transaction;

try {
        console.log("Data from front-end:", data);

        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid recordId.");
        }

        // Field validations
        if (!data.static) {
            throw new Error("Static field data is required.");
        }

        const {
            settling_last_residues,
            settling_last_discharge,
            rate_of_discharge,
            ullage_completion,
            valves_closed
        } = data.static;

        if (!settling_last_residues || !settling_last_discharge) {
            throw new Error("Settling time fields are required.");
        }

        if (!rate_of_discharge || isNaN(rate_of_discharge)) {
            throw new Error("Rate of discharge must be a valid number.");
        }

        if (!ullage_completion || typeof ullage_completion !== "string") {
            throw new Error("Ullage completion must be a valid string.");
        }

        if (!valves_closed || typeof valves_closed !== "string") {
            throw new Error("Valves closed must be a valid string.");
        }

        if (!Array.isArray(data.tanks) || data.tanks.length === 0) {
            throw new Error("At least one tank identity is required.");
        }

        function formatToSQLTime(timeStr) {
            if (!timeStr) return null;

            const timeParts = timeStr.split(":");
            if (timeParts.length === 2) {
                timeStr = `${timeStr}:00`; 
            } else if (timeParts.length !== 3) {
                throw new Error(`Invalid time format: ${timeStr}`);
            }

            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, hours, minutes, seconds);
        }

        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const dischargeQuery = `
            INSERT INTO SlopTankDischarge 
                (recordId, settlingLastResidues, settlingLastDischarge, rateOfDischarge, ullageCompletion, valvesClosed)
            VALUES 
                (@recordId, @settlingLastResidues, @settlingLastDischarge, @rateOfDischarge, @ullageCompletion, @valvesClosed);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("settlingLastResidues", sql.Time(7), formatToSQLTime(settling_last_residues))
            .input("settlingLastDischarge", sql.Time(7), formatToSQLTime(settling_last_discharge))
            .input("rateOfDischarge", sql.Decimal(10, 2), parseFloat(rate_of_discharge))
            .input("ullageCompletion", sql.NVarChar(100), ullage_completion)
            .input("valvesClosed", sql.NVarChar(10), valves_closed)
            .query(dischargeQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted SlopTankDischarge with operationId:", operationId);

        // Insert Tank Data
        for (const tank of data.tanks) {
            if (tank && typeof tank === "string" && tank.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tank.trim())
                    .query(`
                        INSERT INTO SlopTankDischargeTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        console.log("Inserted SlopTankDischargeTanks successfully.");
        await transaction.commit();
        console.log("Transaction committed.");

        return { message: "Slop Tank Discharge data inserted successfully.", operationId };
    } catch (error) {
        console.error("Error in insertDischargeOfSlopTanks:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        if (transaction) transaction.release?.();
    }
}

async function insertDischargeOfDirtyBallast(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        // Validate recordId
        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid recordId provided.");
        }

        // Validate required fields
        if (!data.timeStart || !data.positionStart || !data.timeComplete || !data.positionComplete) {
            throw new Error("Start and complete time/positions are required.");
        }

        if (isNaN(data.shipsSpeed) || isNaN(data.quantityDischarged)) {
            throw new Error("Ship's speed and quantity discharged must be valid numbers.");
        }

        if (typeof data.monitoringSystem !== "boolean" || typeof data.regularCheckup !== "boolean") {
            throw new Error("Monitoring system and regular checkup must be boolean values.");
        }

        if (data.shorePort && typeof data.shorePort !== "string") {
            throw new Error("Shore port must be a string.");
        }

        if (data.shoreQuantity && isNaN(data.shoreQuantity)) {
            throw new Error("Shore quantity must be a valid number.");
        }

        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }

        function formatToSQLTime(timeStr) {
            if (!timeStr) return null;

            const timeParts = timeStr.split(":");
            if (timeParts.length === 2) {
                timeStr = `${timeStr}:00`; // Append seconds if missing
            } else if (timeParts.length !== 3) {
                throw new Error(`Invalid time format: ${timeStr}`);
            }

            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, hours, minutes, seconds);
        }

        // Start transaction
        
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into `DirtyBallastDischarge`
        const dischargeQuery = `
            INSERT INTO DirtyBallastDischarge 
            (recordId, dischargeStartTime, dischargeStartPosition, dischargeCompleteTime, dischargeCompletePosition, 
             shipSpeedKnots, quantityDischargedM3, monitoringSystem, regularCheckup, shorePort, shoreQuantityM3) 
            VALUES 
            (@recordId, @dischargeStartTime, @dischargeStartPosition, @dischargeCompleteTime, @dischargeCompletePosition, 
             @shipSpeedKnots, @quantityDischargedM3, @monitoringSystem, @regularCheckup, @shorePort, @shoreQuantityM3);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("dischargeStartTime", sql.Time(7), formatToSQLTime(data.timeStart))
            .input("dischargeStartPosition", sql.NVarChar(255), data.positionStart)
            .input("dischargeCompleteTime", sql.Time(7), formatToSQLTime(data.timeComplete))
            .input("dischargeCompletePosition", sql.NVarChar(255), data.positionComplete)
            .input("shipSpeedKnots", sql.Decimal(10, 2), validateDecimal(data.shipsSpeed))
            .input("quantityDischargedM3", sql.Decimal(10, 2), validateDecimal(data.quantityDischarged))
            .input("monitoringSystem", sql.Bit, data.monitoringSystem ? 1 : 0)
            .input("regularCheckup", sql.Bit, data.regularCheckup ? 1 : 0)
            .input("shorePort", sql.NVarChar(150), data.shorePort || null)
            .input("shoreQuantityM3", sql.Decimal(10, 2), validateDecimal(data.shoreQuantity) || 0)
            .query(dischargeQuery);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted DirtyBallastDischarge with Operation ID:", operationId);

        // Insert Tank Identities into `DirtyBallastDischargeTanks`
        for (const tankIdentity of data.tankIdentities) {
            if (typeof tankIdentity === "string" && tankIdentity.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tankIdentity.trim())
                    .query(`
                        INSERT INTO DirtyBallastDischargeTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        console.log("Inserted DirtyBallastDischargeTanks successfully.");

        // Insert Slop Tank Identities into `OilyWaterSlopTanks`
        for (const slopTankIdentity of data.slopTanks) {
            if (typeof slopTankIdentity === "string" && slopTankIdentity.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("slopTankIdentity", sql.NVarChar(100), slopTankIdentity.trim())
                    .query(`
                        INSERT INTO OilyWaterSlopTanks (operationId, slopTankIdentity)
                        VALUES (@operationId, @slopTankIdentity);
                    `);
            }
        }

        console.log("Inserted OilyWaterSlopTanks successfully.");

        // Commit transaction
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: "Dirty Ballast Discharge operation submitted successfully.", operationId };

    } catch (error) {
        console.error("Error in insertDischargeOfDirtyBallast:", error);

        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
        // Release connection
        
            transaction.release();
       
    
}
}

async function insertCleaningOfCargoTanks(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid recordId provided.");
        }

        if (!data.portOrPosition || typeof data.portOrPosition !== "string" || data.portOrPosition.trim() === "") {
            throw new Error("Port or Ship Position is required.");
        }

        if (!data.durationCleaning || isNaN(data.durationCleaning)) {
            throw new Error("Duration of Cleaning is required and must be a valid number.");
        }

        if (!data.methodCleaning || typeof data.methodCleaning !== "string" || data.methodCleaning.trim() === "") {
            throw new Error("Method of Cleaning is required.");
        }

        if (!data.TWT || typeof data.TWT !== "string") {
            throw new Error("Tanks Washing Transferred To is required.");
        }

        if (!data.quantityTransferred || isNaN(data.quantityTransferred) || Number(data.quantityTransferred) < 0) {
            throw new Error("Quantity Transferred must be a valid non-negative number.");
        }

        if (!data.totalQuantity || isNaN(data.totalQuantity) || Number(data.totalQuantity) < 0) {
            throw new Error("Total Quantity must be a valid non-negative number.");
        }

        if (!data.portRF || typeof data.portRF !== "string" || data.portRF.trim() === "") {
            throw new Error("Port RF is required.");
        }

        if (!data.totalQuantityRF || isNaN(data.totalQuantityRF) || Number(data.totalQuantityRF) < 0) {
            throw new Error("Quantity RF must be a valid non-negative number.");
        }

        if (!Array.isArray(data.tanks) || data.tanks.length === 0) {
            throw new Error("At least one valid tank identity is required.");
        }

        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }

        function formatToSQLTime(timeStr) {
            if (!timeStr) return null;
            const timeParts = timeStr.split(":");
            if (timeParts.length === 2) {
                timeStr = `${timeStr}:00`; 
            } else if (timeParts.length !== 3) {
                throw new Error(`Invalid time format: ${timeStr}`);
            }
            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, hours, minutes, seconds);
        }

        
        transaction = new sql.Transaction(await pool);
        await transaction.begin();
        console.log("Transaction started...");

        const query = `
            INSERT INTO CargoTankCleaning 
            (recordId, portOrShipPosition, durationOfCleaning, methodOfCleaning, tanksWashingTransferredTo, quantityTransferred, 
             totalQuantity, portRf, quantityRf, createdAt)
            VALUES 
            (@recordId, @portOrShipPosition, @durationOfCleaning, @methodOfCleaning, @tanksWashingTransferredTo, @quantityTransferred, 
             @totalQuantity, @portRf, @quantityRf, GETDATE());
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("portOrShipPosition", sql.NVarChar(255), data.portOrPosition.trim())
            .input("durationOfCleaning", sql.Time(7), formatToSQLTime(`${data.durationCleaning}:00`)) 
            .input("methodOfCleaning", sql.NVarChar(100), data.methodCleaning.trim())
            .input("tanksWashingTransferredTo", sql.NVarChar(100), data.TWT.trim())
            .input("quantityTransferred", sql.Decimal(10, 2), validateDecimal(data.quantityTransferred))
            .input("totalQuantity", sql.Decimal(10, 2), validateDecimal(data.totalQuantity))
            .input("portRf", sql.NVarChar(150), data.portRF.trim())
            .input("quantityRf", sql.Decimal(10, 2), validateDecimal(data.totalQuantityRF))
            .query(query);

        const operationId = result.recordset[0].operationId;
        console.log("CargoTankCleaning Operation ID created:", operationId);

        for (const tankIdentity of data.tanks) {
            if (typeof tankIdentity === "string" && tankIdentity.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tankIdentity.trim())
                    .query(`
                        INSERT INTO CargoTankCleaningTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Cargo Tank Cleaning operation submitted successfully.`, operationId };

    } catch (error) {
        console.error("Error in insertCleaningOfCargoTanks:", error);
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }
        throw new Error("Database operation failed: " + error.message);
    } finally {
        
            transaction.release();
        
    }
}

async function insertCleanBallastingTanks(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        // Validate `recordId`
        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid recordId provided.");
        }

        // Validate required fields
        if (!data.port || typeof data.port !== "string" || data.port.trim() === "") {
            throw new Error("Port is required and must be a valid string.");
        }

        if (!data.positionFlush || typeof data.positionFlush !== "string" || data.positionFlush.trim() === "") {
            throw new Error("Position Flushed is required and must be a valid string.");
        }

        if (!data.oilyWaterQty || isNaN(data.oilyWaterQty) || Number(data.oilyWaterQty) < 0) {
            throw new Error("Oily Water Quantity must be a valid non-negative number.");
        }

        if (!data.cleanBallastQty || isNaN(data.cleanBallastQty) || Number(data.cleanBallastQty) < 0) {
            throw new Error("Clean Ballast Quantity must be a valid non-negative number.");
        }

        if (!data.valveTime || typeof data.valveTime !== "string") {
            throw new Error("Valve Time is required.");
        }

        if (!data.valvePosition || typeof data.valvePosition !== "string" || data.valvePosition.trim() === "") {
            throw new Error("Valve Position is required.");
        }

        // Validate tanks array
        if (!Array.isArray(data.tanks) || data.tanks.length === 0) {
            throw new Error("At least one valid tank identity is required.");
        }

        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }

        function formatToSQLTime(timeStr) {
            if (!timeStr) return null;

            const timeParts = timeStr.split(":");
            if (timeParts.length === 2) {
                timeStr = `${timeStr}:00`; // Append seconds if missing
            } else if (timeParts.length !== 3) {
                throw new Error(`Invalid time format: ${timeStr}`);
            }

            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, hours, minutes, seconds);
        }

        // Start a transaction
      
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into `CbtBallasting` Table
        const query = `
            INSERT INTO CbtBallasting (recordId, port, positionFlushed, oilyWaterQty, cleanBallastQty, valveTime, valvePosition)
            VALUES (@recordId, @port, @positionFlush, @oilyWaterQty, @cleanBallastQty, @valveTime, @valvePosition);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("port", sql.NVarChar(150), data.port.trim())
            .input("positionFlush", sql.NVarChar(255), data.positionFlush.trim())
            .input("oilyWaterQty", sql.Decimal(10, 2), validateDecimal(data.oilyWaterQty))
            .input("cleanBallastQty", sql.Decimal(10, 2), validateDecimal(data.cleanBallastQty))
            .input("valveTime", sql.Time(7), formatToSQLTime(data.valveTime))
            .input("valvePosition", sql.NVarChar(255), data.valvePosition.trim())
            .query(query);

        const operationId = result.recordset[0].operationId;
        console.log("CbtBallasting Operation ID created:", operationId);

        // Insert Tank Identities into `CbtBallastingTanks`
        for (const tankIdentity of data.tanks) {
            if (typeof tankIdentity === "string" && tankIdentity.trim() !== "") {
                await transaction.request()
                    .input("operationId", sql.Int, operationId)
                    .input("tankIdentity", sql.NVarChar(100), tankIdentity.trim())
                    .query(`
                        INSERT INTO CbtBallastingTanks (operationId, tankIdentity)
                        VALUES (@operationId, @tankIdentity);
                    `);
            }
        }

        // Commit the transaction
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Clean Ballasting operation submitted successfully.`, operationId };

    } catch (error) {
        console.error("Error in insertCleanBallastingTanks:", error);

        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
       
            transaction.release(); 
         
    }
}

async function insertBallastingOfCargoTanks(recordId, data) {
    let transaction;

    try {
        console.log("Data from front-end:", data);

        // Validate `recordId`
        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid recordId provided.");
        }

        // Validate `startBallastingPlace` and `endBallastingPlace`
        if (!data.startBallasting || typeof data.startBallasting !== "string" || data.startBallasting.trim() === "") {
            throw new Error("Start Ballasting Place is required and must be a valid string.");
        }

        if (!data.endBallasting || typeof data.endBallasting !== "string" || data.endBallasting.trim() === "") {
            throw new Error("End Ballasting Place is required and must be a valid string.");
        }

        // Validate tanks array
        if (!Array.isArray(data.tanks) || data.tanks.length === 0) {
            throw new Error("At least one valid tank identity is required.");
        }

        // Start a transaction
      
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into Ballasting Table
        const query = `
            INSERT INTO Ballasting (recordId, startBallastingPlace, endBallastingPlace)
            VALUES (@recordId, @startBallasting, @endBallasting);
            SELECT SCOPE_IDENTITY() AS ballastingId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("startBallasting", sql.NVarChar(150), data.startBallasting.trim())
            .input("endBallasting", sql.NVarChar(150), data.endBallasting.trim())
            .query(query);

        const ballastingId = result.recordset[0].ballastingId;
        console.log("Ballasting ID created:", ballastingId);

        // Insert Tank Identities into Ballasting_Tanks
        for (const tankIdentity of data.tanks) {
            if (typeof tankIdentity === "string" && tankIdentity.trim() !== "") {
                await transaction.request()
                    .input("ballastingId", sql.Int, ballastingId)
                    .input("tankIdentity", sql.NVarChar(100), tankIdentity.trim())
                    .query(`
                        INSERT INTO BallastingTanks (ballastingId, tankIdentity)
                        VALUES (@ballastingId, @tankIdentity);
                    `);
            }
        }

        // Commit transaction
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Ballasting operation submitted successfully.`, ballastingId };

    } catch (error) {
        console.error("Error in insertBallastingOfCargoTanks:", error);

        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
        // Release connection
        
            transaction.release(); 
         
    }
}

async function insertCrudeOilWashing(recordId, data) {
    console.log("Data from front-end ", data);
    if (!recordId) {
        throw new Error("Invalid recordId provided.");
    }
    console.log(data, " from insert function");

    if (!data.tanks || !Array.isArray(data.tanks) || data.tanks.length === 0) {
        throw new Error("Tanks data is required.");
    }

    let transaction;
    try {
        // Start transaction
        
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into `CrudeOilWashing`
        const query = `
            INSERT INTO CrudeOilWashing (recordId)
            VALUES (@recordId);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .query(query);

        const operationId = result.recordset[0].operationId;
        console.log("Inserted CrudeOilWashing with Operation ID:", operationId);

        // Insert tanks data inside the same transaction
        await insertCrudeOilWashingTanks(transaction, operationId, data.tanks);

        // Commit transaction
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Crude Oil Washing submitted successfully. Rows affected: ${result.rowsAffected}` };

    } catch (error) {
        console.error("Error in insertCrudeOilWashing:", error);

        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
        // Release connection
       
            transaction.release(); 
         
    }
}

async function insertCrudeOilWashingTanks(transaction, operationId, tanks) {
    for (const tank of tanks) {
        const {
            tankIdentity,
            cowPort,
            cowShipPosition,
            machinesInUse,
            startTimeWashing,
            washingPattern,
            washingLinePressure,
            endTimeWashing,
            methodOfEstablishing,
            cowRemarks
        } = tank;

        function formatToSQLTime(timeStr) {
            if (!timeStr) return null;

            const timeParts = timeStr.split(":");
            if (timeParts.length === 2) {
                timeStr = `${timeStr}:00`; // Append seconds if missing
            } else if (timeParts.length !== 3) {
                throw new Error(`Invalid time format: ${timeStr}`);
            }

            const [hours, minutes, seconds] = timeStr.split(":").map(Number);
            return new Date(1970, 0, 1, hours, minutes, seconds);
        }

        // Validation
        if (!tankIdentity || !cowPort || !cowShipPosition || !washingPattern || !washingLinePressure || !methodOfEstablishing) {
            throw new Error("Required fields missing in tank data.");
        }

        if (!Number.isInteger(machinesInUse) || machinesInUse < 0) {
            throw new Error("Machines in use must be a valid integer.");
        }

        if (!startTimeWashing || !endTimeWashing) {
            throw new Error("Washing time is required.");
        }

        const formattedStartTime = formatToSQLTime(startTimeWashing);
        const formattedEndTime = formatToSQLTime(endTimeWashing);

        if (formattedStartTime >= formattedEndTime) {
            throw new Error("Invalid washing time range.");
        }

        console.log("Formatted Start Time:", formattedStartTime);
        console.log("Formatted End Time:", formattedEndTime);

        // SQL Insert Query
        const query = `
            INSERT INTO CrudeOilWashing_Tanks (
                operationId, tankIdentity, portOfWash, shipPosition, machinesInUse,
                startTimeWashing, washingPattern, washingLinePressure, stopTimeWashing,
                cleanlinessMethod, remarks
            ) VALUES (
                @operationId, @tankIdentity, @portOfWash, @shipPosition, @machinesInUse,
                @startTimeWashing, @washingPattern, @washingLinePressure, @stopTimeWashing,
                @cleanlinessMethod, @remarks
            );
        `;

        await transaction.request()
            .input("operationId", sql.Int, operationId)
            .input("tankIdentity", sql.NVarChar(100), tankIdentity)
            .input("portOfWash", sql.NVarChar(150), cowPort)
            .input("shipPosition", sql.NVarChar(150), cowShipPosition)
            .input("machinesInUse", sql.Int, machinesInUse)
            .input("startTimeWashing", sql.Time, formattedStartTime) // Fixed conversion
            .input("washingPattern", sql.NVarChar(150), washingPattern)
            .input("washingLinePressure", sql.NVarChar(100), washingLinePressure.toString())
            .input("stopTimeWashing", sql.Time, formattedEndTime) // Fixed conversion
            .input("cleanlinessMethod", sql.NVarChar(255), methodOfEstablishing)
            .input("remarks", sql.NVarChar(255), cowRemarks || null)
            .query(query);
    }
}

async function insertLoadingOilCargo(recordId, data) {
    if (!recordId) {
        throw new Error("Invalid recordId provided.");
    }

    function validateDecimal(value, precision = 10, scale = 2) {
        if (typeof value !== "number" || isNaN(value)) return 0.0;
        return parseFloat(value.toFixed(scale));
    }

    const quantityAddedM3 = validateDecimal(data.quantityAdded);
    const totalContentOfTanksM3 = validateDecimal(data.totalContentOfTanks);

    let transaction;
    try {
        
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        const query = `
            INSERT INTO LoadingOfOilCargo (recordId, placeOfLoading, typeOfOilLoaded, quantityAddedM3, totalContentOfTanksM3) 
            VALUES (@recordId, @placeOfLoading, @typeOfOilLoaded, @quantityAddedM3, @totalContentOfTanksM3);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("placeOfLoading", sql.NVarChar(150), data.placeOfLoading)
            .input("typeOfOilLoaded", sql.NVarChar(100), data.typeOfOilLoaded)
            .input("quantityAddedM3", sql.Decimal(20, 2), quantityAddedM3)
            .input("totalContentOfTanksM3", sql.Decimal(20, 2),  totalContentOfTanksM3)
            .query(query);

        const operationId = result.recordset[0].operationId;

        if (data.tanks && data.tanks.length > 0) {
            await insertLoadingOilCargoTanks(transaction, operationId, data.tanks);
        }

        await transaction.commit();
        console.log("Transaction committed successfully.");
        return { message: `Loading Oil Cargo submitted successfully ${result.rowsAffected}` };

    } catch (error) {
        console.error("Error in insertLoadingOilCargo:", error);

        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
        
            transaction.release(); 
         
    }
}

async function insertLoadingOilCargoTanks(transaction, operationId, tanks) {
    if (!operationId) {
        throw new Error("Invalid operationId provided.");
    }

    for (const tank of tanks) {
        const query = `
            INSERT INTO LoadingOfOilCargo_Tanks (operationId, tankIdentity, quantityLoadedM3) 
            VALUES (@operationId, @tankIdentity, @quantityLoadedM3)
        `;

        await transaction.request()
            .input("operationId", sql.Int, operationId)
            .input("tankIdentity", sql.NVarChar(100), tank.tankIdentity)
            .input("quantityLoadedM3", sql.Decimal(20, 2), tank.quantityLoadedM3)
            .query(query);
    }
}

async function insertInternalTransfer(recordId, data) {
    let transaction;

    try {
        console.log("RecordId ", recordId, "\nData ", data);

        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }

        const quantityTransferredM3 = validateDecimal(data.quantityTransferred);
        const totalQuantityOfTanksM3 = validateDecimal(data.totalQuantityTanks);
        const quantityRetainedM3 = validateDecimal(data.quantityRetained);

        // Start transaction
         
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        const query = `
            INSERT INTO InternalTransferOfOilCargo 
            ( recordId, fromTank, toTank, quantityTransferredM3, totalQuantityOfTanksM3, tankEmptied, quantityRetainedM3) 
            VALUES 
            ( @recordId, @fromTank, @toTank, @quantityTransferredM3, @totalQuantityOfTanksM3, @tankEmptied, @quantityRetainedM3);
            SELECT SCOPE_IDENTITY() AS operationId;
        `;

        const result = await transaction.request()
            .input("recordId", sql.Int, recordId)
            .input("fromTank", sql.NVarChar(100), data.fromTank || "Unknown")
            .input("toTank", sql.NVarChar(100), data.toTank || "Unknown")
            .input("quantityTransferredM3", sql.Decimal(20, 2), quantityTransferredM3)
            .input("totalQuantityOfTanksM3", sql.Decimal(20, 2), totalQuantityOfTanksM3)
            .input("tankEmptied", sql.NVarChar(10), data.tankEmptied || "No")
            .input("quantityRetainedM3", sql.Decimal(20, 2), quantityRetainedM3)
            .query(query);

        const operationId = result.recordset[0].operationId;

        // Insert related tank entries
        if (data.tanks && data.tanks.length > 0) {
            await insertInternalTransferTanks(transaction, operationId, data.tanks);
        }

        // Commit transaction
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Internal Transfer submitted successfully` };

    } catch (error) {
        console.error("Error in insertInternalTransfer:", error.message);

        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed: " + error.message);
    } finally {
       
            transaction.release(); 
         
    }
}

async function insertInternalTransferTanks(transaction, operationId, tanks) {
    for (const tank of tanks) {
        try {
            const query = `
                INSERT INTO InternalTransfer_Tanks (operationId, tankIdentity) 
                VALUES (@operationId, @tankIdentity);
            `;

            await transaction.request()
                .input("operationId", sql.Int, operationId)
                .input("tankIdentity", sql.NVarChar(100), tank)
                .query(query);

        } catch (error) {
            console.error(`Error inserting tank ${tank}:`, error.message);
            throw new Error(`Error inserting tank ${tank}: ${error.message}`);
        }
    }
}

async function insertUnloadingCargo(operationId, data) {
    let transaction;

    try {
        // Start a transaction
        
        transaction = new sql.Transaction(await pool); 
        await transaction.begin();
        console.log("Transaction started...");

        // Insert into UnloadingOfOilCargo table
        const query1 = `
            INSERT INTO UnloadingOfOilCargo ( recordId, placeOfUnloading, tankEmptied, quantityRetainedM3) 
            VALUES ( @recordId, @placeOfUnloading, @tankEmptied, @quantityRetainedM3);
            SELECT SCOPE_IDENTITY() AS newOperationId;
        `;

        // Validate decimal values
        function validateDecimal(value, precision = 10, scale = 2) {
            if (typeof value !== "number" || isNaN(value)) return 0.0;
            return parseFloat(value.toFixed(scale));
        }
        const quantityRetainedUnloadM3 = validateDecimal(data.quantityRetainedUnload);

        const result1 = await transaction.request()
            .input("recordId", sql.Int, operationId)
            .input("placeOfUnloading", sql.NVarChar(150), data.placeOfUnloading)
            .input("tankEmptied", sql.NVarChar(10), data.tankEmptiedUnload)
            .input("quantityRetainedM3", sql.Decimal(10, 2), quantityRetainedUnloadM3)
            .query(query1);

        const newOperationId = result1.recordset[0].newOperationId; // Get the inserted operationId
        console.log("Inserted into UnloadingOfOilCargo with operationId:", newOperationId);

        // Insert into UnloadingOfOilCargo_Tanks for each tank entry
        if (data.tanks && data.tanks.length > 0) {
            const query2 = `
                INSERT INTO UnloadingOfOilCargo_Tanks (operationId, tankIdentity) 
                VALUES (@operationId, @tankIdentity);
            `;

            for (const tank of data.tanks) {
                await transaction.request()
                    .input("operationId", sql.Int, newOperationId)
                    .input("tankIdentity", sql.NVarChar(100), tank)
                    .query(query2);
            }
            console.log("Inserted into UnloadingOfOilCargo_Tanks successfully.");
        }

        // Commit transaction
        await transaction.commit();
        console.log("Transaction committed successfully.");

        return { message: `Unloading Cargo submitted successfully with operationId ${newOperationId}` };

    } catch (error) {
        console.error("Error inserting Unloading Cargo:", error);

        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
            console.log("Transaction rolled back due to an error.");
        }

        throw new Error("Database operation failed");
    } finally {
        
            transaction.release();
        
    }
}

async function fetchLoadingOilCargo(vesselId) {
    try {
       
        const result = await pool.request()
        .input("vesselId",sql.Int,vesselId)
        .query(`
            SELECT 
    -- ORB Record Details
    
    
    o.approvedby,
    o.approvalStatus,
    u.fullname AS createdBy,  
    

    -- Loading of Oil Cargo Details
    
    loc.placeOfLoading,
    loc.typeOfOilLoaded,
    loc.quantityAddedM3,
    loc.totalContentOfTanksM3,
    loc.createdAt,

    -- Grouped Tank Identities
    STRING_AGG(loct.tankIdentity, ', ') AS tankIdentities,
    STRING_AGG(CAST(loct.quantityLoadedM3 AS NVARCHAR), ', ') AS quantityLoadedPerTank

FROM tbl_orb_2 o
-- Link ORB to User to get fullname
INNER JOIN tbl_user u ON o.createdBy = u.user_id 
-- Link ORB to Loading Of Oil Cargo
INNER JOIN LoadingOfOilCargo loc ON o.recordId = loc.recordId 
-- Link Loading Of Oil Cargo to Tanks
LEFT JOIN LoadingOfOilCargo_Tanks loct ON loc.operationId = loct.operationId

WHERE o.vesselId = @vesselId
GROUP BY 
    o.recordId, o.recordName, o.approvedby, o.approvalStatus, u.fullname, 
    loc.operationId, loc.placeOfLoading, loc.typeOfOilLoaded, loc.quantityAddedM3, loc.totalContentOfTanksM3,loc.createdAt;
`);
        return result.recordset || [];
    } catch (error) {
        console.error(error);
        return { message: "Error fetching Loading Oil Cargo records" };
    }
}

async function fetchInternalTransfer(vesselId) {
    try {
        
        const result = await pool.request()
        .input("vesselId",sql.Int,vesselId)
        .query(`
            SELECT 
    -- ORB Record Details
    
    o.approvedby,
    o.approvalStatus,
    u.fullname AS createdBy,  

    -- Internal Transfer of Oil Cargo Details
    itoc.fromTank,
    itoc.toTank,
    itoc.quantityTransferredM3,
    itoc.totalQuantityOfTanksM3,
    itoc.tankEmptied,
    itoc.quantityRetainedM3,
    itoc.createdAt,

    -- Grouped Tank Identities
    STRING_AGG(it.tankIdentity, ', ') AS tankIdentities

FROM tbl_orb_2 o
-- Link ORB to User to get fullname
INNER JOIN tbl_user u ON o.createdBy = u.user_id 
-- Link ORB to Internal Transfer Of Oil Cargo
INNER JOIN InternalTransferOfOilCargo itoc ON o.recordId = itoc.recordId 
-- Link Internal Transfer Of Oil Cargo to Tanks
LEFT JOIN InternalTransfer_Tanks it ON itoc.operationId = it.operationId

WHERE o.vesselId = @vesselId
GROUP BY 
    o.recordId, o.approvedby, o.approvalStatus, u.fullname, 
    itoc.operationId, itoc.fromTank, itoc.toTank, itoc.quantityTransferredM3, 
    itoc.totalQuantityOfTanksM3, itoc.tankEmptied, itoc.quantityRetainedM3, itoc.createdAt;

            `);
        return result.recordset || [];
    } catch (error) {
        console.error(error);
        return { message: "Error fetching Internal Transfer Of Oil Cargo records" };
    }
}

async function fetchUnloadingCargo(vessel) {
    try {
        
        const result = await pool.request()
        .input("vesselId",sql.Int,vessel)
        .query(`
            SELECT 
    -- ORB Record Details
    
    o.approvedby,
    o.approvalStatus,
    u.fullname AS createdBy,  

    -- Unloading of Oil Cargo Details
    uo.placeOfUnloading,
    uo.tankEmptied,
    uo.quantityRetainedM3,
    uo.createdAt ,

    -- Grouped Tank Identities
    STRING_AGG(uot.tankIdentity, ', ') AS tankIdentities

FROM tbl_orb_2 o
-- Link ORB to User to get fullname
INNER JOIN tbl_user u ON o.createdBy = u.user_id 

-- Link ORB to Unloading Of Oil Cargo
INNER JOIN UnloadingOfOilCargo uo ON o.recordId = uo.recordId 

-- Link Unloading Of Oil Cargo to Tanks
LEFT JOIN UnloadingOfOilCargo_Tanks uot ON uo.operationId = uot.operationId

WHERE o.vesselId = @vesselId
GROUP BY 
    o.recordId, o.approvedby, o.approvalStatus, u.fullname, 
    uo.operationId, uo.placeOfUnloading, uo.tankEmptied, 
    uo.quantityRetainedM3, uo.createdAt;

            `);
        console.log(result.recordset);
        return result.recordset || [];
    } catch (error) {
        console.error(error);
        return { message: "Error fetching Loading Oil Cargo records" };
    }
}

async function findOperationIdofCOW(recordId) {
    try {
        if (!recordId) {
            throw new Error("recordId is required to get Crude Oil Washing details");
        }

        const res = await pool.request()
            .input("recordId", sql.Int, recordId)
            .query(`SELECT operationId FROM CrudeOilWashing WHERE recordId = @recordId`);

        return res.recordset.length ? res.recordset[0].operationId : null;
    } catch (error) {
        console.error("Service error:", error);
        throw new Error("Database operation failed");
    }
}


async function fetchCrudeOilWashing(operationsId, user, vessel) {
    try {
        console.log("Fetching Crude Oil Washing for:", operationsId, user, vessel);

        // Step 1: Get `operationId` from `CrudeOilWashing`
        const operationId = await findOperationIdofCOW(operationsId);
        if (!operationId) {
            throw new Error("No operation found in CrudeOilWashing.");
        }
        
        //  Execute main query
        const result = await pool.request()
            
            .input("user", sql.Int, user)
            .input("vessel", sql.Int, vessel)
            .query(`
                SELECT 
    u.fullname AS CreatedBy,
    o.approvedby, 
    o.approvalStatus,  
    o.createdAt,
    t.tankIdentity, 
    t.portOfWash, 
    t.shipPosition, 
    t.machinesInUse, 
    t.startTimeWashing,
    t.washingPattern, 
    t.washingLinePressure, 
    t.stopTimeWashing,
    t.cleanlinessMethod, 
    t.remarks
FROM tbl_orb_2 o
INNER JOIN tbl_ship s ON o.vesselId = s.id 
INNER JOIN tbl_user u ON o.createdBy = u.user_id 
INNER JOIN CrudeOilWashing c ON o.recordId = c.recordId 
LEFT JOIN CrudeOilWashing_Tanks t ON c.operationId = t.operationId
WHERE o.vesselId = @vessel AND o.createdBy = @user ;
`);

        console.log(result.recordset);
        return result.recordset || [];
    } catch (error) {
        console.error("Error fetching Crude Oil Washing records:", error);
        return { message: "Error fetching Crude Oil Washing records" }
    }
}

async function fetchBallastingOfCargoTanks(recordId) {
    try {
    console.log(recordId);
        if (!recordId || isNaN(recordId)) {
            throw new Error("Invalid vesselId provided.");
        }
        
        const query = `
           SELECT 
    -- ORB Record Details
    
    o.approvedby,
    o.approvalStatus,
    u.fullname AS createdBy,

    -- Ballasting Details
    b.startBallastingPlace,
    b.endBallastingPlace,
    b.createdAt,

    -- Grouped Tank Identities
    STRING_AGG(bt.tankIdentity, ', ') AS tankIdentities

FROM tbl_orb_2 o
-- Link ORB to User to get fullname
INNER JOIN tbl_user u ON o.createdBy = u.user_id 
-- Link ORB to Ballasting Operations
INNER JOIN Ballasting b ON o.recordId = b.recordId 
-- Link Ballasting Operations to Ballasting Tanks
LEFT JOIN BallastingTanks bt ON b.operationId = bt.ballastingId

WHERE o.vesselId = @vesselId
GROUP BY 
    o.recordId, o.approvedby, o.approvalStatus, u.fullname, 
    b.startBallastingPlace, b.endBallastingPlace,b.createdAt; `;
     
        const result = await pool.request()
        .input("vesselId",sql.Int,recordId)
        .query(query);

        return result.recordset;

    } 
    catch (error) {
        console.error("Error in fetchBallastingOfCargoTanks:", error.message);
        throw new Error("Database query failed: " + error.message);
    }
}

async function fetchCleanBallastingTanks(recordId) {
    try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = `SELECT 
            -- ORB Record Details
             u.fullname AS createdBy,
            o.approvedby,
            o.approvalStatus,
             
        
            -- CBT Ballasting Details
            cb.port,
            cb.positionFlushed,
            cb.oilyWaterQty,
            cb.cleanBallastQty,
            cb.valveTime,
            cb.valvePosition,
            cb.createdAt,
        
            -- Grouped Tank Identities
            STRING_AGG(bt.tankIdentity, ', ') AS tankIdentities
        
        FROM tbl_orb_2 o
        -- Link ORB to User to get fullname
        INNER JOIN tbl_user u ON o.createdBy = u.user_id 
        -- Link ORB to CBT Ballasting
        INNER JOIN CbtBallasting cb ON o.recordId = cb.recordId 
        -- Link CBT Ballasting to Tanks
        LEFT JOIN CbtBallastingTanks bt ON cb.operationId = bt.operationId
        
        WHERE o.vesselId = @vesselId
        GROUP BY 
            o.recordId, o.approvedby, o.approvalStatus, u.fullname, 
            cb.operationId, cb.port, cb.positionFlushed, cb.oilyWaterQty, 
            cb.cleanBallastQty, cb.valveTime, cb.valvePosition,cb.createdAt;
         `;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
        catch (error) {
            console.error("Error in fetchBallastingOfCargoTanks:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}

async function fetchCargoTankCleaning(recordId)
    {
    
        try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = `SELECT 
    -- ORB Record Details
    
    u.fullname AS createdBy,
    o.approvedby,
    o.approvalStatus,
      

    -- Cargo Tank Cleaning Details
    c.portOrShipPosition,
    c.durationOfCleaning,
    c.methodOfCleaning,
    c.tanksWashingTransferredTo,
    c.quantityTransferred,
    c.totalQuantity,
    c.portRf AS Port,
    c.quantityRf AS Quantity,
    c.createdAt ,

    -- Grouped Tank Identities
    STRING_AGG(t.tankIdentity, ', ') AS tankIdentities

FROM tbl_orb_2 o
-- Link ORB to User to get fullname
INNER JOIN tbl_user u ON o.createdBy = u.user_id 
-- Link ORB to Cargo Tank Cleaning
INNER JOIN CargoTankCleaning c ON o.recordId = c.recordId 
-- Link Cargo Tank Cleaning to Tanks
LEFT JOIN CargoTankCleaningTanks t ON c.operationId = t.operationId

WHERE o.vesselId = @vesselId
GROUP BY 
    o.recordId, o.approvedby, o.approvalStatus, u.fullname, 
    c.operationId, c.portOrShipPosition, c.durationOfCleaning, 
    c.methodOfCleaning, c.tanksWashingTransferredTo, c.quantityTransferred, 
    c.totalQuantity, c.portRf, c.quantityRf, c.createdAt;

         `;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
    catch (error) {
            console.error("Error in fetchBallastingOfCargoTanks:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}

async function fetchDODB(recordId) {
    try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = `SELECT 
    -- ORB Record Details
	 u.fullname AS createdBy,
    
    o.approvedby,
    o.approvalStatus,
     

    -- Dirty Ballast Discharge Details
  
    dbd.dischargeStartTime,
    dbd.dischargeStartPosition,
    dbd.dischargeCompleteTime,
    dbd.dischargeCompletePosition,
    dbd.shipSpeedKnots,
    dbd.quantityDischargedM3,
    dbd.monitoringSystem,
    dbd.regularCheckup,
    dbd.shorePort,
    dbd.shoreQuantityM3,
    dbd.createdAt ,

    -- Grouped Tank Identities (Dirty Ballast Discharge Tanks)
    STRING_AGG(dbdt.tankIdentity, ', ') AS dirtyBallastTankIdentities,

    -- Grouped Oily Water Slop Tank Identities
    STRING_AGG(owst.slopTankIdentity, ', ') AS slopTankIdentities

FROM tbl_orb_2 o
-- Link ORB to User to get fullname
INNER JOIN tbl_user u ON o.createdBy = u.user_id 

-- Link ORB to Dirty Ballast Discharge
INNER JOIN DirtyBallastDischarge dbd ON o.recordId = dbd.recordId 

-- Link Dirty Ballast Discharge to Tanks
LEFT JOIN DirtyBallastDischargeTanks dbdt ON dbd.operationId = dbdt.operationId

-- Link Dirty Ballast Discharge to Oily Water Slop Tanks
LEFT JOIN OilyWaterSlopTanks owst ON dbd.operationId = owst.operationId

WHERE o.vesselId = @vesselId
GROUP BY 
    o.recordId, o.approvedby, o.approvalStatus, u.fullname, 
    dbd.operationId, dbd.dischargeStartTime, dbd.dischargeStartPosition, 
    dbd.dischargeCompleteTime, dbd.dischargeCompletePosition, 
    dbd.shipSpeedKnots, dbd.quantityDischargedM3, dbd.monitoringSystem, 
    dbd.regularCheckup, dbd.shorePort, dbd.shoreQuantityM3, dbd.createdAt;
         `;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
    catch (error) {
            console.error("Error in fetchDischarge of Dirty Ballast:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}

async function fetchDischargeWaterSlopTanks(recordId){

    try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = ` SELECT 
            -- ORB Record Details
            u.fullname AS createdBy,
            
            o.approvedby,
            o.approvalStatus,
        
            -- Slop Tank Discharge Details
            
            std.settlingLastResidues,
            std.settlingLastDischarge,
            std.rateOfDischarge,
            std.ullageCompletion,
            std.valvesClosed,
            std.createdAt,
        
            -- Grouped Slop Tank Identities
            STRING_AGG(stdt.tankIdentity, ', ') AS slopTankIdentities
        
        FROM tbl_orb_2 o
        
        -- Link ORB to User to get creator's fullname
        INNER JOIN tbl_user u ON o.createdBy = u.user_id
        
        -- Link ORB to Slop Tank Discharge
        INNER JOIN SlopTankDischarge std ON o.recordId = std.recordId
        
        -- Link Slop Tank Discharge to its tanks
        LEFT JOIN SlopTankDischargeTanks stdt ON std.operationId = stdt.operationId
        
        WHERE o.vesselId = @vesselId
        
        GROUP BY 
            o.recordId, o.approvedby, o.approvalStatus, u.fullname,
            std.operationId, std.settlingLastResidues, std.settlingLastDischarge, 
            std.rateOfDischarge, std.ullageCompletion, std.valvesClosed, std.recordId,std.createdAt;
        `;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
    catch (error) {
            console.error("Error in fetchDischarge of Dirty Ballast:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}

async function fetchCTDOfResidues(vesselId) {
    try {
        if (!vesselId || isNaN(vesselId)) {
            throw new Error("Invalid vesselId provided.");
        }

        const methods = [
            "reception facility",
            "mixed cargo",
            "other method",
            "transfer to tank"
        ];

        const unifiedResults = [];

        for (const method of methods) {
            const result = await pool
                .request()
                .input("vesselId", sql.Int, vesselId)
                .input("methodOfDisposal", sql.NVarChar, method)
                .execute("sp_GetResidueTransferDisposalDetails");

            const records = result.recordset;

            for (const row of records) {
                // Normalize the row structure by ensuring all expected fields exist
                unifiedResults.push({
                    createdBy: row.createdBy ?? null,
                    recordId: row.recordId ?? null,
                    approvedby: row.approvedby ?? null,
                    approvalStatus: row.approvalStatus ?? null,
                    createdAt: row.createdAt ?? null,
                    operationId: row.operationId ?? null,
                    methodOfDisposal: method,
                    
                    // Fields based on method
                    portName: row.portName ?? null,
                    quantityInvolved: row.quantityInvolved ?? null,
                    quantityMixed: row.quantityMixed ?? null,
                    methodName: row.methodName ?? null,
                    quantityDisposed: row.quantityDisposed ?? null,
                    quantityTransferred: row.quantityTransferred ?? null,
                    totalQuantity: row.totalQuantity ?? null,
                    tankIdentities: row.tankIdentities ?? null,
                });
            }
        }

        return unifiedResults;

    } catch (error) {
        console.error("Error in fetchCTDOfResidues:", error.message);
        throw new Error("Failed to fetch residue transfer and disposal details.");
    }
}

async function fetchDischargeOfCleanBallast(recordId){
    try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = `SELECT 
    -- ORB Record Details
    u.fullname AS createdBy,
   
    o.approvedby,
    o.approvalStatus,

    -- Clean Ballast Discharge Details
    
    cbd.positionStart,
    cbd.positionCompletion,
    cbd.tankEmptyCompletion,
    cbd.regularCheck,
    cbd.createdAt,

    -- Grouped Tank Identities (Clean Ballast Discharge Tanks)
    STRING_AGG(cbdt.tankIdentity, ', ') AS cleanBallastTankIdentities

FROM tbl_orb_2 o

-- Link ORB to User to get fullname
INNER JOIN tbl_user u ON o.createdBy = u.user_id

-- Link ORB to Clean Ballast Discharge
INNER JOIN CleanBallastDischarge cbd ON o.recordId = cbd.recordId

-- Link Clean Ballast Discharge to Tanks
LEFT JOIN CleanBallastDischargeTanks cbdt ON cbd.operationId = cbdt.operationId

WHERE o.vesselId = @vesselId

GROUP BY 
    o.approvedby, o.approvalStatus, u.fullname,
     cbd.positionStart, cbd.positionCompletion,cbd.createdAt, 
    cbd.tankEmptyCompletion, cbd.regularCheck;`;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
    catch (error) {
            console.error("Error in fetchDischarge of Dirty Ballast:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}

async function fetchDischargeOfBallastFromDedicated(recordId){
    try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = `SELECT 
            -- ORB Record Details
            u.fullname AS createdBy,
            
            o.approvedby,
            o.approvalStatus,
            
            -- CBT Ballast Discharge Details
            
            cbd.posStart,
            cbd.timeStart,
            cbd.posCompletion,
            cbd.timeCompletion,
            cbd.qtySea,
            cbd.qtyReception,
            cbd.portReception,
            cbd.oilContamination,
            cbd.monitoredByOilMeter,
            cbd.valveClosePos,
            cbd.valveCloseTime,
            o.createdAt,
        
            -- Grouped Tank Identities (CBT Ballast Discharge Tanks)
            STRING_AGG(cbdt.tankIdentity, ', ') AS cbtBallastTankIdentities
        
        FROM tbl_orb_2 o
        
        -- Link ORB to User to get fullname
        INNER JOIN tbl_user u ON o.createdBy = u.user_id 
        
        -- Link ORB to CBT Ballast Discharge
        INNER JOIN CbtBallastDischarge cbd ON o.recordId = cbd.recordId
        
        -- Link CBT Ballast Discharge to Tanks
        LEFT JOIN CbtBallastDischargeTanks cbdt ON cbd.operationId = cbdt.operationId
        
        WHERE o.vesselId = @vesselId
        
        GROUP BY 
            o.approvedby, o.approvalStatus, u.fullname, o.createdAt,
            cbd.posStart, cbd.timeStart, cbd.posCompletion, cbd.timeCompletion,
            cbd.qtySea, cbd.qtyReception, cbd.portReception, cbd.oilContamination,
            cbd.monitoredByOilMeter, cbd.valveClosePos, cbd.valveCloseTime;
        
         `;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
    catch (error) {
            console.error("Error in fetchDischarge of Dirty Ballast:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}

async function fetchConditionOfODMAC(recordId){
    try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = `SELECT 
    -- ORB Record Details
    u.fullname AS createdBy,
    o.approvedby,
    o.approvalStatus,
    
    -- Oil Discharge Monitoring System Details
    odms.timeOfSystemFailure,
    odms.timeSystemOperational,
    odms.reasonForFailure,
    odms.createdAt

FROM tbl_orb_2 o

-- Link ORB to User to get creator's fullname
INNER JOIN tbl_user u ON o.createdBy = u.user_id

-- Link ORB to Oil Discharge Monitoring System
INNER JOIN OilDischargeMonitoringSystem odms ON o.recordId = odms.recordId

WHERE o.vesselId = @vesselId; `;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
    catch (error) {
            console.error("Error in fetchDischarge of Dirty Ballast:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}

async function fetchAccidentOrOtherExceptional(recordId){
    try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = `SELECT 
            -- ORB Record Details
            u.fullname AS createdBy,
            
            o.approvedby,
            o.approvalStatus,
        
            -- Accidental Discharge Details
           
            ad.timeOfOccurrence,
            ad.portAtTimeOfOccurrence,
            ad.positionOfShip,
            ad.approximateQuantityM3,
            ad.typeOfOil,
            ad.circumstances,
            ad.reasons,
            ad.generalRemarks,
            o.createdAt
        
        FROM tbl_orb_2 o
        
       
        INNER JOIN tbl_user u ON o.createdBy = u.user_id
        
        
        INNER JOIN AccidentalDischarge ad ON o.recordId = ad.recordId
        
        WHERE o.vesselId = @vesselId;
        
         `;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
    catch (error) {
            console.error("Error in fetchDischarge of Dirty Ballast:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}

async function fetchAdditionalOperationalProcedures(recordId){
    try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = `SELECT 
            -- ORB Record Details
            u.fullname AS createdBy,
            
            o.approvedby,
            o.approvalStatus,
            
        
            -- Additional Procedures Operation Details
            
            ap.additionalProcedures,
            ap.generalRemarks,
            ap.createdAt
        
        FROM tbl_orb_2 o
        
        -- Link ORB to User to get fullname
        INNER JOIN tbl_user u ON o.createdBy = u.user_id 
        
        -- Link ORB to Additional Procedures
        INNER JOIN AdditionalProcedures ap ON o.recordId = ap.recordId
        
        WHERE o.vesselId = @vesselId
                 `;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
    catch (error) {
            console.error("Error in fetchDischarge of Dirty Ballast:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}

async function fetchLoadingOfBallastWater(recordId){
    try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = `SELECT 
            -- ORB Record Details
            u.fullname AS createdBy,
            
            o.approvedby,
            o.approvalStatus,
        
            -- Loading Ballast Water Details
         
            lbw.positionOfShip,
            lbw.totalQuantityM3,
            lbw.remarks,
            
        
            o.createdAt,
        
            -- Grouped Tank Identities (Loading Ballast Water Tanks)
            STRING_AGG(lbt.tankIdentity, ', ') AS ballastTankIdentities
        
        FROM tbl_orb_2 o
        
        -- Link ORB to User to get fullname
        INNER JOIN tbl_user u ON o.createdBy = u.user_id
        
        -- Link ORB to LoadingBallastWater
        INNER JOIN LoadingBallastWater lbw ON o.recordId = lbw.recordId
        
        -- Link LoadingBallastWater to Tanks
        LEFT JOIN LoadingBallastWaterTanks lbt ON lbw.operationId = lbt.operationId
        
        WHERE o.vesselId = @vesselId
        
        GROUP BY 
             o.approvedby, o.approvalStatus, u.fullname,
            lbw.positionOfShip, lbw.totalQuantityM3, 
            lbw.remarks,  o.createdAt;
        
         `;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
    catch (error) {
            console.error("Error in fetchDischarge of Dirty Ballast:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}

async function fetchReallocationOfBallastWater(recordId){
    try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = `SELECT 
            -- ORB Record Details
            u.fullname AS createdBy,
           
            o.approvedby,
            o.approvalStatus,
        
            -- Reallocation Ballast Water Details
           
            rbw.reason,
        
            o.createdAt
        
        FROM tbl_orb_2 o
        
        -- Link ORB to User to get fullname
        INNER JOIN tbl_user u ON o.createdBy = u.user_id
        
        -- Link ORB to ReallocationBallastWater
        INNER JOIN ReallocationBallastWater rbw ON o.recordId = rbw.recordId
        
        WHERE o.vesselId = @vesselId;
        
         `;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
    catch (error) {
            console.error("Error in fetchDischarge of Dirty Ballast:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}

async function fetchBallastWaterDischargeToRF(recordId){
    try {
        console.log(recordId);
            if (!recordId || isNaN(recordId)) {
                throw new Error("Invalid vesselId provided.");
            }
            
            const query = `SELECT 
            -- ORB Record & User Details
            u.fullname AS createdBy,
            
            o.approvedby,
            o.approvalStatus,
            o.createdAt,
        
            -- Ballast Water Discharge Reception Details
            
            bwdr.portName,
            bwdr.receptionFacility,
            bwdr.totalQuantityDischarged
        
        FROM tbl_orb_2 o
        
        -- Link ORB to User to get creator name
        INNER JOIN tbl_user u ON o.createdBy = u.user_id
        
        -- Link ORB to Ballast Water Discharge Reception
        INNER JOIN BallastWaterDischargeReception bwdr ON o.recordId = bwdr.recordId
        
        WHERE o.vesselId = @vesselId
        
         `;
         
            const result = await pool.request()
            .input("vesselId",sql.Int,recordId)
            .query(query);
    
            return result.recordset;
    
        } 
    catch (error) {
            console.error("Error in fetchDischarge of Dirty Ballast:", error.message);
            throw new Error("Database query failed: " + error.message);
        }
}


export async function fetchReceptionFacility(vessel) {
    try {
      
      const result = await pool.request()
        .input("vesselId", sql.Int, vessel)
        .query(`
            SELECT
	u.fullname AS createdByName,
	o.approvedby,
    o.approvalStatus,
    
    r.portName, 
	r.quantityInvolved,
    d.methodOfDisposal,
	r.createdAt
FROM DisposalReceptionFacility r
INNER JOIN ResidueTransferDisposal d ON r.operationId = d.operationId
INNER JOIN tbl_orb_2 o ON d.recordId = o.recordId
INNER JOIN tbl_user u ON o.createdBy = u.user_id
INNER JOIN tbl_ship s ON o.vesselId = s.id
WHERE o.vesselId = @vesselId;

            `);
      return result.recordset;
    } catch (err) {
      throw new Error("Failed to fetch Reception Facility data: " + err.message);
    }
  }
  
  export async function fetchMixedCargo(vessel) {
    try {
      
      const result = await pool.request()
        .input("vesselId", sql.Int, vessel)
        .query(`
            SELECT 
	u.fullname AS createdBy,
	o.approvedby,
    o.approvalStatus,
    m.quantityMixed,
    d.methodOfDisposal,
	m.createdAt
FROM DisposalMixedCargo m
INNER JOIN ResidueTransferDisposal d ON m.operationId = d.operationId
INNER JOIN tbl_orb_2 o ON d.recordId = o.recordId
INNER JOIN tbl_user u ON o.createdBy = u.user_id
INNER JOIN tbl_ship s ON o.vesselId = s.id
WHERE o.vesselId = @vesselId;

            `);
      return result.recordset;
    } catch (err) {
      throw new Error("Failed to fetch Mixed Cargo data: " + err.message);
    }
  }
  
  export async function fetchOtherMethod(vessel) {
    try {
      
      const result = await pool.request()
        .input("vesselId", sql.Int, vessel)
        .query(`SELECT 
    -- ORB2 core details
    o.approvedby,
    o.approvalStatus,
   

    -- Created by user details
    
    u1.fullname AS createdBy,


    

    -- ResidueTransferDisposal
    d.methodOfDisposal,

    -- DisposalOtherMethod
    om.methodName,
    om.quantityDisposed,
    om.createdAt

FROM DisposalOtherMethod om
INNER JOIN ResidueTransferDisposal d ON om.operationId = d.operationId
INNER JOIN tbl_orb_2 o ON d.recordId = o.recordId
INNER JOIN tbl_ship s ON o.vesselId = s.id

-- Join for createdBy user
LEFT JOIN tbl_user u1 ON o.createdBy = u1.user_id

-- Join for approvedBy user
LEFT JOIN tbl_user u2 ON o.approvedby = u2.user_id

WHERE o.vesselId = @vesselId;
`);
      return result.recordset;
    } catch (err) {
      throw new Error("Failed to fetch Other Method data: " + err.message);
    }
  }
  
  export async function fetchTransferToTank(vessel) {
    try {

      const result = await pool.request()
        .input("vesselId", sql.Int, vessel)
        .query(`SELECT 

            -- User Details
            u.fullname AS createdBy,
            -- ORB2 Details
           
            o.approvedby,
            o.approvalStatus,
            
        
            -- ResidueTransferDisposal Details
            
            d.methodOfDisposal,
        
            -- Transfer Tank Info
            t.quantityTransferred,
            t.totalQuantity,
            t.createdAt ,
        
            -- Grouped Tank Identities
            STRING_AGG(l.tankIdentity, ', ') AS tankIdentities
        
        FROM DisposalTransferTanks t
        INNER JOIN DisposalTransferTankList l ON t.transferId = l.transferId
        INNER JOIN ResidueTransferDisposal d ON t.operationId = d.operationId
        INNER JOIN tbl_orb_2 o ON d.recordId = o.recordId
        INNER JOIN tbl_user u ON o.createdBy = u.user_id
        INNER JOIN tbl_ship s ON o.vesselId = s.id
        
        WHERE o.vesselId = @vesselId
        
        GROUP BY 
            o.recordId, o.recordName, o.approvedby, o.approvalStatus,
            o.createdBy, o.vesselId, o.createdAt,
            u.fullname,
            d.operationId, d.methodOfDisposal,
            t.quantityTransferred, t.totalQuantity, t.createdAt;
         `);
      return result.recordset;
    } catch (err) {
      throw new Error("Failed to fetch Transfer to Tank data: " + err.message);
    }
  }
export  { processOperation, fetchOperation }
