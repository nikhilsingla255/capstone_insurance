import { useAuth } from "../providers/AuthProvider";


const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="bg-white shadow p-4 flex justify-between">
      <div>Welcome, {user?.name || "Guest"}</div>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Topbar;