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

            SELECT
   
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
    s.verifiedBy,
    s.verifiedAt,
    s.verficationRemarks,
    s.verificationStatus,
    creator.fullname AS createdBy
FROM tbl_bunkerDelivery s
LEFT JOIN tbl_user creator ON creator.user_id = s.createdBy

WHERE s.vesselId = @vesselID;     
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
        request
    
    .input("verificationStatus", sql.Int, 0)
    .input("approvalStatus", sql.Int, 0)
    .input("createdBy", sql.Int, data.createdBy)
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
            (verificationStatus, approvalStatus, createdBy, vesselId, portOfBunkering, deliveryDate, 
             supplierName, supplierAddress, supplierTelephone, productName, quantityDeliveredMT, 
             densityAt15C, sulfurContentPercent, supplierDeclarationFile, createdAt)
            VALUES 
            (@verificationStatus,@approvalStatus, @createdBy, @vesselId, @portOfBunkering, @deliveryDate, 
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

async function getPdf(id)
{
    try{
        const res = await pool.request()
        .input('id',sql.Int,id)
        .query(`
            SELECT supplierDeclarationFile FROM tbl_bunkerDelivery WHERE recordId = @id; 
            `) ;

        if(res.recordset.length > 0)
        {
            return res.recordset;
        }
        return [];
    }
    catch (err){
        console.log(err.message);
        throw new Error('PDF not received ',err.message);
    }
}

async function getAllUnverifiedRecords(vesselID){
    try{

        const request = pool.request();
        request.input('vesselID',vesselID);

        let query=`
            select 'Bunker Delivery Record Book' as recordName,t. *,u.fullname from tbl_bunkerDelivery t
                                                                left join tbl_user u on u.user_id=t.createdBy
            where t.verificationStatus=0 and t.vesselID=@vesselID;
        
        `;

        const result = await request.query(query);

        if(result.recordset.length>0){
            return result.recordset;
        }

        return [];

    }catch(err){
        console.log("BDN service : ",err);
        throw new Error(`Database error: ${err.message}`);
    }
}

async function setRecordVerified(recordId, verifiedBy, vesselID) {
    try {
        const request = pool.request();

        const now = new Date();

        request.input('recordID', recordId);
        request.input('verifiedBy', verifiedBy);
        request.input('verifiedAt', now);
        request.input('status', 1);


        const result = await request.query(`
            UPDATE tbl_bunkerDelivery
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
            WHERE recordID=@recordID;
        `);


        const auditRequest = pool.request();

        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'Bunker Delivery Record Book');
        auditRequest.input('remarks', 'Bunker Delivery Record Verified');
        auditRequest.input('status', 'Verified');


        await auditRequest.query(`
            INSERT INTO tbl_audit_log (CreatedAt, CreatedBy, VesselID, RecordBook, RecordID, Operation, Remarks, Status) 
            VALUES (@verifiedAt, @verifiedBy, @vesselID, @recordBook, @recordID, @Operation, @remarks, @status);
        `);

        return !!(result.rowsAffected && result.rowsAffected[0] > 0);
    } catch (err) {
        console.error('Service error:', err);
        throw new Error(`Database error: ${err.message}`);
    }
}

async function setRecordRejected(recordId,verifiedBy, vesselID,remarks) {
    try {
        const request = pool.request();

        const now = new Date();

        request.input('recordID', recordId);
        request.input('verifiedBy', verifiedBy);
        request.input('verifiedAt', now);
        request.input('status', 2);
        request.input('remarks', remarks);

        const result = await request.query(`
            UPDATE tbl_bunkerDelivery
            SET verifiedBy=@verifiedBy, verifiedAt=@verifiedAt, verificationStatus=@status
            WHERE recordID=@recordID;
        `);

        const auditRequest = await pool.request();

        auditRequest.input('recordID', recordId);
        auditRequest.input('verifiedBy', verifiedBy);
        auditRequest.input('verifiedAt', now);
        auditRequest.input('vesselID', vesselID);
        auditRequest.input('Operation', 'CE Verified');
        auditRequest.input('recordBook', 'Bunker Delivery Record Book');
        auditRequest.input('remarks', remarks);
        auditRequest.input('status', 'Rejected');


        await auditRequest.query(`
            INSERT INTO tbl_audit_log (CreatedAt, CreatedBy, VesselID, RecordBook, RecordID, Operation, Remarks, Status) 
            VALUES (@verifiedAt, @verifiedBy, @vesselID, @recordBook, @recordID, @Operation, @remarks, @status);
        `);

        return !!(result.rowsAffected && result.rowsAffected[0] > 0);

    } catch (err) {

        console.error('Service error:', err);
        throw new Error(`Database error: ${err.message}`);

    }
}

async function getVerifiedRecordsForUser(userId,vesselID) {
    try{

        let request=await pool.request();

        request.input('ID',userId);
        request.input('vesselID',vesselID);

        let query=`select * from tbl_bunkerDelivery where verificationStatus=1 and verifiedBy=@ID and vesselID=@vesselID;`;

        const result = await request.query(query);

        if(result.recordset.length>0){
            return result.recordset;
        }

        return [];

    }catch(err){
        console.error('Service error:', err);
        throw new Error(`Database error: ${err.message}`);
    }
}

export default { getAllRecords,createRecords,getPdf,getVerifiedRecordsForUser,getAllUnverifiedRecords,setRecordRejected,setRecordVerified }