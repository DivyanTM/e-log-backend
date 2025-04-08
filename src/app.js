import express from 'express';
import { connectToDB } from "./config/DBConfig.js";

// routers
import authRouter from "./routes/authRouter.js"
import fosRouter from "./routes/fuelOilSampleRecordRouter.js"
import fuelOilReceivedRecordRouter from "./routes/fuelOilReceivedRecordRouter.js";
import grbRouter from "./routes/GRBrouter.js";
import NOXRouter from "./routes/NOXRouter.js";
import PendingRecordRouter from "./routes/CEPendingRecordsRouter.js";

import cors from "cors";

// middle wares
import authMiddleware from "./middlewares/authMiddleware.js"
import auditLogRouter from "./routes/AuditLogRouter.js";

const app = express();
app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URL.toString(),
    exposedHeaders: ['Authorization']
}));

app.use(async (req, res, next) => {
    if (!req.path.startsWith('/auth') && !req.path.startsWith('/password')) {
        try {
            return await authMiddleware(req, res, next);
        } catch (error) {
            console.error("Authentication failed:", error);
            if (!res.headersSent) {
                return res.status(401).json({ message: "Authentication failed" });
            }
        }
    } else {
        next();
    }
});




connectToDB();

app.use("/auth", authRouter);
app.use('/fos',fosRouter);
app.use('/for',fuelOilReceivedRecordRouter);
app.use('/grb',grbRouter);
app.use('/nox',NOXRouter);
app.use('/auditlogs',auditLogRouter);
app.use('/ce',PendingRecordRouter);

export default app;
