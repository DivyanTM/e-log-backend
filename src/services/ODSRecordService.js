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
    const pad = (num) => String(num).padStart(2, '0');
  
    const formatDateTime = (date) => {
      const yyyy = date.getFullYear();
      const mm = pad(date.getMonth() + 1);
      const dd = pad(date.getDate());
      const hh = pad(date.getHours());
      const min = pad(date.getMinutes());
      const ss = pad(date.getSeconds());
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    };
  
    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = pad(date.getMonth() + 1);
      const dd = pad(date.getDate());
      return `${yyyy}-${mm}-${dd}`;
    };
  
    const formatTime = (date) => {
      const hh = pad(date.getHours());
      const min = pad(date.getMinutes());
      const ss = pad(date.getSeconds());
      return `${hh}:${min}:${ss}`;
    };
  
    for (const key in obj) {
      const val = obj[key];
  
      if (val instanceof Date) {
        obj[key] = formatDateTime(val);
      } else if (typeof val === 'string') {
        const parsed = new Date(val);
        if (!isNaN(parsed.getTime())) {
          const hasTime = parsed.getHours() + parsed.getMinutes() + parsed.getSeconds() > 0;
  
          if (val.includes('T')) {
            obj[key] = formatDateTime(parsed); // full datetime string
          } else if (!hasTime) {
            obj[key] = formatDate(parsed); // pure date
          } else {
            obj[key] = formatTime(parsed); // time only
          }
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
    ods.ODSRecordId,
    ods.ODSEquipmentId,
    ods.operationName,
    ods.approvalStatus,
    ods.approvedby,
    ods.verifiedBy,
    ods.verificationStatus,
    ods.verficationRemarks,
    ods.verifiedAt,
    ods.createdAt,
    created.fullname AS createdBy

FROM tbl_ODSOperation AS ods
LEFT JOIN tbl_user AS created ON created.user_id = ods.createdBy
WHERE ods.vesselId = @vesselId
ORDER BY ods.createdAt DESC;


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
            details = flattenObject(formatDates(details));
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
              
            
            const result2 = await pool.request()
              
              .input('approvalStatus', sql.Int, 0)
              .input('verificationStatus',sql.Int,0)
              .input('createdBy', sql.Int,r.userId )
              .input('vesselId', sql.Int, r.vesselId)
         
              .input('ReallocationBallastWater_id', sql.Int, operationId)
              .input('operationName',sql.NVarChar(250),r.operation2)
              .query(`
                INSERT INTO tbl_ODSOperation (
                  approvalStatus, createdBy, vesselId, 
                    verificationStatus, 
                  ODSrecordId,operationName
                )
                VALUES (
                   @approvalStatus, @createdBy, @vesselId, 
                   @verificationStatus, 
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
            
        const approvalStatus = 0;
       
        const result2 = await pool.request()
          
          .input('approvalStatus', sql.Int, approvalStatus)
          .input('verificationStatus',sql.Int,0)
          .input('createdBy', sql.Int,e.userId )
          .input('vesselId', sql.Int, e.vesselId)
          .input('ReallocationBallastWater_id', sql.Int, operationId)
          .input('operationName',sql.NVarChar(250),e.operation1)
          .query(`
            INSERT INTO tbl_ODSOperation (
               approvalStatus, createdBy, vesselId, 
                verificationStatus, 
              ODSEquipmentId,operationName
            )
            VALUES (
               @approvalStatus, @createdBy, @vesselId, 
            @verificationStatus,
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

async function getAllUnverifiedRecords(vesselID){
  try{

      const request = pool.request();
      request.input('vesselID',vesselID);

      let query=`
          select 'ODS Record Book' as recordName,t. *,u.fullname from tbl_ODSOperation t
                                                              left join tbl_user u on u.user_id=t.createdBy
          where t.verificationStatus=0 and t.vesselID=@vesselID;
      
      `;

      const result = await request.query(query);

      if(result.recordset.length>0){
          return result.recordset;
      }

      return [];

  }catch(err){
      console.log("FOS service : ",err);
      throw new Error(`Database error: ${err.message}`);
  }
}

async function setRecordVerified(recordId, verifiedBy, vesselID) {
  try {
      const request = pool.request();

      const now = new Date();

      request.input('recordID', recordId);
      request.input('verifiedBy', verifiedBy);
      request.input('verifiedAt', now);
      request.input('status', 1);


      const result = await request.query(`
          UPDATE tbl_ODSOperation
          SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
          WHERE recordID=@recordID;
      `);


      const auditRequest = pool.request();

      auditRequest.input('recordID', recordId);
      auditRequest.input('verifiedBy', verifiedBy);
      auditRequest.input('verifiedAt', now);
      auditRequest.input('vesselID', vesselID);
      auditRequest.input('Operation', 'CE Verified');
      auditRequest.input('recordBook', 'ODS Record Book');
      auditRequest.input('remarks', 'Garbage Record Verified');
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

async function setRecordRejected(recordId,verifiedBy, vesselID,remarks) {
  try {
      const request = pool.request();

      const now = new Date();

      request.input('recordID', recordId);
      request.input('verifiedBy', verifiedBy);
      request.input('verifiedAt', now);
      request.input('status', 2);
      request.input('remarks', remarks);

      const result = await request.query(`
          UPDATE tbl_ODSOperation
          SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
          WHERE recordID=@recordID;
      `);

      const auditRequest = await pool.request();

      auditRequest.input('recordID', recordId);
      auditRequest.input('verifiedBy', verifiedBy);
      auditRequest.input('verifiedAt', now);
      auditRequest.input('vesselID', vesselID);
      auditRequest.input('Operation', 'CE Verified');
      auditRequest.input('recordBook', 'ODS Record Book');
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

      let query=`select * from tbl_ODSOperation where verificationStatus=1 and verifiedBy=@ID and vesselID=@vesselID;`;

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


export  {getVerifiedRecordsForUser,  insertODSRecord, insertODSEquipment,  getODSRecordsByOperation,getAllUnverifiedRecords,setRecordRejected,setRecordVerified };
