import {getPool} from "../config/DBConfig.js";

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
                u.fullname as createdBy
            from tbl_fuel_oil_received_record s
                     left join tbl_user u on u.user_id=s.createdBy
            where vesselID=@vesselID;
        `;

        const result = await request.query(query);

        if(result.recordset.length>0){
            return result.recordset;
        }

        return [];



    }catch(err){
        console.error('Error while getting pool in equipment category controller', err);
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
                        
                        insert into tbl_fuel_oil_received_record(bunkerDeliveryNoteReferenceNumber, date, grade, sulphur, tankNumber, quantity, createdBy, vesselID,approvalStatus) 
                        values(
                               @bunkerDeliveryNoteReferenceNumber,
                               @date,
                               @grade,
                               @sulphur,
                               @tankNumber,
                               @quantity,
                               @createdBy,
                               @vesselID,
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

export default {getAllRecords,createRecord}