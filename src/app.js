import express from 'express';
import { connectToDB } from "./config/DBConfig.js";
import authRouter from "./routes/authRouter.js"
import fosRouter from "./routes/fuelOilSampleRecordRouter.js"
import cors from "cors";
import authMiddleware from "./middlewares/authMiddleware.js"

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

export default app;
