import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://127.0.0.1:8000/api/auth/forgot-password/", {
        email: email,
      });

      alert("Password reset link sent to your email!");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
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
                Reset <br /> Password
              </h1>

              <p className="text-lg opacity-90 mb-8 max-w-md">
                Don’t worry! It happens. Enter your email and we’ll send you a reset link.
              </p>

              <div className="bg-white/20 backdrop-blur-md p-5 rounded-2xl text-sm">
                "Security is not a product, but a process."
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 bg-[#0f172a] p-14 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Forgot Your Password?
          </h2>

          <p className="text-gray-400 mb-10">
            Enter your registered email address below.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="text-gray-400 text-sm block mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-gray-400 text-sm mt-8 text-center">
            Remember your password?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
