import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import geminiRoutes from "./routes/geminiRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req,res)=>res.json({status:"ok", service:"gemini-scheduler-backend"}));
app.use("/api/gemini", geminiRoutes);
app.use("/api/meetings", meetingRoutes); // optional CRUD for persistence
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI,{dbName:"meetingsdb"}).then(()=>{
  console.log("✅ MongoDB connected");
  app.listen(PORT,()=>console.log(`🚀 Server listening on ${PORT}`));
}).catch(e=>{console.error("Mongo connect error:", e?.message);process.exit(1)});
