const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_EXPIRES_IN = "7h";
const COOKIE_MAX_AGE_MS = 7 * 60 * 60 * 1000; // 7 hours

async function registerUser(req,res){
    const { fullName,email,password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        email
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message : "User already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        fullName,
        email,
        password : hashedPassword
    })

    const token = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET,{expiresIn: JWT_EXPIRES_IN})

    res.cookie("token", token, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE_MS,
    })

    res.status(201).json({
        message: "User registered successfully",
        user: {
            _id : user._id,
            email: user.email,
            fullName: user.fullName
        }
    })
}

async function loginUser(req,res){
    const { email,password } = req.body;

    const user = await userModel.findOne({
        email
    })

    if(!user){
        return res.status(400).json({
            message : "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password,user.password);

    if(!isPasswordValid){
         return res.status(400).json({
            message : "Invalid email or password"
        })
    }

    const token = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET,{expiresIn: JWT_EXPIRES_IN})

    res.cookie("token",token,{
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE_MS,
    })

    res.status(200).json({
        message: "User logged in successfully",
        user:{
            _id: user._id,
            email: user.email,
            fullName: user.fullName
        }
    })
}

async function logoutUser(req,res){
    res.clearCookie("token",{
        httpOnly: true,
    });
    res.status(200).json({
        message : "User logged out successfully"
    });
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
}