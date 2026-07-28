import { LayoutDashboard, Users, Building2 } from "lucide-react";
import { ROLES } from "../constants/roles";

export const NAV_ITEMS = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, roles: null },
  { label: "Users", to: "/admin/users", icon: Users, roles: [ROLES.ADMIN] },
  { label: "Companies", to: "/companies", icon: Building2, roles: [ROLES.ADMIN] },
];
