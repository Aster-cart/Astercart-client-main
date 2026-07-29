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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState<string>("");
  const [cacNumber, setCacNumber] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

  // Captures the store's real coordinates using the browser's own
  // Geolocation API — no geocoding service or API key required. This is
  // the prerequisite for distance-based delivery pricing: without a
  // store's real lat/lng, delivery fee can never be calculated from
  // actual distance, only guessed at with a flat fee.
  const handleUseCurrentLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support location detection. You can still sign up, but distance-based delivery pricing won't work for your store until this is set.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location access was denied. You can still sign up, but please set your store's location later from Settings so delivery fees calculate correctly."
            : "Could not detect your location. Please try again, or set it later from Settings."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset errors
    setApiError("");
    setPasswordError("");
    setConfirmPasswordError("");

    // Validate password strength
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError("Password must contain at least one number.");
      return;
    }

    // Validate if passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    if (!cacNumber.trim()) {
      setApiError("CAC Number is required.");
      return;
    }

    if (!agreedToTerms) {
      setApiError("You must agree to the Store Partner Agreement.");
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
    latitude,
    longitude,
  },
  cacNumber: cacNumber.trim(),
  phoneNumber: phoneNumber.trim(),
  bankAccount: bankName || accountName || accountNumber ? {
    bankName: bankName.trim(),
    accountName: accountName.trim(),
    accountNumber: accountNumber.trim(),
  } : undefined,
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
      <div className="flex-grow w-[75.35%] pl-[10%] flex items-center bg-ink overflow-y-auto">
        <div className="w-full py-8 pr-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-space font-bold mb-1 text-ink">Create Account</h1>
            <p className="mb-4 text-body text-sm">
              Already have an account?
              <Link
                to={"/login"}
                className="text-pry ml-2 font-bold no-underline hover:underline"
              >
                LOGIN
              </Link>
            </p>
            {apiError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded mb-3">{apiError}</p>}
            <form onSubmit={handleFormSubmit} noValidate>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="email">
                    Store Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter here"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    onBlur={() => setEmail(email.trim().toLowerCase())}
                    className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white"
                    style={{ textTransform: "lowercase" }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="name">
                    Store name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter here"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setName(name.trim())}
                    className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white"
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-body mb-1" htmlFor="store-address">
                  Store Address
                </label>
                <input
                  type="text"
                  id="store-address"
                  placeholder="Enter here"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  onBlur={() => setStoreAddress(storeAddress.trim())}
                  className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white"
                  required
                />
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="text-sm px-4 py-2 bg-pry-light text-pry rounded-md font-medium border border-pry-mid disabled:opacity-60 hover:bg-pry-mid transition-colors"
                >
                  {locating ? "Detecting location..." : latitude ? "Location captured — tap to recapture" : "Use my current location"}
                </button>
                {latitude && longitude && (
                  <p className="text-xs text-green-600 mt-1">
                    Location set ({latitude.toFixed(4)}, {longitude.toFixed(4)}) — needed for accurate delivery pricing.
                  </p>
                )}
                {locationError && (
                  <p className="text-xs text-yellow-600 mt-1">{locationError}</p>
                )}
                {!latitude && !locationError && (
                  <p className="text-xs text-muted mt-1">
                    Stand at your shop and tap above — this lets us calculate accurate delivery fees by distance.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="state">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    placeholder="Enter state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="lga">
                    LGA
                  </label>
                  <input
                    type="text"
                    id="lga"
                    placeholder="Enter LGA"
                    value={lga}
                    onChange={(e) => setLGA(e.target.value)}
                    className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="postal-code">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postal-code"
                    placeholder="Enter postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="phone">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="e.g. 08012345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="cac">
                    CAC Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="cac"
                    placeholder="e.g. RC-123456"
                    value={cacNumber}
                    onChange={(e) => setCacNumber(e.target.value)}
                    className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white"
                    required
                  />
                </div>
              </div>

              {/* Bank account details */}
              <h3 className="text-sm font-semibold text-ink mb-2 mt-4">Bank Account (for settlements)</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="bankName">Bank Name</label>
                  <input type="text" id="bankName" placeholder="e.g. GTBank" value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="accountName">Account Name</label>
                  <input type="text" id="accountName" placeholder="Full name on account" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="accountNumber">Account Number</label>
                  <input type="text" id="accountNumber" placeholder="e.g. 0123456789" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="Password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={visibility.password ? "text" : "password"}
                      id="password"
                      placeholder="Enter here"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setPassword(password.trim())}
                      className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility("password")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted text-sm"
                    >
                      {visibility.password ? "Hide" : "Show"}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1" htmlFor="ConfirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={visibility.confirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="Enter here"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setConfirmPassword(confirmPassword.trim())}
                      className="mt-1 block text-sm h-[42px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-off-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility("confirmPassword")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted text-sm"
                    >
                      {visibility.confirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-sm text-red-500 mt-1">{confirmPasswordError}</p>
                  )}
                  {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                </div>
              </div>

              {/* Terms agreement */}
              <div className="flex items-start gap-2 mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-pry border-border rounded focus:ring-pry"
                />
                <label htmlFor="terms" className="text-sm text-body">
                  I have read and agree to the{" "}
                  <a href="/terms" target="_blank" className="text-pry font-medium hover:underline">
                    Store Partner Agreement
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" className="text-pry font-medium hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry ${
                  loading ? "bg-muted text-white cursor-not-allowed" : "bg-pry hover:bg-orange-600 text-white transition-colors"
                }`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
