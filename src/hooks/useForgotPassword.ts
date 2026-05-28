import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useOtp } from "./useOtp";

export const useForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<string>(
    sessionStorage.getItem("step") || "1"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [storeEmail, setStoreEmail] = useState<string>(
    sessionStorage.getItem("email") || ""
  );
  const [timer, setTimer] = useState<number>(60); // 90 seconds for 1 minute and 30 seconds
  const [showResetButton, setShowResetButton] = useState<boolean>(false); // State to control reset button visibility
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { otpValues, handleOtpChange, handleKeyDown, handlePaste, inputRefs } =
    useOtp(6);

    useEffect(() => {
        if (timer > 0) {
          const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
          }, 1000);
          return () => clearInterval(interval);
        } else {
          setShowResetButton(true); // Show reset button when timer reaches 0
        }
      }, [timer]);

  const sendOTP = async (email: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/request-otp", {
        email,
      });
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("resetToken", response.data.resetToken);
      sessionStorage.setItem("step", "2");
      setStep("2");
    } catch (error: any) {
      sessionStorage.removeItem("email");
      if (error.response) {
        console.error(error.response.data.message);
        setErrorMessage(error.response.data.message);
      } else {
        console.error("An unexpected error occurred.");
        setErrorMessage(
          "An unexpected error occurred. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", {
        otp: otpValues.join(""),
        resetToken: sessionStorage.getItem("resetToken"),
      });
      sessionStorage.setItem("step", "3");
      setStep("3");
    } catch (error) {
      console.error("OTP verification failed:", error);
      setErrorMessage("OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        newPassword: newPassword,
        resetToken: sessionStorage.getItem("resetToken"),
      });
      sessionStorage.removeItem("resetToken");
      navigate("/login");
    } catch (error) {
      console.error("Password reset failed:", error);
      setErrorMessage("Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "1") {
      await sendOTP(storeEmail);
    } else if (step === "2") {
      await verifyOtp();
    } else {
      if (newPassword === confirmPassword) {
        await resetPassword();
      } else {
        setErrorMessage("Passwords do not match. Please try again.");
      }
    }
  };

  const handleResendCode = () => {
    setTimer(60); // Reset timer when resending code
    setShowResetButton(false); // Hide reset button again
    sendOTP(sessionStorage.getItem("email") || ""); // Resend OTP
  };

  return {
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
    otpValues, // Expose otpValues for use in ForgotPassword component
    handleOtpChange, // Expose handleOtpChange for use in ForgotPassword component
    handleKeyDown,
    handlePaste,
    inputRefs,
    timer, // Expose timer for use in ForgotPassword component
    showResetButton, // Expose showResetButton for use in ForgotPassword component
  };
};
