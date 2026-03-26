import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getDashboardRouteByRole, saveLoginSession } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState(""); // email/username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send POST request to Django login API
      const res = await axios.post("http://127.0.0.1:8000/api/auth/login/", {
        username: email, // Django expects 'username'
        password: password,
      });

      // Persist auth session using normalized role/is_staff values.
      saveLoginSession(res.data);

      alert("Logged in successfully.");
      navigate(getDashboardRouteByRole(res.data?.role), { replace: true });

    } catch (err) {
      console.error(err);
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1120] p-6">
      <div className="w-full max-w-6xl h-170 bg-[#111827] rounded-3xl shadow-2xl flex overflow-hidden">

        {/* LEFT SIDE */}
        <div className="w-1/2 hidden md:block relative">
          <div className="absolute inset-0 bg-[#e9eef6]" />
          <img
            src="/login.jpg"
            alt="Login background"
            className="absolute inset-0 w-full h-full object-contain object-center"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 bg-[#0f172a] p-14 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-2">Sign In to Your Account</h2>
          <p className="text-gray-400 mb-10">
            Enter your email and password to continue.
          </p>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between text-sm text-gray-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-500" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-400 hover:underline cursor-pointer">
              Forgot Password?
              </Link>
            
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-gray-400 text-sm mt-8 text-center">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline cursor-pointer">
              Create an account
            </Link>
          </p>

          <Link to="/" className="text-gray-500 text-sm mt-4 text-center cursor-pointer hover:underline block">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
