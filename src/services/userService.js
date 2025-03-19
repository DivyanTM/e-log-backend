import { getPool } from "../config/DBConfig.js";

async function getUserByUsername(username) {
    try {
        const pool = await getPool();
        const request = pool.request();
        request.input('username', username);
        const result = await request.query('SELECT * FROM tbl_user WHERE username = @username');

        return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
}

export default { getUserByUsername };
