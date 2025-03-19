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
                    select * from tbl_fuel_oil_received_record where vesselID= @vesselID;
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
export default {getAllRecords}