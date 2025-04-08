import bunkerdeliverynoterecordController from "../controllers/bunkerdeliverynoterecordController.js";
import express from "express";
import multer from "multer";
const bdnRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
bdnRouter.get('/all',bunkerdeliverynoterecordController.getAllRecord);
bdnRouter.post('/',upload.single('supplierDeclaration'),bunkerdeliverynoterecordController.createRecord);

export default bdnRouter;