import {getPool} from "../config/DBConfig.js";


let pool;
(
    async ()=>{
        try{
            pool=await getPool();
        }catch(err){
            console.log('Service  : ',err);

        }
    }
)();

async function getRecords(vesselID) {
    try {
        const result = await pool.request()
            .input('vesselID', vesselID)
            .query(`
                SELECT 
                    r.recordID, r.occasion, r.area, r.date, r.time, 
                    r.position, r.methodOfDisposal, r.plastics, r.foodWaste, 
                    r.domesticWaste, r.cookingOil, r.incineratorAsh, 
                    r.operationalWaste, r.animalCarcasses, r.fishingGear, 
                    r.eWaste, r.remarks, r.approvalStatus, 
                    u.fullName AS createdBy
                FROM  tbl_garbage_record_book r
                JOIN tbl_user u ON r.createdBy = u.user_id
                WHERE vesselID = @vesselID
            `);

        return result.recordset;
    } catch (err) {
        console.error("Service Error:", err);
        throw new Error(`Database error: ${err.message}`);
    }
}

async function createRecord(data,vesselID){
    try {
        if (!data.plastics && !data.foodWaste && !data.domesticWaste && !data.cookingOil &&
            !data.incineratorAsh && !data.operationalWaste && !data.animalCarcasses &&
            !data.fishingGear && !data.eWaste) {
            throw new Error("At least one waste category must be provided.");
        }

        const request = await pool.request();
        request.input('vesselID', vesselID)
            .input('occasion', data.occasion)
            .input('area', data.area)
            .input('date', data.date)
            .input('time', data.time)
            .input('position', data.position)
            .input('methodOfDisposal', data.methodOfDisposal)
            .input('plastics', data.plastics ?? 0)
            .input('foodWaste', data.foodWaste ?? 0)
            .input('domesticWaste', data.domesticWaste ?? 0)
            .input('cookingOil', data.cookingOil ?? 0)
            .input('incineratorAsh', data.incineratorAsh ?? 0)
            .input('operationalWaste', data.operationalWaste ?? 0)
            .input('animalCarcasses', data.animalCarcasses ?? 0)
            .input('fishingGear', data.fishingGear ?? 0)
            .input('eWaste', data.eWaste ?? 0)
            .input('remarks', data.remarks)
            .input('createdBy', data.createdBy)
            .input('approvalStatus', 0  );

        const result = await request.query(`
        INSERT INTO tbl_garbage_record_book (vesselID, occasion, area, date, time, position, methodOfDisposal,
            plastics, foodWaste, domesticWaste, cookingOil, incineratorAsh, operationalWaste, 
            animalCarcasses, fishingGear, eWaste, remarks, createdBy, approvalStatus)
        VALUES (@vesselID, @occasion, @area, @date, @time, @position, @methodOfDisposal, 
            @plastics, @foodWaste, @domesticWaste, @cookingOil, @incineratorAsh, @operationalWaste, 
            @animalCarcasses, @fishingGear, @eWaste, @remarks, @createdBy, @approvalStatus)
    `);

        return result.rowsAffected[0] > 0;
    } catch (err) {
        console.log('GRB Service:', err);
        return false;
    }

}

async function getAllUnverifiedRecords(vesselID){
    try{

        const request = pool.request();
        request.input('vesselID',vesselID);

        let query=`
            select 'Garbage Record Book' as recordName,t. *,u.fullname from tbl_garbage_record_book t
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
            UPDATE tbl_garbage_record_book
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
            WHERE recordID=@recordID;
        `);


        const auditRequest = pool.request();

        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'Garbage Record Book');
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
            UPDATE tbl_garbage_record_book
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
            WHERE recordID=@recordID;
        `);

        const auditRequest = await pool.request();

        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'Garbage Record Book');
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

export default {createRecord,getRecords,getAllUnverifiedRecords,setRecordRejected,setRecordVerified};