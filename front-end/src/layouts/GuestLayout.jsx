import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CustomLoader from "../components/common/CustomLoader";

const AUTH_EXEMPT_PATHS = ["/set-password"];

/** For login/register/forgot-password — redirects away if already authed. */
const GuestLayout = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { pathname } = useLocation();
  const isExempt = AUTH_EXEMPT_PATHS.includes(pathname);

  if (isBootstrapping) return <CustomLoader label="Loading..." />;
  if (isAuthenticated && !isExempt) return <Navigate to="/" replace />;

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-overlay px-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </section>
  );
};

export default GuestLayout;
