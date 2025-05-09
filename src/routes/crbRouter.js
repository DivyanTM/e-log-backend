import express from 'express';
import crbController from '../controllers/crbController.js';
const crbRouter = express.Router();
crbRouter.post('/',crbController.createRecord);
crbRouter.get('/all',crbController.fetchRecords);
crbRouter.post('/verify',crbController.updateRecordVerificationStatus);

export default crbRouter;