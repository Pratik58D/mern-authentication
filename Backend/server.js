import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";
import authRouter from "./src/routes/auth.route.js";
import userRouter from "./src/routes/user.route.js"


const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true,
}));

//Api endpoints
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
    connectDB();
})