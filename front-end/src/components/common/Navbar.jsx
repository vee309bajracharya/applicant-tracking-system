import { Link } from "react-router-dom";
import { Moon, Sun, Monitor, LogOut, Users } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLogoutMutation } from "../../hooks/useAuthMutations";
import { ROLES } from "../../constants/roles";
import MainLogo from "../../assets/images/atsLogo.webp";

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

const Navbar = () => {
  const { user, hasRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const logoutMutation = useLogoutMutation();
  const cycleTheme = () => {
    const order = ["light", "dark", "system"];
    setTheme(order[(order.indexOf(theme) + 1) % order.length]);
  };
  const Icon = THEME_ICONS[theme];

  return (
    <header className="border-b border-gray-200 dark:border-dark-box-outline">
      <nav className="wrapper flex items-center justify-between" aria-label="Main navigation">
        <Link to="/">
          <img src={MainLogo} alt="logo" className="w-36 mx-auto" />
        </Link>

        <div className="flex items-center gap-4">
          {hasRole(ROLES.ADMIN) && (
            <Link
              to="/admin/users"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover flex items-center gap-1 text-sm"
              aria-label="User management"
            >
              <Users size={16} /> Users
            </Link>
          )}

          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`Switch theme, current: ${theme}`}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover cursor-pointer"
          >
            <Icon size={18} />
          </button>

          {user && (
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              aria-label="Log out"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover cursor-pointer flex items-center gap-1 text-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
