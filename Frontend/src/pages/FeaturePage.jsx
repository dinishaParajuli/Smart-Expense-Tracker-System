import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const features = [
  {
    title: "Dashboard",
    desc: "View spending summaries, charts, and AI-powered insights.",
    color: "bg-blue-500",
    link: "/dashboard",
  },
  {
    title: "Budget Planner",
    desc: "Set budgets, track allocations, and get AI suggestions.",
    color: "bg-emerald-500",
    link: "/budget-planner",
  },
  {
    title: "Receipt Scanner",
    desc: "Scan paper receipts with OCR technology.",
    color: "bg-amber-500",
    link: "/receipt-scanner",
  },
  {
    title: "Goals & Challenges",
    desc: "Set financial goals, track progress, and earn rewards.",
    color: "bg-purple-500",
    link: "/goals-challenges",
  },
  {
    title: "Budget Entry",
    desc: "Manually add expenses and income entries.",
    color: "bg-red-500",
    link: "/budget-entry",
  },
];

export default function FeaturePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
      
      {/* Navbar */}
      <div className="flex justify-between items-center px-8 py-4 bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold">
            AI
          </div>
          <h1 className="text-lg font-semibold">AI Finance Advisor</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">John Doe</div>
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
            JD
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-10">
        <h2 className="text-3xl font-bold mb-2">
          Welcome Back, John! 👋
        </h2>
        <p className="text-gray-400 mb-8">
          What would you like to do today?
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#1e293b] rounded-2xl p-6 shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition duration-300 border border-gray-800"
            >
              <div
                className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center text-lg font-bold`}
              >
                $
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                {feature.title}
              </h3>

              <p className="text-gray-400 text-sm mt-2">
                {feature.desc}
              </p>

              <Link
                to={feature.link}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 transition py-2 rounded-lg font-medium inline-block text-center"
              >
                Enter →
              </Link>
            </div>
          ))}
        </div>

        {/* AI Insights Section */}
        <div className="mt-12 bg-[#1e293b] rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4">
            AI Insights for You
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-900/30 p-4 rounded-xl">
              <p className="text-sm text-gray-300">
                You're spending 23% more on food this month. Try meal planning to save NPR 2,000.
              </p>
            </div>

            <div className="bg-emerald-900/30 p-4 rounded-xl">
              <p className="text-sm text-gray-300">
                Great job! You've saved 85% towards your New Laptop goal.
              </p>
            </div>

            <div className="bg-amber-900/30 p-4 rounded-xl">
              <p className="text-sm text-gray-300">
                Don't forget to scan your receipts from today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}