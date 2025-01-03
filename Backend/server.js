import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.route.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials : true}));

//Api endpoints
app.use("/api/auth", authRoutes);

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
    connectDB();
})