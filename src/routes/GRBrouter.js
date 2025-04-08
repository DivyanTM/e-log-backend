import express from 'express';
import GRBController from "../controllers/GRBController.js";
const grbRouter = express.Router();

grbRouter.post('/',GRBController.createRecord);
grbRouter.get('/all',GRBController.fetchRecords);
grbRouter.post('/verify',GRBController.updateRecordVerificationStatus);

export default grbRouter;