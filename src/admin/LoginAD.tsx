import { Link, useNavigate } from "react-router-dom";
import {
  Aster,
  connect,
  manage,
  optimize,
  slash,
  track,
} from "../assets/res";
import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { useAdminAuthStore } from "../store/adminAuthStore";

const LoginAD = () => {
  const navigate = useNavigate();
  const login = useAdminAuthStore((s) => s.login);
  const loading = useAdminAuthStore((s) => s.loading);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/admin");
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
      <div className=" m-auto">
        <div className="flex font-inter justify-between">
          <div className="flex-grow  gap-3  flex items-center justify-center">
            <div className="w-full p-4 bg-white rounded-md">
              <h1 className="text-2xl mb-5 font-inter font-semibold">Log In</h1>

              <form
                className="w-[360px] h-[386px] font-mulish left-[680px]"
                onSubmit={handleFormSubmit}
              >
                <>
                  <div className=" mb-4">
                    <div>
                      <label className="block text-sm  " htmlFor="email">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        placeholder="Enter here"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setEmail(email.trim())}
                        className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          email ? "bg-fade" : "bg-bginput"
                        }`}
                        required
                      />
                    </div>
                  </div>

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

                  <div className="flex font-bold justify-end mb-4">
                    <Link to={"/forgotpasswordad"} className="">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-pry  text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Login
                  </button>
                  <div className="flex items-center justify-center my-3">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500">or</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                  <div className="w-full flex justify-center">
  <Link to="/Signupad" className="font-semibold text-sm text-center">
  Don’t have an account?<span className="text-pry"> Sign Up</span>
  </Link>
</div>
   </>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAD;
