import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(UserContext);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleEmailFocus = () => setIsEmailFocused(true);
  const handleEmailBlur = () => {
    setIsEmailFocused(false);
    setEmailError(!isValidEmail(email));
  };

  const handlePasswordFocus = () => setIsPasswordFocused(true);
  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
    setPasswordError(password === "");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    // console.log('Email:', email, 'Password:', password);  // Log the form inputs for debugging
    if (!isValidEmail(email)) {
      setEmailError(true);
    }
    if (password === "") {
      setPasswordError(true);
    }
    axios
      .post("/users/login", { email, password })
      .then((res) => {
        console.log("Login success:", res.data); // Log the response
        localStorage.setItem("token", res.data.token); // Store the token in local storage
        setUser(res.data.user); // Set the user in the context
        navigate("/");
      })
      .catch((err) => {
        if (err.response) {
          console.log("Login error response:", err.response.data); // Log the error response from the backend
        } else {
          console.error("Login error:", err); // Log any other errors
        }
      });
  };

  return (
    <div className="h-screen flex items-center justify-center w-full">
      <div className="right hidden md:flex h-full w-1/2 p-2 bg-[#F9F6E6]">
        <div className="h-full w-full flex items-center justify-center">
          <img
            className="h-full w-full object-cover rounded-tl-xl rounded-bl-xl rounded-tr-md rounded-br-md"
            src="assets\login-bg-3.jpg"
          />
        </div>
      </div>
      <div className="left w-full md:w-1/2 h-full overflow-hidden md:flex items-center justify-center bg-[#FFFDF0]">
        <div className="rounded-lg flex flex-wrap overflow-hidden md:min-h-[450px] md:w-[450px] w-[90%] flex-col md:m-0 m-auto items-center justify-center shadow-md hover:shadow-xl duration-200 font-gilroy bg-[#F8FAFC] md:p-8 relative translate-y-24 md:translate-y-0">
          <h2 className="text-2xl flex flex-col items-center justify-center text-gray-500 mb-10 leading-3">
            <img src="assets\icons8-login-100.png" />
            Login Here
          </h2>
          <form
            onSubmit={submitHandler}
            className="w-full relative h-full p-2 md:p-0 "
          >
            <div className="w-full relative ">
              <div className="txt-fld w-full h-[50px] flex items-center relative">
                <input
                  onFocus={handleEmailFocus}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  className={`w-full h-full border rounded-lg border-[#dadce0] transition-ring ease-in-out duration-200 z-10 px-4 relative focus:outline-none focus:ring-[1.5px] focus:ring-[#1c4980] ${
                    emailError ? "border-[#d63601]" : "border-[#dadce0]"
                  }`}
                  type="email"
                  id="email"
                  required
                />
                <label
                  id="label1"
                  className={`absolute z-[10] bg-[#fff] rounded-lg transition-all ease-linear duration-200 font-medium text-sm text-teal-500 ${
                    isEmailFocused || email
                      ? "text-[#1c4980] translate-y-[-25px] text-[12px]"
                      : "text-[#afafaf] translate-y-[0]"
                  } left-[10px] px-[6px]`}
                  htmlFor="email"
                >
                  Email Id
                </label>
              </div>
              <div className="w-full h-4 flex mb-4">
                {emailError && (
                  <span
                    id="error-message1"
                    className="errorMessage w-full text-[#d63601] text-[10px] font-medium text-right"
                  >
                    Please enter a valid email
                  </span>
                )}
              </div>

              <div className="txt-fld w-full h-[50px] flex items-center relative">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  name="password"
                  className={`w-full h-full border rounded-lg border-[#dadce0] transition-border ease-in-out duration-200
                  z-10 px-4 relative focus:outline-none focus:ring-[1.5px] focus:ring-[#1c4980] ${
                    passwordError ? "border-[#d63601]" : "border-[#dadce0]"
                  }`}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  required
                />
                <label
                  id="label2"
                  className={`absolute z-[10] bg-[#fff] rounded-lg transition-all ease-linear duration-200 font-medium text-sm text-teal-500 ${
                    isPasswordFocused || password
                      ? "text-[#1c4980] translate-y-[-25px] text-[12px]"
                      : "text-[#afafaf] translate-y-[0]"
                  } left-[10px] px-[6px]`}
                  htmlFor="password"
                >
                  Enter Your Password
                </label>
                <span
                  id="togglePassword"
                  onClick={togglePasswordVisibility}
                  className="cursor-pointer hover:text-[#1e3050] text-[#afafaf] transition-all ease-in duration-200 absolute z-20 right-5"
                >
                  <i
                    id="eyeIcon"
                    className={`fas ${
                      showPassword ? "fa-eye" : "fa-eye-slash"
                    }`}
                  ></i>
                </span>
              </div>
              <div className="w-full h-4 flex mb-4">
                {passwordError && (
                  <span
                    id="error-message2"
                    className="errorMessage w-full text-[#d63601] text-[10px] font-medium text-right"
                  >
                    Please enter a password
                  </span>
                )}
              </div>

              <button
                className="w-full z-20 h-[50px] rounded-[50px] bg-[#0073e6] cursor-pointer text-[#fff] 
                flex justify-center items-center text-sm font-medium relative before:h-[50px] before:z-20 before:bg-[#245db0] before:absolute before:cursor-pointer
                before:w-full before:-left-[100%] hover:before:left-0 overflow-hidden before:origin-left before:duration-[.35s]"
              >
                <span className="z-50">Login</span>
              </button>
              <div
                className="signupLink w-full bg-sky-50 h-[50px] rounded-[50px] text-[#383838] 
             flex justify-center gap-1 border border-[#DADCE0] items-center text-sm mt-4 relative"
              >
                Don&apos;t have an account?
                <Link
                  to="/register"
                  className="text-sky-700 duration-[.2s] hover:bg-teal-100/80 px-1.5 rounded-md"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
