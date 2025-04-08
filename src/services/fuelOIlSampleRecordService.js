import { getPool } from "../config/DBConfig.js";
import sql from "mssql";


let pool;


(async () => {
    try {
        pool = await getPool();
    } catch (err) {
        console.error('Error while getting pool in equipment category controller', err);
    }
})();


async function createRecord(data,vesselID){
    try{
        // console.log('service: ',data);
        const request = pool.request();
        request.input('bunkerDeliveryReferenceNumber',data.bunkerDeliveryNoteReferenceNumber);
        request.input('originOfSample',data.originOfSample);
        request.input('date',data.date);
        request.input('sampleSealNumber',data.sampleSealNumber);
        request.input('letterOfProtestIssued',data.letterOfProtestIssued);
        request.input('letterOfProtestCopyTo',data.letterOfProtestCopyTo);
        request.input('dateSampleDestroyed',data.dateSampleDestroyed);
        request.input('createdBy',data.createdBy);
        request.input('vesselID',vesselID);
        const result=await request.query(`
                                        insert into tbl_fuel_oil_sample_record (bunkerDeliveryNoteReferenceNumber,originOfSample,date,sampleSealNumber,letterOfProtestIssued,letterOfProtestCopyTo,dateSampleDestroyed,createdBy,vesselID)
                                        values(
                                               @bunkerDeliveryReferenceNumber,
                                               @originOfSample,
                                               @date,
                                               @sampleSealNumber,
                                               @letterOfProtestIssued,
                                               @letterOfProtestCopyTo,
                                               @dateSampleDestroyed,
                                               @createdBy,
                                               @vesselID
                                              );
                                        `);

        if (!(result.rowsAffected && result.rowsAffected[0] > 0)) {
            return false;
        } else {
            return true;
        }
    }catch(error){
        console.log(error);
        throw new Error(`Database error: ${error.message}`);
    }
}



async function getAllRecords(vesselID){
    try{

        const request = pool.request();

        request.input('vesselID',vesselID);
        const query=`
            select f.recordID,
                   f.bunkerDeliveryNoteReferenceNumber,
                   f.originOfSample,
                   f.date,
                   f.sampleSealNumber,
                   f.letterOfProtestIssued,
                   f.letterOfProtestCopyTo,
                   f.dateSampleDestroyed,
                   f.verifiedBy,
                   f.approvalStatus,
                   u.fullname
            from tbl_fuel_oil_sample_record f
                     left join tbl_user u on u.user_id=f.createdBy
            where vesselID=@vesselID
                    
        
        `;

        const result=await request.query(query);

        if(result.recordset.length > 0){
            return result.recordset;
        }
        return null;

    }catch(error){
        throw new Error(`Database error: ${error.message}`);
    }
}

async function getAllUnverifiedRecords(vesselID){
    try{

        const request = pool.request();
        request.input('vesselID',vesselID);

        let query=`
            select 'Fuel Oil Sample Record Book' as recordName,t. *,u.fullname from tbl_fuel_oil_sample_record t
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
            UPDATE tbl_fuel_oil_sample_record
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
            WHERE recordID=@recordID;
        `);


        const auditRequest = pool.request();

        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'Fuel Oil Sample Record Book');
        auditRequest.input('remarks', 'Fuel Oil Sample Record Verified');
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
            UPDATE tbl_fuel_oil_sample_record
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
            WHERE recordID=@recordID;
        `);


        const auditRequest = await pool.request();

        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'Fuel Oil Sample Record Book');
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

export default { createRecord,getAllRecords,getAllUnverifiedRecords,setRecordRejected,setRecordVerified };