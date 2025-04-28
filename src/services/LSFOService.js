import { getPool } from "../config/DBConfig.js";
import req from "express/lib/request.js";

let pool;
(async () => {
    try {
        pool = await getPool();
    } catch (err) {
        console.error("Service:", err);
    }
})();

async function getRecords(vesselID) {
    try {
        const result = await pool.request()
            .input('vesselID', vesselID)
            .query(`
                SELECT 
                    r.recordID, r.createdAt, r.approvedBy, r.approvedStatus, 
                    r.createdBy, r.vesselID, r.begin_LSFO_datetime, r.begin_LSFO_latitude, 
                    r.begin_LSFO_longitude, r.complete_LSFO_datetime, r.complete_LSFO_latitude, 
                    r.complete_LSFO_longitude, r.lsfo_volume_completion, r.regulated_entry_datetime, 
                    r.regulated_entry_latitude, r.regulated_entry_longitude, r.regulated_exit_datetime, 
                    r.regulated_exit_latitude, r.regulated_exit_longitude, r.begin_HSFO_datetime, 
                    r.begin_HSFO_latitude, r.begin_HSFO_longitude, r.complete_HSFO_datetime, 
                    r.complete_HSFO_latitude, r.complete_HSFO_longitude, r.lsfo_volume_start, 
                    u.fullName AS createdByName
                FROM tbl_lsfo_changeover r
                JOIN tbl_user u ON r.createdBy = u.user_id
                WHERE r.vesselID = @vesselID;
            `);

        return result.recordset;
    } catch (err) {
        console.error("Service Error:", err);
        throw new Error(`Database error: ${err.message}`);
    }
}

async function createRecord(data, vesselID) {
    try {
        const request = await pool.request();
        request.input('vesselID', vesselID)
            .input('createdBy', data.createdBy)
            .input('approvedBy', data.approvedBy ?? null)
            .input('approvedStatus', 1)
            .input('begin_LSFO_datetime', data.begin_LSFO_datetime)
            .input('begin_LSFO_latitude', data.begin_LSFO_latitude)
            .input('begin_LSFO_longitude', data.begin_LSFO_longitude)
            .input('complete_LSFO_datetime', data.complete_LSFO_datetime)
            .input('complete_LSFO_latitude', data.complete_LSFO_latitude)
            .input('complete_LSFO_longitude', data.complete_LSFO_longitude)
            .input('lsfo_volume_completion', data.lsfo_volume_completion)
            .input('regulated_entry_datetime', data.regulated_entry_datetime)
            .input('regulated_entry_latitude', data.regulated_entry_latitude)
            .input('regulated_entry_longitude', data.regulated_entry_longitude)
            .input('regulated_exit_datetime', data.regulated_exit_datetime)
            .input('regulated_exit_latitude', data.regulated_exit_latitude)
            .input('regulated_exit_longitude', data.regulated_exit_longitude)
            .input('begin_HSFO_datetime', data.begin_HSFO_datetime)
            .input('begin_HSFO_latitude', data.begin_HSFO_latitude)
            .input('begin_HSFO_longitude', data.begin_HSFO_longitude)
            .input('complete_HSFO_datetime', data.complete_HSFO_datetime)
            .input('complete_HSFO_latitude', data.complete_HSFO_latitude)
            .input('complete_HSFO_longitude', data.complete_HSFO_longitude)
            .input("createdAt", new Date())
            .input('lsfo_volume_start', data.lsfo_volume_start);

        const result = await request.query(`
            INSERT INTO dbo.tbl_lsfo_changeover (
                vesselID, createdBy, approvedBy, approvedStatus,createdAt,
                begin_LSFO_datetime, begin_LSFO_latitude, begin_LSFO_longitude,
                complete_LSFO_datetime, complete_LSFO_latitude, complete_LSFO_longitude,
                lsfo_volume_completion, regulated_entry_datetime, regulated_entry_latitude, regulated_entry_longitude,
                regulated_exit_datetime, regulated_exit_latitude, regulated_exit_longitude,
                begin_HSFO_datetime, begin_HSFO_latitude, begin_HSFO_longitude,
                complete_HSFO_datetime, complete_HSFO_latitude, complete_HSFO_longitude,
                lsfo_volume_start
            )
            VALUES (
                @vesselID, @createdBy, @approvedBy, @approvedStatus,@createdAt,
                @begin_LSFO_datetime, @begin_LSFO_latitude, @begin_LSFO_longitude,
                @complete_LSFO_datetime, @complete_LSFO_latitude, @complete_LSFO_longitude,
                @lsfo_volume_completion, @regulated_entry_datetime, @regulated_entry_latitude, @regulated_entry_longitude,
                @regulated_exit_datetime, @regulated_exit_latitude, @regulated_exit_longitude,
                @begin_HSFO_datetime, @begin_HSFO_latitude, @begin_HSFO_longitude,
                @complete_HSFO_datetime, @complete_HSFO_latitude, @complete_HSFO_longitude,
                @lsfo_volume_start
            )
        `);

        return result.rowsAffected[0] > 0;
    } catch (err) {
        console.error("LSFO Service Error:", err);
        return false;
    }
}

export default { createRecord, getRecords };


