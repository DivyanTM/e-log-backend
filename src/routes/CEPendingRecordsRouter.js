import express from 'express';
import CEPendingRecordsController from "../controllers/CEPendingRecordsController.js";

const PendingRecordRouter = express.Router();

PendingRecordRouter.get("/unverified/all",CEPendingRecordsController.getAllPendingRecordsForCE);

export default PendingRecordRouter;

