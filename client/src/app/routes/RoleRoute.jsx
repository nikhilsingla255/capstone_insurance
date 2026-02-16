import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const RoleRoute = ({ roles, children }) => {
  const { user } = useAuth();
  return roles.includes(user?.role)
    ? children
    : <Navigate to="/unauthorized" />;
};

export default RoleRoute;