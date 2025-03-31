import express from 'express';
import bwrController from '../controllers/bwrController.js';
const bwrRouter = express.Router();
bwrRouter.post('/',bwrController.createRecord);
bwrRouter.get('/all',bwrController.fetchRecords);
export default bwrRouter;