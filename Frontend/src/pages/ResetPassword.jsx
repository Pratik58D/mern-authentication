import React, { useContext, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp,setOtp] = useState([]);
  const [isOtpSend, setIsOtpSend] = useState(false);

 
  const inputRefs = useRef([]);
  //automatically moving the input field
  const handleInput = (e, index) => {
    if (e.target.value !== "" && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };
  //bakspace key functionality
  const handlekeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  //handle copy paste feature
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth//send-reset-otp",
        { email }
      );
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitOtp = async(e)=>{
    e.preventDefault();
    const otpArray = inputRefs.current.map(e => e.value);
    setOtp(otpArray.join(""))
    setIsOtpSend(true);
  }

  const onSubmitNewPassword = async(e) =>{
    e.preventDefault();
    try {
      const {data} = await axios.post(backendUrl + "/api/auth/reset-password",{email , otp , newPassword});
      if(data && data.success){
        toast.success(data.message);
        navigate("/login");

      } else{
        toast.error(data?.message || "Error in ressetting password")
      }      
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen
    bg-gradient-to-t from-blue-400 to-purple-400"
    >
      <img
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        src={assets.logo}
        alt="login logo"
        onClick={() => navigate("/")}
      />
      {/* email of password forgotten */}

      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">Enter your email</p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-slate-700">
            <img src={assets.mail_icon} alt="" className="size-3" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="enter your email"
              className="bg-transparent outline-none text-white"
              required
            />
          </div>

          <button className="w-full py-2.5 bg-gradient-to-t from-blue-700 to-purple-700 text-white rounded-full mt-3">
            Submit
          </button>
        </form>
      )}
      {/* for adding otp */}

      {!isOtpSend && isEmailSent && (
        <form onSubmit={onSubmitOtp} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password OTP
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit code to your email id.
          </p>
          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handlekeyDown(e, index)}
                  ref={(e) => (inputRefs.current[index] = e)}
                  type="text"
                  maxLength={1}
                  key={index}
                  required
                  className="w-12 h-12 rounded-md bg-slate-700 text-white text-xl text-center"
                />
              ))}
          </div>
          <button className="w-full py-2.5 bg-gradient-to-t from-blue-700 to-purple-700 text-white rounded-full">
            Submit
          </button>
        </form>
      )}

      {/* enter new password */}

      {isOtpSend && isEmailSent && (
        <form onSubmit={onSubmitNewPassword} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the new password
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-slate-700">
            <img src={assets.lock_icon} alt="" className="size-3" />
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="enter new password"
              className="bg-transparent outline-none text-white"
              required
            />
          </div>

          <button className="w-full py-2.5 bg-gradient-to-t from-blue-700 to-purple-700 text-white rounded-full mt-3">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
