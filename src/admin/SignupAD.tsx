import { Link, useNavigate } from "react-router-dom";
import { Aster, connect, manage, optimize, slash, track } from "../assets/res";
import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";

const SignupAD = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [, setOtpValid] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State to manage loading spinner visibility
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const expectedOtp = "123456"; 
  
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    if (/[^a-zA-Z0-9]/.test(value)) return; // Allow only alphanumeric characters

    const updatedOtp = [...otp];
    updatedOtp[index] = value.slice(-1); // Get the last character entered
    setOtp(updatedOtp);

    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  // Check if OTP is complete and matches the expected value
  if (updatedOtp.join("") === expectedOtp) {
    // If OTP matches, navigate to login page
    navigate("/loginad");
  }
};


  // Handle backspace key to move backward in the OTP fields
  const handleBackspace = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && otp[index] === "") {
      const previousInput = document.getElementById(
        `otp-${index - 1}`
      ) as HTMLInputElement;
      if (previousInput) previousInput.focus();
    }
  };

  // Timer logic for countdown
  useEffect(() => {
    if (secondsLeft === 0) return;

    const timerId = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [secondsLeft]);

  // Handle resend code button click
  const handleResendCode = () => {
    setSecondsLeft(30); // Reset the timer
    setIsResendDisabled(true); // Disable the resend button
    setOtp(["", "", "", "", "", ""]); // Clear the OTP fields
    setIsLoading(true); // Show the loading spinner

    // Enable the resend button after 30 seconds and hide the loading spinner
    setTimeout(() => {
      setIsResendDisabled(false);
      setIsLoading(false);
    }, 30000);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
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
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    // Validate if passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }
    setOtpSent(true);
  };

  const handleOtpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Join OTP array into a single string
    const otpString = otp.join("");

    // Validate OTP (replace with backend validation)
    if (otpString === "123456") {
      setOtpValid(true);
      // Proceed with the next steps, e.g., account creation
    } else {
      alert("Invalid OTP");
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
      <div className=" mx-auto">
        <div className="flex font-inter justify-between">
          <div className="flex-grow  gap-3  flex items-center justify-center">
            <div className="w-full p-4 bg-white rounded-md">
              <form
                className="w-[360px] h-[386px] font-mulish left-[680px]"
                onSubmit={otpSent ? handleOtpSubmit : handleFormSubmit}
              >
                {!otpSent ? (
                  <>
                    <div className=" mb-4">
                      <h1 className="text-2xl mb-5 font-inter font-semibold">
                        Sign Up
                      </h1>
                      <div>
                        <label className="block text-sm  " htmlFor="phone">
                          Phone Number
                        </label>
                        <input
                          type="phone"
                          id="phone"
                          placeholder="Enter here"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onBlur={() => setPhone(phone.trim())}
                          className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            phone ? "bg-fade" : "bg-bginput"
                          }`}
                          required
                        />
                      </div>
                    </div>
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
                      {passwordError && (
                        <p className="text-sm text-red-500">{passwordError}</p>
                      )}
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
                          onBlur={() => setConfirmPassword(confirmPassword.trim())} // Optional: Trim whitespace on blur
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

                    <div className="flex font-bold justify-end mb-4">
                      <Link to={"/forgotpasswordad"} className="">
                        Forgot Password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-pry  text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      Sign Up
                    </button>
                    <div className="flex items-center justify-center my-3">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="mx-4 text-gray-500">or</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                    <div className="w-full flex justify-center">
                      <Link
                        to="/loginad"
                        className="font-semibold text-sm text-center"
                      >
                        Already have an account?
                        <span className="text-pry"> Log In</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="my-10">
                    <div className="mb-4">
                      <label
                        className="block text-center items-center"
                        htmlFor="otp"
                      >
                        <p className="font-semibold mb-5 text-2xl">
                          OTP Verification
                        </p>
                        <p className="text-sm mb-5">
                          Please enter the code sent to +23423456789098.
                        </p>
                      </label>
                      <div className="flex mb-5 space-x-2">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(e, index)}
                            onKeyDown={(e) => handleBackspace(e, index)}
                            className={`w-12 h-12 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                              digit ? "bg-fade" : "bg-bginput"
                            }`}
                            pattern="[0-9]*"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Resend Code Button */}
                    <div className="mt-4 text-center">
                      <div className="flex justify-between">
                        {/* Resend Code Button on the left */}

                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={isResendDisabled}
                          className={`w-full text-sm  ${
                            isResendDisabled
                              ? "flex  justify-center items-center"
                              : "text-left"
                          }`}
                        >
                          {isResendDisabled
                            ? `Resend Code in ${secondsLeft}s`
                            : "Resend Code in 00:30"}
                        </button>

                        {/* Placeholder for the right side */}
                        {!isResendDisabled && (
                          <div className="text-sm text-right flex-grow" />
                        )}
                      </div>
                    </div>

                    {/* Conditional rendering of the Send button or the loader */}
                    {!isLoading ? (
  <button
    type="submit"
    className="w-full py-2 bg-pry text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 mt-4"
  >
    Send
  </button>
) : (
  <div className="flex justify-center flex-col gap-3 items-center mt-4">
    <div className="w-12 h-12 border-8 border-t-4 border-pry rounded-full animate-spin" style={{ borderTopColor: '#F97316', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}></div>
    <p className="ml-3 text-sm text-pry">Please wait...</p>
  </div>
)}


                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupAD;
