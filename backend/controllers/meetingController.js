import Meeting from "../models/Meeting.js";
export async function listMeetings(req,res){
  try{ const docs = await Meeting.find().sort({createdAt:-1}); res.json(docs); }
  catch(e){ res.status(500).json({error:e.message}); }
}
export async function getMeeting(req,res){
  try{ const doc = await Meeting.findById(req.params.id); if(!doc) return res.status(404).json({error:"Not found"}); res.json(doc);}
  catch(e){ res.status(500).json({error:e.message}); }
}
