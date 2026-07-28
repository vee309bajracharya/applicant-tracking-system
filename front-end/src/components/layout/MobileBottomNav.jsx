import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { NAV_ITEMS } from "../../config/navConfig";

const MobileBottomNav = () => {
  const { hasRole } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || hasRole(...item.roles));

  return (
    <nav
      aria-label="Bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-overlay border-t border-gray-200 dark:border-dark-box-outline flex justify-around py-2 z-40"
    >
      {visibleItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
              isActive ? "text-primary-blue" : "text-gray-500 dark:text-gray-400"
            }`
          }
        >
          <Icon size={18} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
