
import { Phone, Mail, MapPin, Globe } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gradient-to-br from-blue-900 via-indigo-800 to-indigo-700 text-white shadow-2xl">
      
      {/* Top Bar */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex flex-wrap items-center justify-between text-sm">
            
            {/* Contact Info */}
            <div className="flex flex-wrap items-center gap-6">
              <a
                href="tel:+918447795337"
                className="flex items-center gap-2 hover:text-yellow-300 transition-all duration-200"
              >
                <Phone size={16} className="opacity-90" />
                <span className="hidden sm:inline font-medium">
                  Phone: 8447795337
                </span>
              </a>

              <a
                href="mailto:info@nielit.gov.in"
                className="flex items-center gap-2 hover:text-yellow-300 transition-all duration-200"
              >
                <Mail size={16} className="opacity-90" />
                <span className="hidden sm:inline font-medium">
                  delhi.training@nielit.gov.in
                </span>
              </a>

              <a
                href="https://nielit.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-yellow-300 transition-all duration-200"
              >
                <Globe size={16} className="opacity-90" />
                <span className="hidden sm:inline font-medium">
                  www.nielit.gov.in
                </span>
              </a>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin size={16} className="opacity-90" />
              <span className="hidden md:inline font-medium">
                Ministry of Electronics & IT, Govt. of India
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          
          {/* Logo + Title */}
          <div className="flex items-center space-x-5">
            <div className="bg-white rounded-xl p-3 shadow-xl ring-2 ring-white/20 hover:scale-105 transition-transform duration-300">
              <img
                src="/favicon.ico"
                alt="NIELIT Logo"
                width={70}
                height={70}
                className="h-16 w-auto"
              />
            </div>

            <div className="leading-tight">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide drop-shadow-md">
                National Institute of Electronics
              </h1>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-wide drop-shadow-md">
                & Information Technology
              </h2>
              <p className="text-sm text-white/90 mt-2 font-medium italic">
                Student Lifecycle Management System
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden lg:flex gap-6">
            {[
              { value: "56+", label: "Centers" },
              { value: "50L+", label: "Students" },
              { value: "100+", label: "Courses" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 border border-white/20 text-center shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-xs text-white/90 tracking-wide font-medium">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-indigo-900 border-t border-white/20 shadow-inner">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center justify-center gap-10 text-sm">
            
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="font-medium">Autonomous Scientific Society</span>
            </div>

            <div className="hidden md:block w-px h-5 bg-white/30"></div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              <span className="font-medium">Under MeitY, Govt. of India</span>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}