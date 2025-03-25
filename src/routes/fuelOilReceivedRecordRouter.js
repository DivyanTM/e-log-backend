import fuelOilReceivedRecordController from "../controllers/fuelOilReceivedRecordController.js";
import express from "express";

const fuelOilReceivedRecordRouter = express.Router();

fuelOilReceivedRecordRouter.get('/all',fuelOilReceivedRecordController.getAllRecords);
fuelOilReceivedRecordRouter.post('/create',fuelOilReceivedRecordController.createRecord);

export default fuelOilReceivedRecordRouter;