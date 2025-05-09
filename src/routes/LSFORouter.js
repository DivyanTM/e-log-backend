import express from 'express';
import LSFOController from '../controllers/LSFOController.js';
const LSFORouter = express.Router();

LSFORouter.post('/',LSFOController.createRecord);
LSFORouter.get('/all',LSFOController.fetchRecords);
LSFORouter.post('/verify',LSFOController.updateRecordVerificationStatus);

export default LSFORouter;