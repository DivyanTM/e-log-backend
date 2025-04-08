import express from "express";

const fosRouter = express.Router();
import fuelOilSampleRecordController from "../controllers/fuelOilSampleRecordController.js";

fosRouter.post("/", fuelOilSampleRecordController.createRecord);
fosRouter.get("/all",fuelOilSampleRecordController.getAllRecords);
fosRouter.post("/verify",fuelOilSampleRecordController.updateRecordVerificationStatus);

export default fosRouter;
