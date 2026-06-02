
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Award,
  Users,
  BookOpen,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About NIELIT */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/favicon.ico"
                alt="NIELIT Logo"
                width={60}
                height={60}
                className="h-14 w-auto bg-white rounded-lg p-2"
              />
            </div>
            <h3 className="text-lg font-bold mb-3">About NIELIT</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              National Institute of Electronics & Information Technology is an
              autonomous scientific society under the Ministry of Electronics &
              Information Technology (MeitY), Government of India.
            </p>
            {/* <div className="flex items-center gap-2 text-sm text-gray-300">
              <Award size={16} className="text-yellow-400" />
              <span>ISO 9001:2015 Certified</span>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-400" />
              Quick Links
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a
                  href="https://nielit.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Official Website
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Phone size={20} className="text-green-400" />
              Contact Us
            </h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="text-red-400 flex-shrink-0 mt-0.5"
                />
                <span>
                  North Campus -Inderlok 2 nd Floor, Parsvnath Metro Mall, Near
                  Inderlok Metro Station, Inderlok, Delhi- 110052
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-green-400 flex-shrink-0" />
                <p className="hover:text-blue-400 transition-colors">
                  Phone No.- 8447795337
                </p>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-yellow-400 flex-shrink-0" />
                <a
                  href="delhi.training@nielit.gov.in"
                  className="hover:text-blue-400 transition-colors"
                >
                  delhi.training@nielit.gov.in
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Globe size={18} className="text-blue-400 flex-shrink-0" />
                <a
                  href="https://nielit.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  www.nielit.gov.in
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={18} className="text-purple-400 flex-shrink-0" />
                <span>Mon - Fri: 9:00 AM - 5:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Stats & Social */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users size={20} className="text-purple-400" />
              Our Reach
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">56+</div>
                <div className="text-xs text-blue-100">Centers</div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">50L+</div>
                <div className="text-xs text-green-100">Students</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">100+</div>
                <div className="text-xs text-purple-100">Courses</div>
              </div>
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">35+</div>
                <div className="text-xs text-orange-100">Years</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span>
                &copy; {new Date().getFullYear()} NIELIT. All rights reserved.
              </span>
              <span className="hidden md:inline">|</span>
              <span>An Autonomous Scientific Society under MeitY</span>
              <span className="hidden md:inline">|</span>
              <span>Government of India</span>
            </div>
            {/* <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div> */}
          </div>
        </div>
      </div>

      {/* Decorative Bottom Accent */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
    </footer>
  );
}
