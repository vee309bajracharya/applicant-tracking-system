import { LayoutDashboard, Users, Building2, Briefcase, UserCircle, ClipboardList, ListChecks, Tags } from "lucide-react";
import { ROLES } from "../constants/roles";

export const NAV_ITEMS = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, roles: null },
  { label: "Companies", to: "/companies", icon: Building2, roles: [ROLES.ADMIN] },
  { label: "Users", to: "/admin/users", icon: Users, roles: [ROLES.ADMIN] },
  { label: "Jobs", to: "/jobs", icon: Briefcase, roles: null },
  { label: "My Profile", to: "/candidate/profile", icon: UserCircle, roles: [ROLES.CANDIDATE] },
  { label: "My Applications", to: "/candidate/applications", icon: ClipboardList, roles: [ROLES.CANDIDATE] },
  {
    label: "Applications",
    to: "/applications",
    icon: ListChecks,
    roles: [ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.RECRUITER],
  },
  { label: "Add Job Skills", to: "/admin/skills", icon: Tags, roles: [ROLES.ADMIN] },
];
