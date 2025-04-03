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

        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return true;
        }
        return false;
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
                     left join tbl_user u on u.id=f.createdBy
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

export default { createRecord,getAllRecords };