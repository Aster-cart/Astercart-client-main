import React, { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bg1 } from "../assets/res";
import { useAuthStore } from "../store/authStore";

const Login: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // State to hold error message
  const { login, error } = useAuthStore();
  const navigate = useNavigate();
  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible((prev) => !prev);
  }, []);
  

const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const ok = await login(email.trim(), password); 
    if (ok) navigate("/");
  } catch (err) {
    console.error("Login failed:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex h-screen font-inter justify-between">
      <div
        className="w-[24.65%]  h-full bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${bg1})` }}
      ></div>
      <div className="flex-grow  gap-3 m w-[75.35%] pl-[10%] flex items-center">
        <div className="w-[532px] p-4 bg-white rounded-md">
          <h1 className="text-3xl font-semibold mb-2">Login</h1>
          <p className="mb-4">
            Dont have an account?
            <Link
              to={"/signup"}
              className="text-pry ml-2 font-bold no-underline"
            >
              SIGN UP
            </Link>
          </p>
          <p className="text-red-500 mb-4 h-[1lh] w-[500px]"> {error && error}</p>

          <form
            className="w-[500px] h-[386px] left-[680px]"
            onSubmit={handleFormSubmit}
            noValidate
          >
            <>
              <div className=" mb-4">
                <div>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLocaleLowerCase())}
                    className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      email ? "bg-fade" : "bg-bginput"
                    }`}
                    
                  />
                </div>
              </div>
              <div className="mb-2">
                <label
                  className="block  text-sm font-medium text-input"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    placeholder="Enter here"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-orange-500 
          ${password ? "bg-fade" : "bg-bginput"}`}
                    
                  />
                  
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex bg-white border justify-center items-center text-gray-600 w-16"
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="flex justify-end mb-4">
                <Link to={"/forgotpassword"} className="text-pry">
                  Forgot Password
                </Link>
              </div>
              <button
                disabled={loading}
                type="submit"
                className={`w-full py-2 ${
                  loading ? "bg-gray-300" : "bg-orange-300 hover:bg-orange-400"
                } text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
