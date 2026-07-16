import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, UploadCloud, Users, ShieldCheck, FileSpreadsheet, Lock, ChevronRight } from "lucide-react";
import nielitLogo from "../assets/nielit-logo.webp";
const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Replace this with the actual NIELIT logo URL
   const logoSrc = nielitLogo;;

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-['Inter',sans-serif] text-[#1c2b3a]">
      {/* Tricolor accent strip — signature govt-of-India marker */}
      <div className="h-[3px] w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Top utility bar */}
      <div className="bg-[#0b2545] text-white/70 text-[11px] tracking-wide">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-1.5 flex items-center justify-between">
          <span className="hidden sm:inline">Government of India | Ministry of Electronics & Information Technology</span>
          <span className="sm:hidden">Govt. of India | MeitY</span>
          <span>निर्वाण संस्थान · National Institute Portal</span>
        </div>
      </div>

      {/* Navbar */}
      <header className="bg-[#0d2f5e] px-4 sm:px-8 py-3 flex items-center justify-between shadow-md relative z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={logoSrc}
            alt="NIELIT Logo"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white object-contain p-1 ring-2 ring-[#c9a44c]/60"
          />
          <div>
            <p className="text-white text-sm sm:text-base font-semibold tracking-wide leading-tight">
              NIELIT Delhi
            </p>
            <p className="text-white/60 text-[11px] sm:text-xs leading-tight">
              Result Management Portal
            </p>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#services" className="text-white/80 text-sm hover:text-white transition">Services</a>
          <a href="#about" className="text-white/80 text-sm hover:text-white transition">About</a>
          <a href="#contact" className="text-white/80 text-sm hover:text-white transition">Contact</a>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#c9a44c] text-[#0d2f5e] px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#dab766] transition"
          >
            Login to Portal
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d2f5e] border-t border-white/10 px-4 py-4 flex flex-col gap-3 relative z-20">
          <a href="#services" className="text-white/85 text-sm py-1" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#about" className="text-white/85 text-sm py-1" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#contact" className="text-white/85 text-sm py-1" onClick={() => setMenuOpen(false)}>Contact</a>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#c9a44c] text-[#0d2f5e] px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[#dab766] transition w-full mt-1"
          >
            Login to Portal
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0d2f5e] to-[#123a73] px-4 sm:px-8 py-14 sm:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <p className="text-[#c9a44c] text-xs sm:text-sm tracking-[0.25em] font-medium mb-4 uppercase">
          Government of India · Ministry of Electronics & IT
        </p>
        <h1 className="text-white text-2xl sm:text-4xl font-semibold mb-4 leading-tight max-w-3xl mx-auto">
          NIELIT Delhi Result Management Portal
        </h1>
        <p className="text-white/75 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed px-2">
          The official platform for managing O-Level & A-Level examination results,
          student records, and academic performance reports.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-[#c9a44c] text-[#0d2f5e] px-8 py-3 rounded-md text-sm font-semibold hover:bg-[#dab766] transition inline-flex items-center gap-2"
        >
          Login to Portal <ChevronRight size={16} />
        </button>
      </section>

      {/* Feature Cards */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="text-center mb-8">
          <p className="text-[#0d2f5e] text-xs tracking-[0.2em] font-semibold uppercase mb-2">What we offer</p>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1c2b3a]">Core Portal Services</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-lg border border-[#dde3ea] p-6 hover:shadow-md hover:border-[#c9a44c]/50 transition">
            <div className="w-11 h-11 bg-[#0d2f5e] rounded-md flex items-center justify-center mb-4">
              <UploadCloud size={20} className="text-[#c9a44c]" />
            </div>
            <p className="text-sm font-semibold text-[#1c2b3a] mb-1.5">Result Upload</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Upload O-Level & A-Level results securely via structured Excel sheets in bulk.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#dde3ea] p-6 hover:shadow-md hover:border-[#c9a44c]/50 transition">
            <div className="w-11 h-11 bg-[#0d2f5e] rounded-md flex items-center justify-center mb-4">
              <Users size={20} className="text-[#c9a44c]" />
            </div>
            <p className="text-sm font-semibold text-[#1c2b3a] mb-1.5">Student Master</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Manage student records and track academic progress across exam cycles.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#dde3ea] p-6 hover:shadow-md hover:border-[#c9a44c]/50 transition sm:col-span-2 lg:col-span-1">
            <div className="w-11 h-11 bg-[#0d2f5e] rounded-md flex items-center justify-center mb-4">
              <Lock size={20} className="text-[#c9a44c]" />
            </div>
            <p className="text-sm font-semibold text-[#1c2b3a] mb-1.5">Role Based Access</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Admin & Operator roles with secure JWT-based authentication and audit trails.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-8 pb-10 sm:pb-14">
        <div className="bg-[#0d2f5e] rounded-xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 text-center">
          <div className="border-b sm:border-b-0 sm:border-r border-white/15 pb-4 sm:pb-0">
            <p className="text-[#c9a44c] text-2xl font-semibold flex items-center justify-center gap-2">
              <FileSpreadsheet size={20} /> O & A
            </p>
            <p className="text-white/60 text-xs mt-1.5 tracking-wide">Level Examination Support</p>
          </div>
          <div className="border-b sm:border-b-0 sm:border-r border-white/15 pb-4 sm:pb-0">
            <p className="text-[#c9a44c] text-2xl font-semibold flex items-center justify-center gap-2">
              <ShieldCheck size={20} /> 100%
            </p>
            <p className="text-white/60 text-xs mt-1.5 tracking-wide">Secure & Encrypted Records</p>
          </div>
          <div>
            <p className="text-[#c9a44c] text-2xl font-semibold flex items-center justify-center gap-2">
              <UploadCloud size={20} /> Excel
            </p>
            <p className="text-white/60 text-xs mt-1.5 tracking-wide">Bulk Upload Support</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#08213f] text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div>
            <p className="text-white font-semibold mb-2 text-sm">NIELIT Delhi</p>
            <p className="leading-relaxed">
              National Institute of Electronics & Information Technology, an autonomous
              scientific society under MeitY, Government of India.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2 text-sm">Quick Links</p>
            <ul className="space-y-1.5">
              <li><a href="#services" className="hover:text-white transition">Services</a></li>
              <li><a href="#about" className="hover:text-white transition">About the Portal</a></li>
              <li><a href="/login" className="hover:text-white transition">Login</a></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-2 text-sm">Contact</p>
            <p className="leading-relaxed">NIELIT Delhi Centre, New Delhi, India</p>
            <p className="leading-relaxed">help.delhi@nielit.gov.in</p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <p>© 2026 NIELIT Delhi — Result Management System. All rights reserved.</p>
            <p>A Government of India Initiative</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;