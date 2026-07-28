import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { NAV_ITEMS } from "../../config/navConfig";

const SideNav = () => {
  const { hasRole } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || hasRole(...item.roles)
  );

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 dark:border-dark-box-outline min-h-[calc(100vh-57px)] hidden md:block">
      <nav aria-label="Sidebar navigation" className="flex flex-col gap-1 p-4">
        {visibleItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-primary-blue text-white"
                  : "hover:bg-gray-100 dark:hover:bg-dark-hover"
              }`
            }
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default SideNav;
