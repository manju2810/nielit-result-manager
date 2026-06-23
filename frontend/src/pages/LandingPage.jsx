import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans">

      {/* Navbar */}
      <div className="bg-[#1a56a0] px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <span className="text-[#1a56a0] font-bold text-lg">N</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">NIELIT Result Manager</p>
            <p className="text-white/65 text-xs">National Institute of Electronics & Information Technology</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-[#1a56a0] px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
        >
          Login
        </button>
      </div>

      {/* Hero */}
      <div className="bg-[#1a56a0] px-8 py-16 text-center">
        <p className="text-white/70 text-xs tracking-widest mb-3">GOVERNMENT OF INDIA</p>
        <h1 className="text-white text-3xl font-medium mb-4">Student Result Management System</h1>
        <p className="text-white/75 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
          A centralized platform for managing O-Level & A-Level student results, exam cycles, and performance reports.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-[#1a56a0] px-7 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
        >
          Login to Portal
        </button>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-3 gap-4 px-8 py-8 -mt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="w-10 h-10 bg-[#e8f0f7] rounded-lg flex items-center justify-center mb-3">
            <span className="text-[#1a56a0] text-lg">↑</span>
          </div>
          <p className="text-sm font-medium text-gray-800 mb-1">Result Upload</p>
          <p className="text-xs text-gray-500 leading-relaxed">Upload O-Level & A-Level results via Excel sheets in bulk.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="w-10 h-10 bg-[#e8f0f7] rounded-lg flex items-center justify-center mb-3">
            <span className="text-[#1a56a0] text-lg">👥</span>
          </div>
          <p className="text-sm font-medium text-gray-800 mb-1">Student Master</p>
          <p className="text-xs text-gray-500 leading-relaxed">Manage student records, track progress across exam cycles.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="w-10 h-10 bg-[#e8f0f7] rounded-lg flex items-center justify-center mb-3">
            <span className="text-[#1a56a0] text-lg">🔒</span>
          </div>
          <p className="text-sm font-medium text-gray-800 mb-1">Role Based Access</p>
          <p className="text-xs text-gray-500 leading-relaxed">Admin & Operator roles with secure JWT authentication.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 px-8 pb-8">
        <div className="bg-[#1a56a0] rounded-lg p-4 text-center">
          <p className="text-white text-xl font-medium">O & A</p>
          <p className="text-white/70 text-xs mt-1">Level Support</p>
        </div>
        <div className="bg-[#1a56a0] rounded-lg p-4 text-center">
          <p className="text-white text-xl font-medium">100%</p>
          <p className="text-white/70 text-xs mt-1">Secure & Encrypted</p>
        </div>
        <div className="bg-[#1a56a0] rounded-lg p-4 text-center">
          <p className="text-white text-xl font-medium">Excel</p>
          <p className="text-white/70 text-xs mt-1">Bulk Upload Support</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-gray-200 py-4">
        <p className="text-xs text-gray-400">NIELIT © 2026 — Result Management System | Government of India</p>
      </div>

    </div>
  );
};

export default LandingPage;