import {getPool} from "../config/DBConfig.js";

let pool;
(async () => {
    try{
        pool = await getPool();
    }catch(err){
        console.log(err);

    }
})();

async function createRecord(data,vesselId) {
    try{

        const request=await pool.request();

        request.input('vesselId',vesselId)
            .input('date',data.date)
            .input('smtTime',data.smtTime)
            .input('position',data.position)
            .input('event',data.event)
            .input('engineName',data.engineName)
            .input('engineStatus',data.engineStatus)
            .input('engineTierStatus',data.engineTierStatus)
            .input('remarks',data.remarks || null)
            .input('createdBy',data.createdBy)
            .input('deSigned',0)
            .input('ceSigned',0);
        const query = `
            INSERT INTO tbl_nox_tier_co (
                        date, smtTime, position, event, engineName,
                        engineStatus, engineTierStatus, remarks, createdBy,
                        deSigned, ceSigned, vesselId
            ) VALUES (
                         @date, @smtTime, @position, @event, @engineName,
                         @engineStatus, @engineTierStatus, @remarks, @createdBy,
                         @deSigned, @ceSigned, @vesselId
                     );
        `;
        const result = await request.query(query);

        return result.rowsAffected[0]>0;

    }catch(err){
        console.log('NOX Service :', err);
        return false;
    }
}


async function getRecords(vesselID) {
    try {
        const result = await pool.request()
            .input('vesselID', vesselID)
            .query(`
                
                select n.recordID,
                       n.date,
                       n.smtTime,
                       n.position,
                       n.event,
                       n.engineName,
                       n.engineStatus,
                       n.engineTierStatus,
                       n.remarks,
                       u.fullname as createdBy,
                       n.createdAt,
                       n.deSigned,
                       n.ceSigned
                from tbl_nox_tier_co n
                         left join tbl_user u on n.createdBy=u.user_id
                where vesselID=@vesselID;
            `);

        return result.recordset;
    } catch (err) {
        console.error("Service Error:", err);
        throw new Error(`Database error: ${err.message}`);
    }
}

async function getAllUnverifiedRecords(vesselID){
    try{

        const request = pool.request();
        request.input('vesselID',vesselID);

        let query=`
            select 'NOX Tier Change Over Record Book' as recordName,t. *,u.fullname from tbl_nox_tier_co t
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
            UPDATE tbl_nox_tier_co
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
            WHERE recordID=@recordID;
        `);


        const auditRequest = pool.request();

        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'NOX Tier Change Over Record Book');
        auditRequest.input('remarks', 'NOX Tier C/O Verified');
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
            UPDATE tbl_nox_tier_co
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
            WHERE recordID=@recordID;
        `);

        const auditRequest = await pool.request();

        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'NOX Tier Changeover Record Book');
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

        let query=`select * from tbl_nox_tier_co where verificationStatus=1 and verifiedBy=@ID and vesselID=@vesselID;`;

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


export default {getVerifiedRecordsForUser, createRecord,getRecords,getAllUnverifiedRecords ,setRecordRejected,setRecordVerified};