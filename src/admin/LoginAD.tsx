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
    <div className="w-full flex h-screen">
      <div className="p-8 bg-ink w-[40%] flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-8">
            <img src={Aster} alt="Cart" className="w-8 h-8 mr-2" />
            <h1 className="text-lg font-bold text-white">
              Aster<span className="text-pry">Cart</span>
            </h1>
          </div>
          <div className="flex flex-col gap-6">
            <p className="font-space font-bold text-3xl text-white leading-tight">
              Welcome to <br /> AsterCart Admin
            </p>
            <div className="flex gap-4">
              <div className="flex flex-col gap-4">
                <div className="bg-white/10 backdrop-blur-sm w-[210px] flex flex-col gap-2 rounded-xl p-5 border border-white/10">
                  <img className="w-5 aspect-square brightness-0 invert" src={connect} alt="" />
                  <p className="font-bold font-space text-sm text-white">Connect</p>
                  <p className="font-medium text-xs text-white/70">
                    Link users to nearby supermarkets with ease
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm w-[210px] flex flex-col gap-2 rounded-xl p-5 border border-white/10">
                  <img className="w-5 aspect-square brightness-0 invert" src={track} alt="" />
                  <p className="font-bold font-space text-sm text-white">Track</p>
                  <p className="font-medium text-xs text-white/70">
                    Monitor every order from request to delivery
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm w-[210px] flex flex-col gap-2 rounded-xl p-5 border border-white/10">
                  <img className="w-5 aspect-square brightness-0 invert" src={manage} alt="" />
                  <p className="font-bold font-space text-sm text-white">Manage</p>
                  <p className="font-medium text-xs text-white/70">
                    Oversee orders, inventory, and store performance.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm w-[210px] flex flex-col gap-2 rounded-xl p-5 border border-white/10">
                  <img className="w-5 aspect-square brightness-0 invert" src={optimize} alt="" />
                  <p className="font-bold font-space text-sm text-white">Optimize</p>
                  <p className="font-medium text-xs text-white/70">
                    Streamline operations and enhance user experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm text-white/60 font-medium">
            Do you want to speak with a representative?
          </p>
          <p className="font-bold text-base text-white mt-1">
            Call us at <span className="text-pry">800 1301 448</span>
          </p>
        </div>
      </div>
      <div className="flex-1 bg-off-white flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <h1 className="text-3xl font-space font-bold text-ink mb-8">Log In</h1>

          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-body mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmail(email.trim())}
                className="mt-1 block text-sm h-[44px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-body mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  placeholder="Enter here"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPassword(password.trim())}
                  className="mt-1 block text-sm h-[44px] w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry focus:border-pry bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted"
                >
                  {passwordVisible ? <FaEye size={20} /> : <img src={slash} alt="Hide" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <Link to={"/forgotpasswordad"} className="text-sm text-pry font-medium hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-pry hover:bg-orange-600 text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pry transition-colors"
            >
              Login
            </button>
            <div className="flex items-center justify-center my-4">
              <div className="flex-1 border-t border-border"></div>
              <span className="mx-4 text-muted text-sm">or</span>
              <div className="flex-1 border-t border-border"></div>
            </div>
            <div className="w-full flex justify-center">
              <Link to="/Signupad" className="font-semibold text-sm text-center text-body hover:text-pry transition-colors">
                Don&rsquo;t have an account? <span className="text-pry">Sign Up</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginAD;
