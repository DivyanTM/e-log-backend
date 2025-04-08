import express from "express";
import AuditLogController from "../controllers/AuditLogController.js";



const AuditLogRouter = express.Router();

AuditLogRouter.get("/", AuditLogController.getAllAuditLog);

export default AuditLogRouter;