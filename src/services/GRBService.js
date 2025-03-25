import {getPool} from "../config/DBConfig.js";
import req from "express/lib/request.js";

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
        OUTPUT inserted.recordID
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
export default {createRecord,getRecords}