import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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

      // Save JWT access token in localStorage
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      alert("Login successful!");
      navigate("/features"); // Navigate to dashboard (update as needed)

    } catch (err) {
      console.error(err);
      alert("Login failed! Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1120] p-6">
      <div className="w-full max-w-6xl h-[680px] bg-[#111827] rounded-3xl shadow-2xl flex overflow-hidden">

        {/* LEFT SIDE */}
        <div className="w-1/2 hidden md:block relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-400" />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm p-12 flex flex-col justify-between text-white">
            <div className="flex items-center gap-2 text-lg font-semibold">
              💰 <span>AI Finance Advisor</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold leading-tight mb-6">
                Welcome <br /> Back!
              </h1>
              <p className="text-lg opacity-90 mb-8 max-w-md">
                Continue your journey to financial freedom with AI-powered insights
              </p>
              <div className="bg-white/20 backdrop-blur-md p-5 rounded-2xl mb-8 text-sm">
                "A budget is telling your money where to go instead of wondering where it went."
              </div>
              <div className="flex gap-10">
                <div>
                  <p className="text-3xl font-bold">95%</p>
                  <p className="text-sm opacity-80">Users save more</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">NPR</p>
                  <p className="text-sm opacity-80">Cash tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 bg-[#0f172a] p-14 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-2">Login to Your Account</h2>
          <p className="text-gray-400 mb-10">
            Enter your credentials to access your dashboard
          </p>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Email Address</label>
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
              {loading ? "Logging in..." : "Login to Dashboard"}
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
