import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getLinkClasses = (path) => {
    const baseClasses = "py-3 px-4 rounded-lg font-medium transition duration-200 flex items-center gap-3 mb-1";
    const activeClasses = isActive(path)
      ? "bg-blue-500 text-white shadow-md"
      : "text-gray-700 hover:bg-gray-100";
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">🛡️</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Insurance</h2>
            <p className="text-xs text-gray-500">Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="mx-4 mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Logged in as</p>
        <p className="text-sm font-bold text-gray-900 truncate mt-1">{user?.username}</p>
        <p className="text-xs text-blue-600 mt-2 capitalize font-medium">{user?.role?.replace(/_/g, " ")}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {/* Core Navigation */}
        <div>
          <p className="text-xs uppercase font-bold text-gray-500 mb-3 px-2">Core</p>
          <Link to="/dashboard" className={getLinkClasses("/dashboard")}>
            <span className="text-lg">📊</span>
            <span>Dashboard</span>
          </Link>
          
          <Link to="/audit-logs" className={getLinkClasses("/audit-logs")}>
            <span className="text-lg">📋</span>
            <span>Audit Logs</span>
          </Link>
        </div>

        {/* Policy Module */}
        {(user?.role === "UNDERWRITER" || user?.role === "ADMIN") && (
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 mb-3 px-2">Policy Management</p>
            <Link to="/policies" className={getLinkClasses("/policies")}>
              <span className="text-lg">📋</span>
              <span>Policies</span>
            </Link>
          </div>
        )}

        {/* Claims Module */}
        {(user?.role === "CLAIMS_ADJUSTER" || user?.role === "ADMIN") && (
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 mb-3 px-2">Claims</p>
            <Link to="/claims" className={getLinkClasses("/claims")}>
              <span className="text-lg">🔧</span>
              <span>Claims</span>
            </Link>
          </div>
        )}

        {/* Reinsurance Module */}
        {(user?.role === "REINSURANCE_ANALYST" || user?.role === "ADMIN") && (
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 mb-3 px-2">Reinsurance</p>
            <div className="space-y-1">
              <Link to="/reinsurance/treaties" className={getLinkClasses("/reinsurance/treaties")}>
                <span className="text-lg">📑</span>
                <span>Treaties</span>
              </Link>
              <Link to="/reinsurance/reinsurers" className={getLinkClasses("/reinsurance/reinsurers")}>
                <span className="text-lg">🏛️</span>
                <span>Reinsurers</span>
              </Link>
            </div>
          </div>
        )}

        {/* Admin Module */}
        {user?.role === "ADMIN" && (
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 mb-3 px-2">Administration</p>
            <Link to="/admin/users" className={getLinkClasses("/admin/users")}>
              <span className="text-lg">👥</span>
              <span>User Management</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          © 2026 Insurance System
        </p>
      </div>
    </div>
  );
};

export default Sidebar;