import { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { UserPlus, Ban, CheckCircle2, Trash2 } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";
import {
  useAdminUsersQuery,
  useSuspendUserMutation,
  useActivateUserMutation,
  useDeleteUserMutation,
} from "../../hooks/useAdminUsers";
import { ROLES, ROLE_LABELS } from "../../constants/roles";
import { USER_STATUS, USER_STATUS_LABELS, USER_STATUS_BADGE_CLASSES } from "../../constants/userStatus";
import SearchBar from "../../components/ui/SearchBar";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import UserTableSkeleton from "../../components/admin/UserTableSkeleton";
import InviteUserModal from "../../components/admin/InviteUserModal";

const STAFF_ROLE_OPTIONS = [ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.RECRUITER];

const UserManagementPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(
    () => ({
      page,
      search: debouncedSearch || undefined,
      status: status || undefined,
      role: role || undefined,
    }),
    [page, debouncedSearch, status, role]
  );

  const { data, isLoading, isError, error } = useAdminUsersQuery(queryParams);
  const suspendMutation = useSuspendUserMutation();
  const activateMutation = useActivateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  const users = data?.data ?? [];
  const meta = data?.meta;

  const resetFiltersAndSearch = useCallback((setter) => (value) => {
    setPage(1);
    setter(value);
  }, []);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    if (type === "suspend") await suspendMutation.mutateAsync(user.id);
    if (type === "activate") await activateMutation.mutateAsync(user.id);
    if (type === "delete") await deleteMutation.mutateAsync(user.id);
    setConfirmAction(null);
  };

  const isConfirmPending =
    suspendMutation.isPending || activateMutation.isPending || deleteMutation.isPending;

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Failed to load users.");
    }
  }, [isError, error]);

  return (
    <section>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Admin, HR Manager, and Recruiter accounts
          </p>
        </div>
      </header>

      <section className="flex justify-between gap-3 mb-4">
        <div className="flex justify-between gap-2">

          <select
            value={status}
            onChange={(e) => resetFiltersAndSearch(setStatus)(e.target.value)}
            aria-label="Filter by status"
            className="inputbox w-20"
          >
            <option value="">Status</option>
            {Object.values(USER_STATUS).map((s) => (
              <option key={s} value={s}>
                {USER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <select
            value={role}
            onChange={(e) => resetFiltersAndSearch(setRole)(e.target.value)}
            aria-label="Filter by role"
            className="inputbox w-20"
          >
            <option value="">Roles</option>
            {STAFF_ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="auth-btn px-4 flex items-center gap-2"
          >
            <UserPlus size={16} /> Invite staff
          </button>
        </div>
        <div className="w-80">
          <SearchBar
            value={search}
            onChange={resetFiltersAndSearch(setSearch)}
            placeholder="Search by Name and Email"
          />
        </div>
      </section>

      {isLoading ? (
        <UserTableSkeleton />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try a different search or filter, or invite someone new."
        />
      ) : (
        <div className="overflow-x-auto shadow-lg p-4 rounded-md">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-dark-box-outline">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-dark-box-outline/50">
                  <td className="py-3 pr-4">{user.fullname}</td>
                  <td className="py-3 pr-4">{user.email}</td>
                  <td className="py-3 pr-4">{ROLE_LABELS[user.role] || user.role}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge
                      status={user.status}
                      labels={USER_STATUS_LABELS}
                      classes={USER_STATUS_BADGE_CLASSES}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex justify-end gap-2">
                      {user.role !== ROLES.ADMIN && user.status !== USER_STATUS.SUSPENDED && (
                        <button
                          type="button"
                          onClick={() => setConfirmAction({ type: "suspend", user })}
                          aria-label={`Suspend ${user.fullname}`}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-warning-orange cursor-pointer"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                      {user.status === USER_STATUS.SUSPENDED && (
                        <button
                          type="button"
                          onClick={() => setConfirmAction({ type: "activate", user })}
                          aria-label={`Activate ${user.fullname}`}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-success-green cursor-pointer"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      {user.role !== ROLES.ADMIN && (
                        <button
                          type="button"
                          onClick={() => setConfirmAction({ type: "delete", user })}
                          aria-label={`Remove ${user.fullname}`}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-error-red cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      <InviteUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        isPending={isConfirmPending}
        isDangerous={confirmAction?.type !== "activate"}
        title={
          confirmAction?.type === "suspend"
            ? "Suspend user?"
            : confirmAction?.type === "activate"
              ? "Activate user?"
              : "Remove user?"
        }
        message={
          confirmAction?.type === "delete"
            ? `${confirmAction?.user?.fullname} will be soft-deleted and can be restored later from the database if needed.`
            : `This will change ${confirmAction?.user?.fullname}'s account status immediately.`
        }
        confirmLabel={
          confirmAction?.type === "suspend"
            ? "Suspend"
            : confirmAction?.type === "activate"
              ? "Activate"
              : "Remove"
        }
      />
    </section>
  );
};

export default UserManagementPage;
