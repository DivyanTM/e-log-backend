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


export default { createRecord,getRecords };