import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CustomLoader from "./CustomLoader";

const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, isBootstrapping, hasRole } = useAuth();

  if (isBootstrapping) return <CustomLoader label="Checking session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length && !hasRole(...allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
