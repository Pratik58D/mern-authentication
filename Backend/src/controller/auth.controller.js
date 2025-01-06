import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please fill all the fields", success: false });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    });
    //sending welcome email to user
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to our website",
      text: `welcome to our website. your account ${email} has been created successfully.`,
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.error("error in register", error.message);
    res.status(501).json({ message: error.message, success: false });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please fill all the fields", success: false });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "user not found", success: false });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ message: "password dont match", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    });
    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
    });
  } catch (error) {
    console.error("error in login", error.message);
    res.status(501).json({ message: error.message, success: false });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 0, // 0 days
    });
    return res
      .status(200)
      .json({ message: "User logged out successfully", success: true });
  } catch (error) {
    console.error("error in logout", error.message);
    return res.status(501).json({ message: error.message, success: false });
  }
};

//send verification OTP to the user's email
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ message: "Account already verified", success: false });
    }
    //genrates a six digit ransom otp
    const otp = String(Math.floor(Math.random() * 900000 + 100000));
    user.verifyOtp = otp;
    //expires otp in 24hrs
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP for account verification is ${otp}`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully", success: true });
  } catch (error) {
    console.error("error in sendVerifyOtp", error.message);
    return res.status(501).json({ message: error.message, success: false });
  }
};

//verify the otp send to user's email and activate the account
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.json({ success: false, message: "misssing Details" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({ message: "Invalid Otp", success: false });
    }
    //in verifyotpexpiresat there is value saved after 24 hrs
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "otp expired", success: false });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res
      .status(200)
      .json({ message: "email verified sucessfuly", success: true });
  } catch (error) {
    console.error("error in verify email", error.message);
    return res.status(501).json({ message: error.message, success: false });
  }
};

//check if user is autheticated
export const isAuthenticated = async(req,res)=>{
  try {
    return res.status(200).json({success : true});
    
  } catch (error) {
    console.error("error in isAutheticated", error.message);
    return res.status(501).json({ message: error.message, success: false });
  }
  
}

///password reset OTP
export const sendResetOtp = async(req,res) =>{

  try {
    const {email} = req.body;
    if(!email){
      return res.status(400).json({success : false , message : "Email is required"})
    }

    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({uccess : false , message : "user not found"})
    };

    //genrates a six digit ransom otp
    const otp = String(Math.floor(Math.random() * 900000 + 100000));
    user.resetOtp = otp;
    //expires otp in 24hrs
    user.resetOtpExpireAt = Date.now() +  15 * 60 * 1000;  //15 min
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for Password Reset is ${otp}.`,
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "OTP is on your email", success: true }); 
  } catch (error) {
    console.error("error in sendResetOtp", error.message);
    return res.status(501).json({ message: error.message, success: false }); 
  }

}

///Rest User Password
export const resetPassword = async(req,res) =>{
  try {
    const {email , otp , newPassword} = req.body;
    if(!email || !otp || !newPassword ){
        return res
          .status(400)
          .json({ message: "Please fill all the fields", success: false });
    };
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "user not found", success: false });
    };
    if(user.resetOtp === "" || user.resetOtp !== otp){
      return res.json({success : false , message : 'Invalid OTP'})
    }

    if(user.resetOtpExpireAt < Date.now()){
      return res.json({success : false , message : "OTP expired"})
    };

    const hashedPassword = await bcrypt.hash(newPassword ,10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0 ;
    await user.save();
    return res.status(200).json({success :true ,message :"password has been reset Sucessfully"});
  } catch (error) {
    console.error("error in sendResetOtp", error.message);
    return res.status(501).json({ message: error.message, success: false }); 
  }

}
