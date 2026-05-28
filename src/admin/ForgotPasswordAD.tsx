import { useNavigate } from "react-router-dom";
import { Aster, connect, gud, manage, optimize, slash, track } from "../assets/res";
import { useState } from "react";
import { FaEye } from "react-icons/fa";

const ForgotPasswordAD = () => {
  const navigate = useNavigate();
  const [currentInput, setCurrentInput] = useState("email"); 
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
 
  const handleEmailSubmit = () => {
    if (!email) {
      return;
    }
    setCurrentInput("password"); 
  };

 ;

  const handleSetPassword = () => {
    if (!password) {
      return;
    }
    navigate("/resetpassword");
  };

  return (
    <div className="w-full flex">
        <div className="p-5 bg-[#FFFCF6] w-[40%]">
        <div className="flex items-center  mb-6 pb-4 px-2 md:px-4">
          <img src={Aster} alt="Cart" className="w-6 h-6 md:w-8 md:h-8 mr-2" />
          <h1 className="hidden md:block text-lg font-bold text-pry">
            Aster<span className="text-blue">Cart</span>
          </h1>
        </div>
        <div className="gap-3 flex flex-col">
          <p className="font-space font-bold text-2xl">
            Welcome to <br /> AsterCart Admin
          </p>
          <div className="w-[462px] gap-5 flex">
            <div className="flex flex-col gap-5">
              <div className="bg-white w-[230px] gap-2 flex flex-col h-[120px] rounded-lg shadow p-4 mt-5 ">
                <img className="w-4 aspect-square" src={connect} alt="" />
                <p className="font-bold font-space text-sm">Connect</p>
                <p className="font-medium font-mulish text-sm text-[#515354]">
                  Link users to nearby <br /> supermarkets with ease
                </p>
              </div>
              <div className="bg-white w-[230px] gap-2 flex flex-col h-[120px] rounded-lg shadow p-4 mt-5 ">
                <img className="w-4 aspect-square" src={track} alt="" />
                <p className="font-bold font-space  text-sm">Track</p>
                <p className="font-medium font-mulish  text-sm text-[#515354]">
                  Monitor every order from <br /> request to delivery
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-5 mt-5">
              <div className="bg-white w-[230px] gap-2 flex flex-col h-[120px] rounded-lg shadow p-4 mt-5 ">
                <img className="w-4 aspect-square" src={manage} alt="" />
                <p className="font-bold font-space  text-sm">Manage</p>
                <p className="font-medium font-mulish  text-sm text-[#515354]">
                  Oversee orders, inventory, and <br /> store performance.
                </p>
              </div>
              <div className="bg-white w-[230px] gap-2 flex flex-col h-[120px] rounded-lg shadow p-4 mt-5 ">
                <img className="w-4 aspect-square" src={optimize} alt="" />
                <p className="font-bold font-space  text-sm">Optimize</p>
                <p className="font-medium font-mulish  text-sm text-[#515354]">
                  Streamline operations and <br /> enhance user experience
                </p>
              </div>
            </div>
          </div>
          <p className="text-base font-medium font-mulish">
            Do you want to speak with a representative?
          </p>
          <p className="font-extrabold font-mulish text-base">
            Call us at <span className="text-pry">800 1301 448 </span>{" "}
          </p>
        </div>
      </div>
      <div className="m-auto">
      <div className="w-full p-4 bg-white rounded-md">
          <h1 className="text-2xl mb-5 font-semibold">Forgot Password</h1>
          
          {currentInput === "email" && (
            <>
            <div   className="w-[360px] h-[386px] mt-5 mb-2 font-mulish left-[680px]"
             >
             <p className="text-sm mb-5">
                Please input your email, an OTP will <br /> be sent to the email
                shortly.
              </p>
              <label htmlFor="email" className="block text-sm mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 block text-sm h-[40px] w-full mb-5 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  email ? "bg-fade" : "bg-bginput"
                }`}
                required
              />
              <button
                onClick={handleEmailSubmit}
                className="w-full py-2 bg-[#F5F5F5] text-[#B8B8B8] font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                Send OTP
              </button>         
            </div>
            </>
          )}


          {currentInput === "password" && (
            <>
            <div  className="w-[360px] h-[386px] mt-5 mb-2 font-mulish left-[680px]"
             >
                  <p className="text-sm mb-3">Please enter new password sent to <br /> your mail.</p>
                  <div className="mb-2">
                    <label className="block  text-sm " htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        id="password"
                        placeholder="Enter here"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setPassword(password.trim())} // Optional: Trim whitespace on blur
                        className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-orange-500 
          ${password ? "bg-fade" : "bg-bginput"}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex  px-2 items-center pr-3 text-gray-600"
                      >
                        {passwordVisible ? (
                          <FaEye size={20} />
                        ) : (
                          <img src={slash} alt="Hide" />
                        )}
                      </button>
                    </div>
                  </div>
              <button
                onClick={handleSetPassword}
                className="w-full py-2 bg-[#F5F5F5] text-[#B8B8B8] font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
               Continue
              </button>
              <div className="flex gap-3">
              <img src={gud} alt="" />
              <div className="flex flex-col">
              <p className="text-[#2B641E] font-semibold text-sm mt-3">
                OTP verification successfull.
              </p>
              <p className="text-[#2B641E] text-xs mt-2">Your email was verified successfully.</p>
              </div>
              </div>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordAD;
