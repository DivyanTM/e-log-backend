import {getPool} from "../config/DBConfig.js";

let pool;

(async () => {
    try {
        pool = await getPool();
    } catch (err) {
        console.error('Error while getting pool in equipment category controller', err);
    }
})();

async function getAllLogs(VesselID){
    try{

        const request = pool.request();
        request.input('vesselID',VesselID);

        let query=`
            select l.* ,
                   tu.fullname as FullName
            from tbl_audit_log l
                     left join dbo.tbl_user tu on l.CreatedBy = tu.user_id
            order by CreatedAt desc;
        
        `;

        const result = await request.query(query);

        if(result.recordset.length>0){
            return result.recordset;
        }

        return [];

    }catch(err){
        console.log("Audit log service : ",err);
        throw new Error(`Database error: ${err.message}`);
    }
}

export default {getAllLogs}