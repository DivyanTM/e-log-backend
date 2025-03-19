import { getPool } from "../config/DBConfig.js";
import sql from "mssql";

async function createRecord(data){
    try{
        console.log('service: ',data);
        const pool = await getPool();
        const request = pool.request();
        request.input('bunkerDeliveryReferenceNumber',data.bunkerDeliveryNoteReferenceNumber);
        request.input('originOfSample',data.originOfSample);
        request.input('date',data.date);
        request.input('sampleSealNumber',data.sampleSealNumber);
        request.input('letterOfProtestIssued',data.letterOfProtestIssued);
        request.input('letterOfProtestCopyTo',data.letterOfProtestCopyTo);
        request.input('dateSampleDestroyed',data.dateSampleDestroyed);
        request.input('createdBy',data.createdBy);
        const result=await request.query(`
                                        insert into tbl_fuel_oil_sample_record (bunkerDeliveryNoteReferenceNumber,originOfSample,date,sampleSealNumber,letterOfProtestIssued,letterOfProtestCopyTo,dateSampleDestroyed,createdBy)
                                        values(
                                               @bunkerDeliveryReferenceNumber,
                                               @originOfSample,
                                               @date,
                                               @sampleSealNumber,
                                               @letterOfProtestIssued,
                                               @letterOfProtestCopyTo,
                                               @dateSampleDestroyed,
                                               @createdBy
                                              );
                                        `);

        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return true;
        }
        return false;
    }catch(error){
        throw new Error(`Database error: ${error.message}`);
    }
}



async function getAllRecords(){
    try{
        const pool = await getPool();
        const request = pool.request();
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
                     left join tbl_user u on u.id=f.createdBy;
                    
        
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