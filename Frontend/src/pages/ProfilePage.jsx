import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowLeft, Edit2 } from "lucide-react";
import axios from "axios";

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/api/auth/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile information");
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChangePassword = () => {
    navigate("/forgot-password");
  };

  const handleBack = () => {
    navigate("/features");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex items-center justify-center">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white pb-10">
      {/* Header */}
      <div className="bg-[#1e293b] border-b border-gray-800 px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-bold">Profile Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account information</p>
        </div>
      </div>

      {/* Profile Content */}
      <main className="max-w-2xl mx-auto px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-[#1e293b] rounded-3xl p-8 border border-gray-800 shadow-lg">
          {/* Avatar Section */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-gray-700">
              {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>

          {/* User Info Section */}
          <div className="space-y-6">
            {/* Full Name */}
            <div className="bg-[#0f172a] rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <User size={20} className="text-blue-400" />
                <label className="text-sm font-semibold text-gray-300">Full Name</label>
              </div>
              <div className="text-lg text-white">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username || "Not provided"}
              </div>
            </div>

            {/* Email */}
            <div className="bg-[#0f172a] rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <Mail size={20} className="text-emerald-400" />
                <label className="text-sm font-semibold text-gray-300">Email Address</label>
              </div>
              <div className="text-lg text-white">{user?.email || "Not provided"}</div>
            </div>

            {/* Password Section */}
            <div className="bg-[#0f172a] rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Lock size={20} className="text-amber-400" />
                  <label className="text-sm font-semibold text-gray-300">Password</label>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg text-gray-400">••••••••</div>
                <button
                  onClick={handleChangePassword}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  <Edit2 size={16} />
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Info Text */}
          <p className="text-center text-gray-400 text-sm mt-8">
            To change your personal information, please contact support.
          </p>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
