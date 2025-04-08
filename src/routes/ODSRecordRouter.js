import ODSRecordController from "../controllers/ODSRecordController.js";
import express from "express";

const ODSRouter = express.Router();
ODSRouter.post('/create-records1',ODSRecordController.insertRecords1);
ODSRouter.post('/create-records2',ODSRecordController.insertRecords2);
ODSRouter.get('/read-records1/:operationName',ODSRecordController.getRecordsByOperation1);
ODSRouter.get('/read-records2/:operationName',ODSRecordController.getRecordsByOperation2);

export default ODSRouter;