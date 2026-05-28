import { useNavigate } from "react-router-dom";
import { Aster, connect, manage, optimize, slash, track } from "../assets/res";
import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";

const ResetPassword = () => {
    const navigate = useNavigate(); 
  const [oldPasswordVisible, setOldPasswordVisible] = useState<boolean>(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    useState<boolean>(false);

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [secondsLeft, setSecondsLeft] = useState(30);



  // Timer logic for countdown
  useEffect(() => {
    if (secondsLeft === 0) return;

    const timerId = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [secondsLeft]);


  const toggleOldPasswordVisibility = () => {
    setOldPasswordVisible(!oldPasswordVisible);
  };

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible(!newPasswordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setPasswordError("");
    setConfirmPasswordError("");

    // Validate password strength
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    // Validate if passwords match
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }
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
                
                <div className="mb-2">
                      <label className="block  text-sm " htmlFor="oldPassword">
                       Old Password
                      </label>
                      <div className="relative">
                        <input
                          type={oldPasswordVisible ? "text" : "password"}
                          id="oldPassword"
                          placeholder="Enter here"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          onBlur={() => setOldPassword(oldPassword.trim())} // Optional: Trim whitespace on blur
                          className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-orange-500 
          ${oldPassword ? "bg-fade" : "bg-bginput"}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={toggleOldPasswordVisibility}
                          className="absolute inset-y-0 right-0 flex  px-2 items-center pr-3 text-gray-600"
                        >
                          {oldPasswordVisible ? (
                            <FaEye size={20} />
                          ) : (
                            <img src={slash} alt="Hide" />
                          )}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="text-sm text-red-500">{passwordError}</p>
                      )}
                    </div>
                

                  <div className="mb-2">
                    <label className="block  text-sm " htmlFor="newPassword">
                     New Password
                    </label>
                    <div className="relative">
                      <input
                        type={newPasswordVisible ? "text" : "password"}
                        id="newPassword"
                        placeholder="Enter here"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onBlur={() => setNewPassword(newPassword.trim())} // Optional: Trim whitespace on blur
                        className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-orange-500 
          ${newPassword ? "bg-fade" : "bg-bginput"}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={toggleNewPasswordVisibility}
                        className="absolute inset-y-0 right-0 flex  px-2 items-center pr-3 text-gray-600"
                      >
                        {newPasswordVisible ? (
                          <FaEye size={20} />
                        ) : (
                          <img src={slash} alt="Hide" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mb-2">
                      <label
                        className="block  text-sm "
                        htmlFor="confirmpassword"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={confirmPasswordVisible ? "text" : "password"}
                          id="confirmpassword"
                          placeholder="Enter here"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() =>
                            setConfirmPassword(confirmPassword.trim())
                          } // Optional: Trim whitespace on blur
                          className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-orange-500 
          ${confirmPassword ? "bg-fade" : "bg-bginput"}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute inset-y-0 right-0 flex  px-2 items-center pr-3 text-gray-600"
                        >
                          {confirmPasswordVisible ? (
                            <FaEye size={20} />
                          ) : (
                            <img src={slash} alt="Hide" />
                          )}
                        </button>
                      </div>
                      {confirmPasswordError && (
                        <p className="text-sm text-red-500">
                          {confirmPasswordError}
                        </p>
                      )}
                    </div>

                    <button
      type="button"
      className="w-full py-2 bg-[#F5F5F5] text-[#B8B8B8] font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      onClick={() => navigate("/loginad")} 
    >
      Continue
    </button>
   </>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
