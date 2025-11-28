import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200,
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


/////////// Register route
import userRoute from './routes/user.routes.js'
/// api should be api/v1/users
app.use("/api/v1/users", userRoute)

/// localhost://3000/api/v1/users
export default app;

