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
      navigate("/dashboard");
    }
  }, [navigate]);

  const toggleVisibility = (field: "password" | "confirmPassword") => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setApiError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

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
      userType: "Store",
    };

    try {
      setLoading(true);
      const response = await signup(signUpData);

      if (response) {
        navigate("/login");
      }
    } catch (error: any) {
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
      />

      <div className="flex-grow gap-2 w-[75.35%] pl-[10%] flex items-center justify-center">
        <div className="w-full p-2 bg-white rounded-md">
          <h1 className="text-3xl font-semibold mb-2">Create Account</h1>

          <p className="mb-2">
            Already have an account?
            <Link to="/login" className="text-pry ml-2 font-bold">
              LOGIN
            </Link>
          </p>

          {apiError && <p className="text-sm text-red-500">{apiError}</p>}

          <form
            className="w-[500px] h-[386px] left-[680px]"
            onSubmit={handleFormSubmit}
            noValidate
          >
            <div className="grid grid-cols-2 gap-[7px] mb-2">
              <div>
                <label>Store Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  style={{ textTransform: "lowercase" }}
                />
              </div>

              <div>
                <label>Store Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-2">
              <label>Store Address</label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-[7px] mb-2">
              <input
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />

              <input
                placeholder="LGA"
                value={lga}
                onChange={(e) => setLGA(e.target.value)}
              />

              <input
                placeholder="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />

              <input
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />

              <input
                placeholder="CAC Number"
                value={cacNumber}
                onChange={(e) => setCacNumber(e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label>Password</label>
              <input
                type={visibility.password ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label>Confirm Password</label>
              <input
                type={visibility.confirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {error && <p className="text-red-500">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;