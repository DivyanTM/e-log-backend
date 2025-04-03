import fuelOilReceivedRecordController from "../controllers/fuelOilReceivedRecordController.js";
import express from "express";

const fuelOilReceivedRecordRouter = express.Router();

fuelOilReceivedRecordRouter.get('/all',fuelOilReceivedRecordController.getAllRecords);

export default fuelOilReceivedRecordRouter;