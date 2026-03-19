import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const BackButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/features")}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-400/30 hover:border-blue-400/60 text-blue-400 hover:text-blue-300 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 group ${className}`}
      title="Back to Home"
    >
      <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
      <span className="font-medium text-sm">Back to Home</span>
    </button>
  );
};

export default BackButton;
