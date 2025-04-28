import express from "express";
import orb2Controller from "../controllers/orb2Controller.js";
const orb2Router = express.Router();


orb2Router.post('/submit-operations',orb2Controller.handleOperation);
orb2Router.get('/retrieve-operations',orb2Controller.getallOperations);


export default orb2Router;