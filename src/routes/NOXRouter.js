import NOXTierChangeOverRecordController from "../controllers/NOXTierChangeOverRecordController.js";

import express from 'express';

const NOXRouter = express.Router();

NOXRouter.get('/all',NOXTierChangeOverRecordController.getRecords);
NOXRouter.post('/',NOXTierChangeOverRecordController.createRecord);
NOXRouter.post('/verify',NOXTierChangeOverRecordController.updateRecordVerificationStatus);

export default NOXRouter;