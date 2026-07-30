import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Trash2, UserMinus } from "lucide-react";
import { useCompanyQuery } from "../../hooks/useCompanies";
import { useDeleteDepartmentMutation } from "../../hooks/useDepartments";
import { useUnassignCompanyUserMutation } from "../../hooks/useCompanies";
import CustomLoader from "../../components/common/CustomLoader";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import CompanyFormModal from "../../components/companies/CompanyFormModal";
import DepartmentFormModal from "../../components/companies/DepartmentFormModal";
import AssignStaffModal from "../../components/companies/AssignStaffModal";
import { buildStorageUrl } from "../../utils/buildStorageUrl";

const CompanyDetailPage = () => {
  const { companyId } = useParams();
  const { data: company, isLoading } = useCompanyQuery(companyId);

  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [deptModal, setDeptModal] = useState(null); // null | { department: null|{...} }
  const [confirmDeleteDept, setConfirmDeleteDept] = useState(null);
  const [isAssignStaffOpen, setIsAssignStaffOpen] = useState(false);
  const [confirmUnassign, setConfirmUnassign] = useState(null);

  const deleteDeptMutation = useDeleteDepartmentMutation(companyId);
  const unassignMutation = useUnassignCompanyUserMutation();

  if (isLoading) return <CustomLoader label="Loading company" />;
  if (!company) return <EmptyState title="Company not found" />;

  return (
    <section>
      <Link
        to="/companies"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-blue my-4"
      >
        <ArrowLeft size={14} /> Back to Companies
      </Link>

      <header className="flex items-start justify-between flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-4">
          {company.logo ? (
            <img
              src={buildStorageUrl(company.logo)}
              alt={`${company.company_name} logo`}
              className="w-50 rounded-lg object-fill"
            />
          ) : null}
          <div>
            <h1 className="text-2xl font-bold">{company.company_name}</h1>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-blue hover:underline"
              >
                {company.website}
              </a>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditCompanyOpen(true)}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-box-outline hover:bg-gray-50 dark:hover:bg-dark-hover flex items-center gap-2 cursor-pointer"
        >
          <Pencil size={14} /> Edit Company
        </button>
      </header>

      {company.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">{company.description}</p>
      )}

      {/* Departments */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Departments</h2>
          <button
            type="button"
            onClick={() => setDeptModal({ department: null })}
            className="text-sm text-primary-blue hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} /> Add Department
          </button>
        </div>

        {company.departments?.length ? (
          <ul className="flex flex-wrap gap-2">
            {company.departments.map((dept) => (
              <li
                key={dept.id}
                className="flex items-center gap-2 border border-gray-200 dark:border-dark-box-outline rounded-full pl-3 pr-1 py-1 text-sm"
              >
                {dept.name}
                <button
                  type="button"
                  onClick={() => setDeptModal({ department: dept })}
                  aria-label={`Edit ${dept.name}`}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover cursor-pointer"
                >
                  <Pencil size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteDept(dept)}
                  aria-label={`Delete ${dept.name}`}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover text-error-red cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No departments yet" />
        )}
      </section>

      {/* Staff */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Assigned staff</h2>
          <button
            type="button"
            onClick={() => setIsAssignStaffOpen(true)}
            className="text-sm text-primary-blue hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} /> Assign staff
          </button>
        </div>

        {company.users?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-dark-box-outline">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Designation</th>
                  <th className="py-2 pr-4 font-medium">Joined</th>
                  <th className="py-2 pr-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {company.users.map((staffUser) => (
                  <tr key={staffUser.id} className="border-b border-gray-100 dark:border-dark-box-outline/50">
                    <td className="py-3 pr-4">{staffUser.fullname}</td>
                    <td className="py-3 pr-4">{staffUser.role}</td>
                    <td className="py-3 pr-4">{staffUser.designation || "—"}</td>
                    <td className="py-3 pr-4">{staffUser.joined_at || "—"}</td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        type="button"
                        onClick={() => setConfirmUnassign(staffUser)}
                        aria-label={`Unassign ${staffUser.fullname}`}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-error-red cursor-pointer"
                      >
                        <UserMinus size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No staff assigned yet" />
        )}
      </section>

      <CompanyFormModal isOpen={isEditCompanyOpen} onClose={() => setIsEditCompanyOpen(false)} company={company} />

      {deptModal && (
        <DepartmentFormModal
          isOpen
          onClose={() => setDeptModal(null)}
          companyId={companyId}
          department={deptModal.department}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteDept}
        onClose={() => setConfirmDeleteDept(null)}
        onConfirm={async () => {
          if (!confirmDeleteDept) return;
          await deleteDeptMutation.mutateAsync(confirmDeleteDept.id);
          setConfirmDeleteDept(null);
        }}
        isPending={deleteDeptMutation.isPending}
        isDangerous
        title="Remove department?"
        message={`"${confirmDeleteDept?.name}" will be permanently removed.`}
        confirmLabel="Remove"
      />

      <AssignStaffModal
        isOpen={isAssignStaffOpen}
        onClose={() => setIsAssignStaffOpen(false)}
        companyId={companyId}
        alreadyAssignedIds={(company.users ?? []).map((u) => u.id)}
      />

      <ConfirmDialog
        isOpen={!!confirmUnassign}
        onClose={() => setConfirmUnassign(null)}
        onConfirm={async () => {
          if (!confirmUnassign) return;
          await unassignMutation.mutateAsync({ companyId, userId: confirmUnassign.id });
          setConfirmUnassign(null);
        }}
        isPending={unassignMutation.isPending}
        isDangerous
        title="Unassign staff member?"
        message={`${confirmUnassign?.fullname} will be removed from this company.`}
        confirmLabel="Unassign"
      />
    </section>
  );
};

export default CompanyDetailPage;
