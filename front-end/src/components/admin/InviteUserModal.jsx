import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import { InviteUserValidationSchema, InviteUserInitialValues } from "../../validations/InviteUserValidationSchema";
import { useInviteUserMutation } from "../../hooks/useAdminUsers";

const InviteUserModal = ({ isOpen, onClose }) => {
  const inviteMutation = useInviteUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(InviteUserValidationSchema),
    defaultValues: InviteUserInitialValues,
  });

  const onSubmit = async (values) => {
    const payload = values.phone ? values : { ...values, phone: undefined };
    await inviteMutation.mutateAsync(payload);
    reset(InviteUserInitialValues);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite staff member">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Invite user form</legend>

          <div>
            <label htmlFor="invite-fullname" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="invite-fullname"
              type="text"
              autoComplete="off"
              aria-invalid={!!errors.fullname}
              className="inputbox mt-1"
              {...register("fullname")}
            />
            <FormError message={errors.fullname?.message} />
          </div>

          <div>
            <label htmlFor="invite-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              autoComplete="off"
              aria-invalid={!!errors.email}
              className="inputbox mt-1"
              {...register("email")}
            />
            <FormError message={errors.email?.message} />
          </div>

          <div>
            <label htmlFor="invite-role" className="text-sm font-medium">
              Role
            </label>
            <select
              id="invite-role"
              aria-invalid={!!errors.role}
              className="inputbox mt-1"
              {...register("role")}
            >
              <option value="recruiter">Recruiter</option>
              <option value="hr_manager">HR Manager</option>
            </select>
            <FormError message={errors.role?.message} />
          </div>

          <div>
            <label htmlFor="invite-phone" className="text-sm font-medium">
              Phone <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="invite-phone"
              type="tel"
              autoComplete="off"
              aria-invalid={!!errors.phone}
              className="inputbox mt-1"
              {...register("phone")}
            />
            <FormError message={errors.phone?.message} />
          </div>

          <button
            type="submit"
            disabled={inviteMutation.isPending}
            className="auth-btn flex items-center justify-center gap-2"
          >
            {inviteMutation.isPending && <Spinner size={16} />}
            Send invite
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};

export default InviteUserModal;
