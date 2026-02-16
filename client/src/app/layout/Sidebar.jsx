import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div className="w-64 bg-white shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Insurance System</h2>

      <nav className="flex flex-col gap-4">
        <Link to="/dashboard" className="py-2 px-3 rounded hover:bg-blue-100">
          📊 Dashboard
        </Link>

        {(user?.role === "UNDERWRITER" || user?.role === "ADMIN") && (
          <Link to="/policies" className="py-2 px-3 rounded hover:bg-blue-100">
            📋 Policies
          </Link>
        )}

        {(user?.role === "CLAIMS_ADJUSTER" || user?.role === "ADMIN") && (
          <Link to="/claims" className="py-2 px-3 rounded hover:bg-blue-100">
            🔧 Claims
          </Link>
        )}

        {(user?.role === "REINSURANCE_ANALYST" || user?.role === "ADMIN") && (
          <div className="space-y-2">
            <Link to="/reinsurance/treaties" className="py-2 px-3 rounded hover:bg-blue-100 block">
              📑 Treaties
            </Link>
            <Link to="/reinsurance/reinsurers" className="py-2 px-3 rounded hover:bg-blue-100 block">
              🏛️ Reinsurers
            </Link>
          </div>
        )}

        {user?.role === "ADMIN" && (
          <div className="space-y-2">
            <Link to="/admin/users" className="py-2 px-3 rounded hover:bg-blue-100 block">
              👥 User Management
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;