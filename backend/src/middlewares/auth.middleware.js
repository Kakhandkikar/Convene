const user = require('../models/user.model');
const jwt = require("jsonwebtoken");


async function authUserMiddleware(req,res,next) {

    const token = req.cookie.token;

    if(!token){
        return res.status(401).json({
            message: "Unauthorized Access"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await user.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user

        next()

    }catch(err){

        return res.status(401).json({
            message: "Invalid token"
        })

    }

}

module.exports = {
    authUserMiddleware
}