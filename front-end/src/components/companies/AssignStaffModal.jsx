import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useMemo } from "react";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import { useAdminUsersQuery } from "../../hooks/useAdminUsers";
import { useAssignCompanyUserMutation } from "../../hooks/useCompanies";
import { USER_STATUS } from "../../constants/userStatus";

const AssignStaffValidationSchema = Yup.object({
  user_id: Yup.number().typeError("Pick a staff member").required("Pick a staff member"),
  designation: Yup.string().max(100).required("Designation is required"),
  joined_at: Yup.string().nullable(),
});

const AssignStaffModal = ({ isOpen, onClose, companyId, alreadyAssignedIds = [] }) => {
  const assignMutation = useAssignCompanyUserMutation();
  const { data: usersData, isLoading } = useAdminUsersQuery({
    status: USER_STATUS.ACTIVE,
  });

  const eligibleUsers = useMemo(() => {
    const users = usersData?.data ?? [];
    return users.filter(
      (u) => ["hr_manager", "recruiter"].includes(u.role) && !alreadyAssignedIds.includes(u.id)
    );
  }, [usersData, alreadyAssignedIds]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(AssignStaffValidationSchema),
    defaultValues: { user_id: "", designation: "", joined_at: "" },
  });

  const onSubmit = async (values) => {
    await assignMutation.mutateAsync({ companyId, payload: values });
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign staff to company">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Assign staff form</legend>

          <div>
            <label htmlFor="user_id" className="text-sm font-medium">
              Staff member
            </label>
            <select
              id="user_id"
              aria-invalid={!!errors.user_id}
              className="inputbox mt-1"
              disabled={isLoading}
              {...register("user_id")}
            >
              <option value="">{isLoading ? "Loading..." : "Select a staff member"}</option>
              {eligibleUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullname} ({u.role === "hr_manager" ? "HR Manager" : "Recruiter"})
                </option>
              ))}
            </select>
            <FormError message={errors.user_id?.message} />
          </div>

          <div>
            <label htmlFor="designation" className="text-sm font-medium">
              Designation
            </label>
            <input
              id="designation"
              type="text"
              placeholder="e.g. Senior Recruiter"
              aria-invalid={!!errors.designation}
              className="inputbox mt-1"
              {...register("designation")}
            />
            <FormError message={errors.designation?.message} />
          </div>

          <div>
            <label htmlFor="joined_at" className="text-sm font-medium">
              Joined date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="joined_at"
              type="date"
              aria-invalid={!!errors.joined_at}
              className="inputbox mt-1"
              {...register("joined_at")}
            />
            <FormError message={errors.joined_at?.message} />
          </div>

          <button
            type="submit"
            disabled={assignMutation.isPending}
            className="auth-btn flex items-center justify-center gap-2"
          >
            {assignMutation.isPending && <Spinner size={16} />}
            Assign
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};

export default AssignStaffModal;
