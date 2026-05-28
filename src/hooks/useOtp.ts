import { useState, useRef } from "react";

export const useOtp = (length: number) => {
  const [otpValues, setOtpValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    // Allow only numeric input
    if (!/^\d*$/.test(value)) return;

    const updatedOtpValues = [...otpValues];
    updatedOtpValues[index] = value.slice(-1); // Only take the last character
    setOtpValues(updatedOtpValues);

    // Automatically move focus to the next input field if the current one is filled
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Handle backspace to move to the previous input
    if (e.key === "Backspace" && otpValues[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, ""); // Only extract digits
    if (pastedData.length === 0) return;

    const updatedOtpValues = [...otpValues];
    for (let i = 0; i < length && i < pastedData.length; i++) {
      updatedOtpValues[i] = pastedData[i];
    }
    setOtpValues(updatedOtpValues);

    // Automatically move focus to the last filled input field
    const lastFilledIndex = Math.min(pastedData.length, length) - 1;
    inputRefs.current[lastFilledIndex]?.focus();
  };

  return { otpValues, handleOtpChange, handleKeyDown, handlePaste, inputRefs };
};
