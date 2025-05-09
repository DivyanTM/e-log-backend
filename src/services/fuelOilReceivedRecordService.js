import {getPool} from "../config/DBConfig.js";
import {query} from "express";

let pool;

(async () => {
    try {
        pool = await getPool();
    } catch (err) {
        console.error('Error while getting pool in equipment category controller', err);
    }
})();

async function getAllRecords(vesselID){
    try{
        const request = pool.request();
        request.input('vesselID', vesselID);

        let query=`
            select
                s.recordID,
                s.bunkerDeliveryNoteReferenceNumber,
                s.date,
                s.grade,
                s.sulphur,
                s.tankNumber,
                s.quantity,
                s.createdAt,
                s.approvalStatus,
                s.approvedBy,
                s.verifiedBy,
                s.verificationStatus,
                s.verifiedAt,
                s.verificationRemarks,
                u.fullname as createdBy
            from tbl_fuel_oil_received_record s
                     left join tbl_user u on u.user_id=s.createdBy
            where vesselID=@vesselID;
        `;

        const result = await request.query(query);
        console.log(result.recordset);
        if(result.recordset.length>0){
            return result.recordset;
        }

        return [];



    }catch(err){
        console.error('Error while getting pool in equipment category controller', err);
        throw new Error(`Database error: ${err.message}`);
    }
}


async function getVerifiedRecordsForUser(userId,vesselID) {
    try{

        let request=await pool.request();

        request.input('ID',userId);
        request.input('vesselID',vesselID);

        let query=`select * from tbl_fuel_oil_received_record where verificationStatus=1 and verifiedBy=@ID and vesselID=@vesselID;`;

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

async function createRecord(data,vesselID){
    try{
        const request = pool.request();
        request.input('vesselID', vesselID)
            .input('bunkerDeliveryNoteReferenceNUmber',data.bunkerDeliveryNoteReferenceNumber)
            .input('portOfDelivery',data.portOfDelivery)
            .input('date',data.date)
            .input('grade',data.grade)
            .input('sulphur',data.sulphur)
            .input('tankNumber',data.tankNumber)
            .input('quantity',data.quantity)
            .input('createdBy',data.createdBy);

        const query=`
                        
                        insert into tbl_fuel_oil_received_record(bunkerDeliveryNoteReferenceNumber, date, grade, sulphur, tankNumber, quantity, createdBy, vesselID,approvalStatus,verificationStatus) 
                        values(
                               @bunkerDeliveryNoteReferenceNumber,
                               @date,
                               @grade,
                               @sulphur,
                               @tankNumber,
                               @quantity,
                               @createdBy,
                               @vesselID,
                               0,
                               0
                              );
        `;

        const result=await request.query(query);

       if(result.rowsAffected && result.rowsAffected[0]>0){
           return true;
       }else {

           return false;
       }

    }catch(err){
        console.log(err);
        throw new Error(`Database error: ${err.message}`);
    }
}

async function getAllUnverifiedRecords(vesselID){
    try{

        const request = pool.request();
        request.input('vesselID',vesselID);

        let query=`
            select 'Fuel Oil Received Record Book' as recordName,t.*,u.fullname from tbl_fuel_oil_received_record t
                                                              left join tbl_user u on u.user_id=t.createdBy
            where verificationStatus=0 and vesselID=@vesselID;
        
        `;

        const result = await request.query(query);

        if(result.recordset.length>0){
            return result.recordset;
        }

        return [];

    }catch(err){
        console.log("FOR service : ",err);
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
            UPDATE tbl_fuel_oil_received_record
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
            WHERE recordID=@recordID;
        `);


        const auditRequest = pool.request();
        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'Fuel Oil Received Record Book');
        auditRequest.input('remarks', 'Fuel Oil Received Record Verified');
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
            UPDATE tbl_fuel_oil_received_record
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status,verificationRemarks=@remarks
            WHERE recordID=@recordID;
        `);


        const auditRequest = await pool.request();

        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'Fuel Oil Received Record Book');
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


export default {getAllRecords,createRecord,getVerifiedRecordsForUser,getAllUnverifiedRecords,setRecordVerified,setRecordRejected};