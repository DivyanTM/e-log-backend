import { getPool } from "../config/DBConfig.js";
import sql from "mssql";
import multer from "multer";
let pool ;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
(async () => {
    try {
        pool = await getPool();
    } catch (err) {
        console.error('Error while getting pool in bunker delivery record controller', err);
    }
})();

async function getAllRecords(vesselID) {

    const request =await  pool.request();

    request.input('vesselId',vesselID);
    
    let query=`
            select
                
                s.approvedby,
                s.approvalStatus,
                s.portOfBunkering,
                s.deliveryDate,
                s.supplierName,
                s.supplierAddress,
                s.createdAt,
                s.supplierTelephone,
                s.productName,
                s.quantityDeliveredMT,
                s.densityAt15C,
                s.sulfurContentPercent,
                s.supplierDeclarationFile,
                u.fullname as createdBy
            from tbl_bunkerDelivery s
                     left join tbl_user u on u.user_id=s.createdBy
            where vesselId=@vesselID;
        `;
try{
        const result = await request.query(query);

        if(result.recordset.length>0){
            return result.recordset;
        }

        return [];
    


    }catch(err){
        console.error('Error while getting pool in bunkerDeliveryRecord book controller', err);
        throw new Error(`Database error: ${err.message}`);
    }
    
}

async function createRecords(data, vesselID) {
    try {
        
        const requiredFields = [
            { field: 'createdBy', type: 'number' },
            { field: 'port', type: 'string' },
            { field: 'deliveryDate', type: 'string' },
            { field: 'supplierName', type: 'string' },
            { field: 'supplierAddress', type: 'string' },
            { field: 'supplierTelephone', type: 'string' },
            { field: 'productName', type: 'string' },
            { field: 'quantity', type: 'number' },
            { field: 'density', type: 'number' },
            { field: 'sulfurContent', type: 'number' },
            { field: 'supplierDeclaration', type: 'object' } 
        ];

        for (let item of requiredFields) {
            const value = data[item.field];
            if (
                value === undefined ||
                value === null ||
                (item.type === 'string' && value.trim?.() === '') ||
                (item.type === 'number' && isNaN(value)) ||
                (item.type === 'object' && !(value instanceof Buffer))
            ) {
                return {
                    statusCode: 400,
                    message: `Invalid or missing field: ${item.field}`,
                    success: false
                };
            }
        }

        const request = await pool.request();
        request.input("createdBy", sql.Int, data.createdBy)
            .input("vesselId", sql.Int, vesselID)
            .input("portOfBunkering", sql.NVarChar(255), data.port)
            .input("deliveryDate", sql.Date, data.deliveryDate)
            .input("supplierName", sql.NVarChar(255), data.supplierName)
            .input("supplierAddress", sql.NVarChar(255), data.supplierAddress)
            .input("supplierTelephone", sql.NVarChar(50), data.supplierTelephone)
            .input("productName", sql.NVarChar(255), data.productName)
            .input("quantityDeliveredMT", sql.Decimal(10, 2), data.quantity)
            .input("densityAt15C", sql.Decimal(10, 2), data.density)
            .input("sulfurContentPercent", sql.Decimal(10, 2), data.sulfurContent)
            .input("supplierDeclarationFile", sql.VarBinary(sql.MAX), data.supplierDeclaration)
            .input("createdAt", sql.DateTime, new Date());

        const query = `
            INSERT INTO tbl_bunkerDelivery 
            (approvedby, approvalStatus, createdBy, vesselId, portOfBunkering, deliveryDate, 
             supplierName, supplierAddress, supplierTelephone, productName, quantityDeliveredMT, 
             densityAt15C, sulfurContentPercent, supplierDeclarationFile, createdAt)
            VALUES 
            (0, 0, @createdBy, @vesselId, @portOfBunkering, @deliveryDate, 
             @supplierName, @supplierAddress, @supplierTelephone, @productName, @quantityDeliveredMT, 
             @densityAt15C, @sulfurContentPercent, @supplierDeclarationFile, @createdAt);
        `;

        const result = await request.query(query);

        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return {
                statusCode: 201,
                message: "Bunker delivery record created successfully.",
                success: true
            };
        } else {
            return {
                statusCode: 500,
                message: "Failed to insert bunker delivery record.",
                success: false
            };
        }

    } catch (err) {
        console.error('Error in createRecords:', err);
        return {
            statusCode: 500,
            message: `Server error: ${err.message}`,
            success: false
        };
    }
}


export default { getAllRecords,createRecords }