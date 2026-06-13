import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bg1 } from "../assets/res";
import { SignUpData } from "../types/auth.types";
import { useAuthStore } from "../store/authStore";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [visibility, setVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [storeAddress, setStoreAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [lga, setLGA] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [cacNumber, setCacNumber] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { signup, error } = useAuthStore();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard"); // Redirect to the dashboard if token exists
    }
  }, [navigate]);
  const toggleVisibility = (field: "password" | "confirmPassword") => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset errors
    setApiError("");
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

  const signUpData: SignUpData = {
  name: name.trim(),
  email: email.trim().toLowerCase(),
  password: password.trim(),
  storeDetails: {
    address: storeAddress.trim(),
    state: state.trim(),
    postalCode: postalCode.trim(),
    lga: lga.trim(),
  },
  cacNumber: cacNumber.trim(),
  phoneNumber: phoneNumber.trim(),
  userType: "Store",
};

    try {
      setLoading(true);
      const response = await signup(signUpData);
      if(response){
        console.log("Sign-up successful:", response);
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Sign-up failed:", error);
      setApiError(error.message || "An error occurred during sign-up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-inter justify-between">
      <div
        className="w-[24.65%] h-full bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${bg1})` }}
      ></div>
      <div className="flex-grow gap-2 m w-[75.35%] pl-[10%] flex items-center justify-center">
        <div className="w-full p-2 bg-white rounded-md">
          <h1 className="text-3xl font-semibold mb-2">Create Account</h1>
          <p className="mb-2">
            Already have an account?
            <Link
              to={"/login"}
              className="text-pry ml-2 font-bold no-underline"
            >
              LOGIN
            </Link>
          </p>
          {apiError && <p className="text-sm text-red-500">{apiError}</p>}{" "}
          {/* Display API error */}
          <form
            className="w-[500px] h-[386px] left-[680px]"
            onSubmit={handleFormSubmit}
            noValidate
          >
            <>
              <div className="grid grid-cols-2 gap-[7px] mb-2">
                <div>
                  <label
                    className="block text-sm font-medium text-input"
                    htmlFor="email"
                  >
                    Store Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter here"
                    value={email}
                   onChange={(e) => setEmail(e.target.value.toLowerCase())} 
                  onBlur={() => setEmail(email.trim().toLowerCase())} 
                    className={`mt-1 block text-sm h-[40px] w-[240px] px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      email ? "bg-fade" : "bg-bginput"
                    }`}
                     style={{ textTransform: "lowercase" }}   
                    required
                  />
                </div>
                <div>
                  <label
                    className="block  text-sm font-medium text-input"
                    htmlFor="name"
                  >
                    Store name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter here"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setName(name.trim())}
                    className={`mt-1 block text-sm h-[40px] w-[240px]  px-4 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-orange-500 
          ${name ? "bg-fade" : "bg-bginput"}`}
                    required
                  />
                </div>
              </div>
              <div className=" mb-2">
                <label
                  className="block  text-sm font-medium text-input"
                  htmlFor="store-address"
                >
                  Store Address
                </label>
                <input
                  type="text"
                  id="store-address"
                  placeholder="Enter here"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  onBlur={() => setStoreAddress(storeAddress.trim())}
                  className={`mt-1 block text-sm h-[40px] w-full   px-4 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-orange-500 
          ${storeAddress ? "bg-fade" : "bg-bginput"}`}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-[7px] mb-2">
                <div>
                  <label
                    className="block text-sm font-medium text-input"
                    htmlFor="state"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    placeholder="Enter state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={`mt-1 block text-sm h-[40px] w-full  px-4 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-orange-500 
          ${state ? "bg-fade" : "bg-bginput"}`}
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-input"
                    htmlFor="lga"
                  >
                    LGA
                  </label>
                  <input
                    type="text"
                    id="lga"
                    placeholder="Enter LGA"
                    value={lga}
                    onChange={(e) => setLGA(e.target.value)}
                    className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-orange-500 
          ${lga ? "bg-fade" : "bg-bginput"}`}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-input"
                    htmlFor="postal-code"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postal-code"
                    placeholder="Enter postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-orange-500 
          ${postalCode ? "bg-fade" : "bg-bginput"}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[7px] mb-2">
                <div>
                  <label className="block text-sm font-medium text-input" htmlFor="phone">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="e.g. 08012345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${phoneNumber ? "bg-fade" : "bg-bginput"}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-input" htmlFor="cac">
                    CAC Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="cac"
                    placeholder="e.g. RC-123456"
                    value={cacNumber}
                    onChange={(e) => setCacNumber(e.target.value)}
                    className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${cacNumber ? "bg-fade" : "bg-bginput"}`}
                  />
                </div>
              </div>

              <div className="mb-2">
                <label
                  className="block  text-sm font-medium text-input"
                  htmlFor="Password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={visibility.password ? "text" : "password"}
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
                    onClick={() => toggleVisibility("password")}
                    className="absolute inset-y-0 right-0 flex bg-white border px-2 items-center pr-3 text-gray-600"
                  >
                    {visibility.password ? "Hide" : "Show Password"}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
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
                    type={visibility.confirmPassword ? "text" : "password"}
                    id="confirmPassword"
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
                    onClick={() => toggleVisibility("confirmPassword")}
                    className="absolute inset-y-0 right-0 flex bg-white border px-2 items-center pr-3 text-gray-600"
                  >
                    {visibility.confirmPassword ? "Hide" : "Show Password"}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-sm text-red-500">{confirmPasswordError}</p>
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 ${
                  loading ? "bg-gray-300" : "bg-orange-300 hover:bg-orange-400"
                } text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
