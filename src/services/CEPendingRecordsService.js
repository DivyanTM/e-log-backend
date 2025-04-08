import {getPool} from "../config/DBConfig.js";
import fuelOilReceivedRecordService from "./fuelOilReceivedRecordService.js";
import fuelOIlSampleRecordService from "./fuelOIlSampleRecordService.js";
import GRBService from "./GRBService.js";
import NOXTierChangeOverRecordService from "./NOXTierChangeOverRecordService.js";

let pool;

(async () => {
    try {
        pool = await getPool();
    } catch (err) {
        console.error('Error while getting pool in equipment category controller', err);
    }
})();

async function getAllPendingRecordsForCE(vesselID) {
    try {
        let [forRecords, fosRecords, grbRecords, noxRecords] = await Promise.all([
            fuelOilReceivedRecordService.getAllUnverifiedRecords(vesselID),
            fuelOIlSampleRecordService.getAllUnverifiedRecords(vesselID),
            GRBService.getAllUnverifiedRecords(vesselID),
            NOXTierChangeOverRecordService.getAllUnverifiedRecords(vesselID)
        ]);


        let unverifiedRecords = [...fosRecords, ...grbRecords, ...noxRecords, ...forRecords];


        return unverifiedRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    } catch (err) {
        console.log("CE log service:", err);
        throw new Error(`Database error: ${err.message}`);
    }
}


export default { getAllPendingRecordsForCE }