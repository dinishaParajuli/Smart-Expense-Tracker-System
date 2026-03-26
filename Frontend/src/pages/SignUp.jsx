import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const fullName = formData.fullName.trim();
      const [firstName, ...rest] = fullName.split(/\s+/);
      const lastName = rest.join(" ");

      // Call Django register API
      const res = await axios.post("http://127.0.0.1:8000/api/auth/register/", {
        username: formData.email, // Django expects 'username'
        first_name: firstName || "",
        last_name: lastName || "",
        email: formData.email,
        password: formData.password,
        role: formData.role || "user",
      });

      console.log(res.data);
      alert("Sign up successful! Please login.");
      navigate("/"); // Redirect to login page

    } catch (err) {
      console.error(err);
      const apiError = err?.response?.data;
      let message = "Sign up failed! Try again.";

      if (typeof apiError === "string") {
        message = apiError;
      } else if (apiError && typeof apiError === "object") {
        const firstError = Object.entries(apiError)
          .map(([field, value]) => `${field}: ${Array.isArray(value) ? value[0] : value}`)
          .find(Boolean);
        if (firstError) message = firstError;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1b2435] p-6">
      <div className="w-full max-w-6xl h-180 bg-[#111827] rounded-3xl shadow-2xl flex overflow-hidden">

        {/* LEFT SIDE */}
        <div className="w-1/2 hidden md:block relative">
          <div className="absolute inset-0 bg-[#e9eef6]" />
          <img
            src="/Register.jpg"
            alt="Signup background"
            className="absolute inset-0 w-full h-full object-contain object-center"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 bg-[#0f172a] p-14 flex flex-col justify-center">

          <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
          <p className="text-gray-400 mb-10">Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="text-gray-400 text-sm block mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="yourname@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#1e293b] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <p className="text-gray-400 text-sm mt-8 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline cursor-pointer">
              Login here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
