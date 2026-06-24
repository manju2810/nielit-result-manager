import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {
      // ignore network errors on logout
    }
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-ink-900 border-b-2 border-gold px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="font-display font-semibold text-white tracking-tight text-[15px]">
          NIELIT <span className="text-gold">Result Manager</span>
        </span>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm text-slate-200 hover:text-gold transition-colors">
            Upload
          </Link>
          <Link to="/master" className="text-sm text-slate-200 hover:text-gold transition-colors">
            Master Data
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="text-sm text-slate-200 hover:text-gold transition-colors">
              Admin
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-5">
        <span className="text-sm text-slate-300 font-mono">
          {user?.name} <span className="text-slate-500">·</span> {user?.role}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-200 hover:text-white border border-slate-600 hover:border-gold rounded-md px-3 py-1.5 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;