import { Link } from "react-router-dom";
import { Moon, Sun, Monitor, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLogoutMutation } from "../../hooks/useAuthMutations";
import { useAuthMeQuery } from "../../hooks/useAuthMe";
import MainLogo from "../../assets/images/atsLogo.webp";

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

const Navbar = () => {
  const { user, hasRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const logoutMutation = useLogoutMutation();
  const showCompany = hasRole("hr_manager", "recruiter");
  const { data: me } = useAuthMeQuery();

  const cycleTheme = () => {
    const order = ["light", "dark", "system"];
    setTheme(order[(order.indexOf(theme) + 1) % order.length]);
  };
  const Icon = THEME_ICONS[theme];

  return (
    <header className="border-b border-gray-200 dark:border-dark-box-outline">
      <nav className="p-4 flex items-center justify-between" aria-label="Top navigation">
        <Link to="/">
          <img src={MainLogo} alt="logo" className="w-36 mx-auto" />
        </Link>

        <div className="flex items-center gap-4">
          {user && showCompany && (
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-sm font-semibold">{user.fullname}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {me?.company?.company_name ?? "N/A"}
              </p>
            </div>
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
