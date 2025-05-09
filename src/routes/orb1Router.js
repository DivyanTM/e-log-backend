import express from 'express';
import orb1Controller from '../controllers/orb1Controller.js';
const orb1Router = express.Router();
orb1Router.post('/',orb1Controller.createRecord);
orb1Router.get('/all',orb1Controller.fetchRecords);
orb1Router.post('/verify',orb1Controller.updateRecordVerificationStatus);
export default orb1Router;