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

function flattenObject(obj, parent = "", res = {}) {
    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
  
      const value = obj[key];
  
      if (Array.isArray(value)) {
        value.forEach(item => {
          flattenObject(item, "", res); 
        });
      } else if (typeof value === "object" && value !== null) {
        flattenObject(value, "", res); 
      } else {
        res[key] = value; 
      }
    }
    return res;
  }
  
  
  function prettifyKeys(obj) {
    const newObj = {};
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
  
      const prettyKey = key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, str => str.toUpperCase());
  
      newObj[prettyKey] = obj[key];
    }
    return newObj;
  }
  
  function formatDates(obj) {
    const isDate = (val) => /^\d{4}-\d{2}-\d{2}$/.test(val);
    const isTime = (val) => /^\d{2}:\d{2}:\d{2}$/.test(val);
    const isDateTime = (val) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/.test(val);
  
    for (const key in obj) {
      const val = obj[key];
  
      if (val instanceof Date) {
        obj[key] = val.toLocaleString();
      } else if (typeof val === "string") {
        if (isDateTime(val)) {
          const date = new Date(val);
          obj[key] = date.toLocaleString(); 
        } else if (isDate(val)) {
          const date = new Date(val + "T00:00:00");
          obj[key] = date.toLocaleDateString(); 
        } else if (isTime(val)) {
          const date = new Date("1970-01-01T" + val);
          obj[key] = date.toLocaleTimeString(); 
        }
      }
    }
  
    return obj;
  }
  function renameKeys(obj, keyMap) {
    for (const oldKey in keyMap) {
      if (obj.hasOwnProperty(oldKey)) {
        obj[keyMap[oldKey]] = obj[oldKey];
        delete obj[oldKey];
      }
    }
    return obj;
  }
    


// Retrieve records from ODSRecord
async function getODSRecordsByOperation(vesselId) {
    try {
        const result = await pool
            .request()
            .input("vesselId", sql.Int, vesselId)
            .query(`
                SELECT 
    ods.*,
    u.fullname AS createdby
FROM 
    tbl_ODSOperation AS ods
LEFT JOIN 
    tbl_user AS u ON ods.createdby = u.user_id
WHERE 
    ods.vesselId = @vesselId
ORDER BY 
    ods.createdAt DESC;

                `);
        let records = result.recordset;
        for(let record of records)
        {
            
          if (record.ODSEquipmentId != null) {
            const mainRes = await pool
              .request()
              .input("operationId", sql.Int, record.ODSEquipmentId)
              .query("SELECT * FROM ODSEquipment WHERE operationId = @operationId");
          
            let details = formatDates({ ...mainRes.recordset[0] });
            details = flattenObject(details);
            details = prettifyKeys(details);
          
            delete details["Operation Id"]; 
           
            record.details = details;
            const keyforRename = {
              "Capacity Kg" : "Capacity (kg)",
              
              
            };
            record.details = renameKeys(details,keyforRename);
          } 
          else if (record.ODSRecordId != null) {
            const mainRes = await pool
              .request()
              .input("operationId", sql.Int, record.ODSRecordId)
              .query("SELECT * FROM ODSRecord WHERE operationId = @operationId");
          
            let details = formatDates({ ...mainRes.recordset[0] });
            details = flattenObject(details);
            details = prettifyKeys(details);
          
            delete details["Operation Id"]; 
            details['Process Amount Kg'] = `₹${details['Process Amount Kg']}`;
            record.details = details;
            const keyforRename = {
              "Capacity Kg" : "Capacity (kg)",
              "Process Amount Kg":"Process Amount",
              "Ods Name":"Ozone-Depleting substance Name"
            };
            record.details = renameKeys(details,keyforRename);
          }
          
         
          console.log(records);
        }
        
        return records ? records : {};
    } 
    
    catch (error) {
        
        throw new Error("Failed to retrieve ODS records: " + error.message);
    }
}



// Insert into ODSRecord
async function insertODSRecord(data) {
    try {
        const r = data.records;

        // Validation
        const requiredFields = [
            
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
                INSERT INTO ODSRecord ( operationDate, locationOnBoard, odsName, capacityKg, 
                                       equipmentName, manufacturer, yearOfInstallation, processType, 
                                       processAmountKg, occasion, createdAt) 
                VALUES ( @operationDate, @locationOnBoard, @odsName, @capacityKg, 
                        @equipmentName, @manufacturer, @yearOfInstallation, @processType, 
                        @processAmountKg, @occasion, @createdAt);
                SELECT SCOPE_IDENTITY() AS operationId;
            `);
         const operationId = result.recordset[0].operationId;
                const approvedby = 1;
            const approvalStatus = 0;
            const verificationStatus =0;
            const verifiedBy= 2;
            const verficationRemarks = `verified`;
            const result2 = await pool.request()
              .input('approvedby', sql.Int, approvedby)
              .input('approvalStatus', sql.Int, approvalStatus)
              .input('createdBy', sql.Int,r.userId )
              .input('vesselId', sql.Int, r.vesselId)
              .input('verifiedBy', sql.Int, verifiedBy)
              .input('verifiedAt', sql.DateTime, new Date())
              .input('verificationStatus', sql.Int, verificationStatus)
              .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
              .input('ReallocationBallastWater_id', sql.Int, operationId)
              .input('operationName',sql.NVarChar(250),r.operation2)
              .query(`
                INSERT INTO tbl_ODSOperation (
                  approvedby, approvalStatus, createdBy, vesselId, 
                  verifiedBy,verifiedAt,  verificationStatus, verficationRemarks,
                  ODSrecordId,operationName
                )
                VALUES (
                  @approvedby, @approvalStatus, @createdBy, @vesselId, 
                  @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
                  @ReallocationBallastWater_id, @operationName
                )
              `);
        if (result2.rowsAffected && result2.rowsAffected[0] > 0) {
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
            
            .input("equipmentName", sql.NVarChar, e.en)
            .input("refrigerant", sql.NVarChar, e.refrigerant)
            .input("locationOnBoard", sql.NVarChar, e.location)
            .input("capacityKg", sql.Decimal(10, 2), parseFloat(e.capacity))
            .input("remarks", sql.NVarChar, e.remarks)
            .input("createdAt", sql.DateTime, new Date())
            .query(`
                INSERT INTO ODSEquipment ( equipmentName, refrigerant, locationOnBoard, capacityKg, remarks, createdAt)
                VALUES ( @equipmentName, @refrigerant, @locationOnBoard, @capacityKg, @remarks, @createdAt);
                SELECT SCOPE_IDENTITY() AS operationId;
                `);
            const operationId = result.recordset[0].operationId;
            const approvedby = 1;
        const approvalStatus = 0;
        const verificationStatus =0;
        const verifiedBy= 2;
        const verficationRemarks = `verified`;
        const result2 = await pool.request()
          .input('approvedby', sql.Int, approvedby)
          .input('approvalStatus', sql.Int, approvalStatus)
          .input('createdBy', sql.Int,e.userId )
          .input('vesselId', sql.Int, e.vesselId)
          .input('verifiedBy', sql.Int, verifiedBy)
          .input('verifiedAt', sql.DateTime, new Date())
          .input('verificationStatus', sql.Int, verificationStatus)
          .input('verficationRemarks', sql.NVarChar(255), verficationRemarks)
          .input('ReallocationBallastWater_id', sql.Int, operationId)
          .input('operationName',sql.NVarChar(250),e.operation1)
          .query(`
            INSERT INTO tbl_ODSOperation (
              approvedby, approvalStatus, createdBy, vesselId, 
              verifiedBy,verifiedAt,  verificationStatus, verficationRemarks,
              ODSEquipmentId,operationName
            )
            VALUES (
              @approvedby, @approvalStatus, @createdBy, @vesselId, 
              @verifiedBy,@verifiedAt,  @verificationStatus, @verficationRemarks,
              @ReallocationBallastWater_id, @operationName
            );
            
          `);
        if (result2.rowsAffected && result2.rowsAffected[0] > 0) {
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


export  {  insertODSRecord, insertODSEquipment,  getODSRecordsByOperation };
