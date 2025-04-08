import sql from "mssql";
import { getPool } from "../config/DBConfig.js";

let pool;

(async () => {
    try {
            pool = await getPool();
        } catch (err) {
            console.error('Error while getting pool in ODS record Services', err);
        }
})();

//Function to create and check ODSOPeration Data
async function checkAndCreate(operation, user, vessel) {
    try {
       
        const approvedby = 1;
        const approvalStatus = 0;
        
        // Check if operation exists
        const res = await pool
            .request()
            .input("operationName", sql.NVarChar, operation)
            .query("SELECT operationId FROM tbl_ODSOperation WHERE operationName = @operationName");

        if (!res.recordset.length) {
           
            
            await pool
                .request()
                .input("operationName", sql.NVarChar, operation)
                .input("createdBy", sql.Int, user)
                .input("vesselId", sql.Int, vessel)
                .input("approvedby", sql.Int, approvedby)
                .input("approvalStatus", sql.Int, approvalStatus)
                .query(`INSERT INTO tbl_ODSOperation (operationName, createdBy, vesselId, approvedby, approvalStatus) 
                        VALUES (@operationName, @createdBy, @vesselId, @approvedby, @approvalStatus)`);
            
            console.log("Operation created successfully at", new Date());
        } else {
            console.log("Operation already exists");
        }
    } catch (error) {
        
        throw new Error("Database operation failed: " + error.message);
    }
}

// Function to get Operation Name 
async function getOperationByName(operationName, user, vessel) {
    try {
        await checkAndCreate(operationName, user, vessel);

        const result = await pool
            .request()
            .input("operationName", sql.NVarChar, operationName)
            .query("SELECT operationId FROM tbl_ODSOperation WHERE operationName = @operationName");

        return result.recordset.length ? result.recordset[0] : null;
    } catch (error) {
        
        throw new Error("Database query failed: " + error.message);
    }
}


// Retrieve records from ODSRecord by operationId
async function getODSRecordsByOperation(operationId) {
    try {
        const result = await pool
            .request()
            .input("vesselId", sql.Int, operationId)
            .query(`
                SELECT 
    -- ODS Operation Details
   
    o.approvedby,
    o.approvalStatus,
    
    

    -- User Details (Only Fullname)
    u.fullname AS createdBy,  

    -- ODS Record Details
   
    r.operationDate,
    r.locationOnBoard ,
    r.odsName,
    r.capacityKg AS Capacity,
    r.equipmentName AS RecordEquipmentName,
    r.manufacturer,
    r.yearOfInstallation,
    r.processType,
    r.processAmountKg,
    r.occasion,
    r.createdAt

FROM tbl_ODSOperation o
-- Link ODS Operation to User to get createdBy (fullname)
INNER JOIN tbl_user u ON o.createdBy = u.user_id 
-- Link ODS Operation to ODS Record
INNER JOIN ODSRecord r ON o.operationId = r.operationId

WHERE o.vesselId = @vesselId;

                `);
        return result.recordset;
    } 
    
    catch (error) {
        
        throw new Error("Failed to retrieve ODS records: " + error.message);
    }
}

// Retrieve records from ODSEquipment by operationId
async function getODSEquipmentByOperation(operationId) {
    try {
        const result = await pool
            .request()
            .input("vesselId", sql.Int, operationId)
            .query(`
                SELECT 

    -- ODS Operation Details
    
   
    o.approvedby,
    o.approvalStatus,
    

    -- ODS Equipment Details
    
    e.equipmentName,
    e.refrigerant,
    e.locationOnBoard AS EquipmentLocation,
    e.capacityKg AS EquipmentCapacity,
    e.remarks AS EquipmentRemarks,
    e.createdAt ,

	 -- User Details (Only Fullname)
    u.fullname AS createdBy

FROM tbl_ODSOperation o
-- Link ODS Operation to User to get createdBy (fullname)
INNER JOIN tbl_user u ON o.createdBy = u.user_id 
-- Link ODS Operation to ODS Equipment
INNER JOIN ODSEquipment e ON o.operationId = e.operationId

WHERE o.vesselId = @vesselId;

                `);
        return result.recordset;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to retrieve ODS equipment: " + error.message);
    }
}

// Insert into ODSRecord
async function insertODSRecord(data) {
    try {
        const r = data.records;

        // Validation
        const requiredFields = [
            { field: 'operationId', value: data.operationId, type: 'number' },
            { field: 'date', value: r.date, type: 'string' },
            { field: 'locationonboard', value: r.locationonboard, type: 'string' },
            { field: 'ODSName', value: r.ODSName, type: 'string' },
            { field: 'capacity', value: r.capacity, type: 'number' },
            { field: 'equipmentName', value: r.equipmentName, type: 'string' },
            { field: 'Manufacturer', value: r.Manufacturer, type: 'string' },
            { field: 'YOI', value: r.YOI, type: 'number' },
            { field: 'processType', value: r.processType, type: 'string' },
            { field: 'processAmount', value: r.processAmount, type: 'number' },
            { field: 'Occasion', value: r.Occasion, type: 'string' }
        ];

        for (let item of requiredFields) {
            if (
                item.value === undefined ||
                item.value === null ||
                (item.type === 'string' && item.value.trim?.() === '') ||
                (item.type === 'number' && isNaN(item.value))
            ) {
                return {
                    statusCode: 400,
                    message: `Invalid or missing field: ${item.field}`,
                    success: false
                };
            }
        }

        const result = await pool
            .request()
            .input("operationId", sql.Int, data.operationId)
            .input("operationDate", sql.Date, r.date)
            .input("locationOnBoard", sql.NVarChar, r.locationonboard)
            .input("odsName", sql.NVarChar, r.ODSName)
            .input("capacityKg", sql.Decimal(10, 2), parseFloat(r.capacity))
            .input("equipmentName", sql.NVarChar, r.equipmentName)
            .input("manufacturer", sql.NVarChar, r.Manufacturer)
            .input("yearOfInstallation", sql.Int, parseInt(r.YOI))
            .input("processType", sql.NVarChar, r.processType)
            .input("processAmountKg", sql.Decimal(10, 2), parseFloat(r.processAmount))
            .input("occasion", sql.NVarChar, r.Occasion)
            .input("createdAt", sql.DateTime, new Date())
            .query(`
                INSERT INTO ODSRecord (operationId, operationDate, locationOnBoard, odsName, capacityKg, 
                                       equipmentName, manufacturer, yearOfInstallation, processType, 
                                       processAmountKg, occasion, createdAt) 
                VALUES (@operationId, @operationDate, @locationOnBoard, @odsName, @capacityKg, 
                        @equipmentName, @manufacturer, @yearOfInstallation, @processType, 
                        @processAmountKg, @occasion, @createdAt)
            `);

        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return {
                statusCode: 201,
                message: "ODS record inserted successfully.",
                success: true
            };
        } else {
            return {
                statusCode: 500,
                message: "Failed to insert ODS record.",
                success: false
            };
        }

    } catch (error) {
        console.error("insertODSRecord error:", error);
        return {
            statusCode: 500,
            message: "Server error: " + error.message,
            success: false
        };
    }
}


// Insert into ODSEquipment
async function insertODSEquipment(data) {
    try {
        const e = data.equipment;

        const requiredFields = [
            { field: 'operationId', value: data.operationId, type: 'number' },
            { field: 'en', value: e.en, type: 'string' },
            { field: 'refrigerant', value: e.refrigerant, type: 'string' },
            { field: 'location', value: e.location, type: 'string' },
            { field: 'capacity', value: e.capacity, type: 'number' },
            { field: 'remarks', value: e.remarks, type: 'string' }
        ];

        for (let item of requiredFields) {
            if (
                item.value === undefined ||
                item.value === null ||
                (item.type === 'string' && item.value.trim?.() === '') ||
                (item.type === 'number' && isNaN(item.value))
            ) {
                return {
                    statusCode: 400,
                    message: `Invalid or missing field: ${item.field}`,
                    success: false
                };
            }
        }

        const result = await pool
            .request()
            .input("operationId", sql.Int, data.operationId)
            .input("equipmentName", sql.NVarChar, e.en)
            .input("refrigerant", sql.NVarChar, e.refrigerant)
            .input("locationOnBoard", sql.NVarChar, e.location)
            .input("capacityKg", sql.Decimal(10, 2), parseFloat(e.capacity))
            .input("remarks", sql.NVarChar, e.remarks)
            .input("createdAt", sql.DateTime, new Date())
            .query(`
                INSERT INTO ODSEquipment (operationId, equipmentName, refrigerant, locationOnBoard, capacityKg, remarks, createdAt)
                VALUES (@operationId, @equipmentName, @refrigerant, @locationOnBoard, @capacityKg, @remarks, @createdAt)
            `);

        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return {
                statusCode: 201,
                message: "ODS equipment inserted successfully.",
                success: true
            };
        } else {
            return {
                statusCode: 500,
                message: "Failed to insert ODS equipment.",
                success: false
            };
        }

    } catch (error) {
        console.error("insertODSEquipment error:", error);
        return {
            statusCode: 500,
            message: "Server error: " + error.message,
            success: false
        };
    }
}


export  { getOperationByName, insertODSRecord, insertODSEquipment, getODSEquipmentByOperation, getODSRecordsByOperation };
