// src/pages/Homepage.jsx
import React from "react";
import { Link } from "react-router-dom";

function Homepage() {
  return (
    <div className="bg-[#0a0f1f] text-white min-h-screen overflow-x-hidden font-sans">
      {/* ================== NAVBAR ================== */}
      <nav className="fixed top-0 left-0 right-0 py-[18px] px-5 md:px-[60px] flex justify-between items-center bg-[rgba(255,255,255,0.05)] backdrop-blur-[12px] border-b border-[rgba(255,255,255,0.08)] z-[1000]">
        <div className="flex items-center gap-3">
          <img
            src="/JPG.jpg"
            alt="AI Finance Advisor logo"
            className="h-[42px] w-[42px] rounded-[12px] object-cover"
          />
          <div className="flex flex-col leading-[1.2]">
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#10b981] bg-clip-text text-transparent">
              AI Finance Advisor
            </h2>
            <p className="text-[13px] text-[#94a3b8] mt-0.5">For Nepal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="inline-block">
            <button className="bg-transparent text-white px-[18px] py-[10px] border border-[rgba(255,255,255,0.4)] rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-all duration-200">
              Login
            </button>
          </Link>
          <Link to="/signup" className="inline-block">
            <button className="bg-[#3b82f6] hover:bg-[#1d4ed8] px-[18px] py-[10px] rounded-lg font-semibold transition-all duration-200">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>

      {/* ================== HERO SECTION ================== */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0 px-5 md:px-[60px] pt-[120px] lg:pt-[150px] pb-20 lg:pb-20">
        <div className="max-w-full lg:max-w-[50%] text-center lg:text-left">
          <div className="bg-[rgba(0,122,255,0.2)] text-[#3b82f6] px-4 py-1.5 rounded-full text-sm inline-block mb-4">
            💠 AI-Powered Financial Intelligence
          </div>

          <h1 className="text-[48px] leading-none font-semibold mb-6">
            Smart <span className="text-[#4ade80]">AI Advisor</span><br />
            for Your Daily<br />
            Spending in Nepal
          </h1>

          <p className="text-[#cbd5e1] max-w-[480px] mx-auto lg:mx-0 text-[17px] leading-relaxed mb-8">
            Navigate Nepal's cash-based economy with confidence. Track expenses, scan receipts with OCR, get personalized insights, and achieve your financial goals with AI-powered predictions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/signup" className="inline-block">
              <button className="bg-[#3b82f6] hover:bg-[#1d4ed8] px-[26px] py-[12px] rounded-[10px] font-semibold text-base transition-all">
                Get Started Free
              </button>
            </Link>
            <Link to="/login" className="inline-block">
              <button className="bg-transparent border border-[rgba(255,255,255,0.3)] hover:bg-white/10 px-[26px] py-[12px] rounded-[10px] text-white font-medium transition-all">
                Login to Dashboard
              </button>
            </Link>
          </div>

          <div className="flex justify-center lg:justify-start gap-10 mt-10 text-center lg:text-left">
            <div>
              <strong className="block text-[22px]">99%</strong>
              <span className="text-[#94a3b8] text-sm">OCR Accuracy</span>
            </div>
            <div>
              <strong className="block text-[22px]">NPR</strong>
              <span className="text-[#94a3b8] text-sm">Local Currency</span>
            </div>
            <div>
              <strong className="block text-[22px]">AI</strong>
              <span className="text-[#94a3b8] text-sm">Predictions</span>
            </div>
          </div>
        </div>

        <div className="relative w-full lg:w-auto max-w-[420px] mx-auto lg:mx-0">
          <img
            src="/expense-tracker-homepage-image.jpg"
            alt="POS Payment Image"
            className="w-full rounded-2xl shadow-2xl"
          />
          <div className="absolute top-5 -right-5 bg-[rgba(34,197,94,0.15)] backdrop-blur-[10px] border border-green-500/40 px-5 py-3 rounded-2xl text-center">
            <span className="text-green-300 text-sm">Monthly Savings</span><br />
            <strong className="text-green-400 text-xl">+ NPR 5,240</strong>
          </div>
        </div>
      </section>

      {/* ================== FEATURES SECTION ================== */}
      <section className="py-20 px-5 md:px-[60px] text-center">
        <h2 className="text-[32px] font-semibold">Powerful Features for Nepal</h2>
        <p className="text-[#94a3b8] mt-3 text-lg">Designed specifically for cash-based economy challenges</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {/* Feature 1 */}
          <div className="bg-[#111828] p-8 rounded-2xl text-left">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-4">📷</div>
            <h3 className="text-xl font-semibold mb-2">OCR Receipt Scanner</h3>
            <p className="text-[#94a3b8]">Scan paper receipts instantly with AI-powered OCR technology.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#111828] p-8 rounded-2xl text-left">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
            <p className="text-[#94a3b8]">Visualize spending patterns with interactive charts and insights.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#111828] p-8 rounded-2xl text-left">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Goal Tracking</h3>
            <p className="text-[#94a3b8]">Set financial goals and receive AI-powered suggestions.</p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#111828] p-8 rounded-2xl text-left">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-[#94a3b8]">Bank-level encryption keeps your financial data safe.</p>
          </div>
        </div>
      </section>

      {/* ================== CTA BANNER ================== */}
      <section className="mx-5 lg:mx-[60px] mt-12 bg-gradient-to-r from-[#2563eb] to-[#22c55e] rounded-3xl py-16 px-8 text-center">
        <h2 className="text-[30px] font-semibold mb-3">Ready to Take Control of Your Finances?</h2>
        <p className="text-white/90 text-lg mb-8 max-w-md mx-auto">Join thousands of Nepali users managing money smarter with AI.</p>
        <button className="bg-white text-[#0a0f1f] hover:bg-white/90 px-8 py-4 rounded-2xl font-semibold text-lg transition-all">
          Start Your Journey
        </button>
      </section>

      {/* ================== FOOTER ================== */}
      <footer className="bg-[#0f172a] py-16 px-5 md:px-[60px] mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-2xl font-bold mb-3">AI Finance Advisor</h3>
            <p className="text-[#94a3b8]">Smart financial management for Nepal's cash-based economy.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#94a3b8]">Product</h4>
            <ul className="space-y-3 text-[#94a3b8]">
              <li className="cursor-pointer hover:text-white">Features</li>
              <li className="cursor-pointer hover:text-white">Pricing</li>
              <li className="cursor-pointer hover:text-white">Security</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#94a3b8]">Company</h4>
            <ul className="space-y-3 text-[#94a3b8]">
              <li className="cursor-pointer hover:text-white">About Us</li>
              <li className="cursor-pointer hover:text-white">Contact</li>
              <li className="cursor-pointer hover:text-white">Careers</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#94a3b8]">Legal</h4>
            <ul className="space-y-3 text-[#94a3b8]">
              <li className="cursor-pointer hover:text-white">Privacy Policy</li>
              <li className="cursor-pointer hover:text-white">Terms of Service</li>
              <li className="cursor-pointer hover:text-white">Cookie Policy</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-[#64748b] mt-16 text-sm">
          © 2025 AI Finance Advisor.
        </div>
      </footer>
    </div>
  );
}

export default Homepage;