import React, { useContext, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import {AppContext} from "../context/AppContext"
import axios from "axios";
import {useNavigate} from  "react-router-dom";
import { toast } from "react-toastify";

const EmailVerify = () => {
  axios.defaults.withCredentials = true;
  const inputRefs = useRef([]);
  const navigate = useNavigate()

  const {backendUrl , isLoggedIn , userData ,getUserData } = useContext(AppContext)

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

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      //return the value of each input 
      const otpArray = inputRefs.current.map((e) => e.value);
      //it concatinates each single element of arraty into one 
      const otp = otpArray.join("");
      const {data} = await axios.post(backendUrl + "/api/auth/verify-account", {otp});

      if(data.success){
        toast.success(data.message)
        getUserData()
        navigate("/")
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(data.message)
    }
  };

  useEffect(()=>{
    isLoggedIn && userData && userData.isAccountVerified && navigate("/")
  },[isLoggedIn, userData])

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
      <form onSubmit={onSubmitHandler} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email verify OTP
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
        <button className="w-full py-3 bg-gradient-to-t from-blue-700 to-purple-700 text-white rounded-full">
          {" "}
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
