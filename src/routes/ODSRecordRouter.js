import ODSRecordController from "../controllers/ODSRecordController.js";
import express from "express";

const ODSRouter = express.Router();
ODSRouter.post('/create-records1',ODSRecordController.insertRecords1);
ODSRouter.post('/create-records2',ODSRecordController.insertRecords2);
ODSRouter.get('/read-records',ODSRecordController.getRecordsByOperation);

export default ODSRouter;