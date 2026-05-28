import React from "react";
import { bg1 } from "../assets/res";
import { useToggle } from "../hooks/useToggle";
import { useForgotPassword } from "../hooks/useForgotPassword";

const ForgotPassword: React.FC = () => {
  const {
    step,
    storeEmail,
    setStoreEmail,
    errorMessage,
    handleFormSubmit,
    handleResendCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    otpValues,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    inputRefs,
    timer,
    showResetButton
  } = useForgotPassword();
  const {
    values, // Contains all toggle states
    toggleValue, // Function to toggle specific keys
  } = useToggle({ newPasswordVisible: false, confirmPasswordVisible: false });
  return (
    <div className="flex font-inter h-screen justify-between">
      <div
        className="w-[24.65%] h-full bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${bg1})` }}
      ></div>
      <div className="flex-grow gap-3 m w-[75.35%] pl-[10%] flex items-center justify-center">
        <div className="w-full p-4 bg-white rounded-md">
          <h1 className="text-3xl font-semibold mb-5">Forgot Password</h1>
          <p className="mb-5 my-auto">
            {step == "1"
              ? "Input your email, an OTP will be sent to it."
              : step == "2"
              ? "Enter the 6-digit OTP sent to your email."
              : "Enter your new password below."}
          </p>

          <form
            className="w-[500px] h-[386px] mb-5 left-[680px]"
            onSubmit={handleFormSubmit}
          >
            {step === "1" ? (
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-input"
                  htmlFor="store-email"
                >
                  Store Email
                </label>
                <input
                  type="email"
                  id="store-email"
                  placeholder="Enter here"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  onBlur={() => setStoreEmail(storeEmail.trim())}
                  className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    storeEmail ? "bg-fade" : "bg-bginput"
                  } transition-all duration-300`}
                  required
                />
              </div>
            ) : step === "2" ? (
              <div className="flex justify-between mb-4">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(e.target.value, index)} // Update OTP on change
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined} // Handle paste only on the first input
                    ref={(el) => (inputRefs.current[index] = el!)}
                    className={`w-12 h-12 text-center border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      value ? "bg-fade" : "bg-bginput"
                    }`}
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="mb-2">
                  <label
                    className="block  text-sm font-medium text-input"
                    htmlFor="new-password"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={values.newPasswordVisible ? "text" : "password"}
                      id="new-password"
                      placeholder="Enter here"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onBlur={() => setNewPassword(newPassword.trim())}
                      className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-orange-500 
        ${newPassword ? "bg-fade" : "bg-bginput"}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={()=>toggleValue("newPasswordVisible")}
                      className="absolute inset-y-0 right-0 flex bg-white border px-2 items-center pr-3 text-gray-600"
                    >
                      {values.newPasswordVisible ? "Hide" : "Show Password"}
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <label
                    className="block  text-sm font-medium text-input"
                    htmlFor="ConfirmPassword"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={values.confirmPasswordVisible ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="Enter here"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setConfirmPassword(confirmPassword.trim())}
                      className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-orange-500 
        ${confirmPassword ? "bg-fade" : "bg-bginput"}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={()=>toggleValue("confirmPasswordVisible")}
                      className="absolute inset-y-0 right-0 flex bg-white border px-2 items-center pr-3 text-gray-600"
                    >
                      {values.confirmPasswordVisible ? "Hide" : "Show Password"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {errorMessage && (
              <div className="text-red-500 text-sm mb-3">{errorMessage}</div>
            )}

            {step === "2" && (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={!showResetButton}
                className={`text-sm font-semibold ${
                  showResetButton ? "text-white" : "text-gray-400 bg-white"
                } bg-pry rounded-3xl px-3 py-2`}
              >
                {timer > 0 ? `Resend Code in ${timer}s` : "Resend Code"}
              </button>

            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-2 bg-pry hover:bg-orange-400 text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 mt-4 disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
              {step === "3" ? "Reset Password" : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
