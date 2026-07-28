import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import { DepartmentValidationSchema, DepartmentInitialValues } from "../../validations/DepartmentValidationSchema";
import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from "../../hooks/useDepartments";

const DepartmentFormModal = ({ isOpen, onClose, companyId, department = null }) => {
  const isEditMode = !!department;
  const createMutation = useCreateDepartmentMutation(companyId);
  const updateMutation = useUpdateDepartmentMutation(companyId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(DepartmentValidationSchema),
    defaultValues: DepartmentInitialValues,
  });

  useEffect(() => {
    if (isOpen) {
      reset(department ? { name: department.name } : DepartmentInitialValues);
    }
  }, [isOpen, department, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEditMode) {
        if (!department?.id) {
          console.error("Department ID is missing!");
          return;
        }
        await updateMutation.mutateAsync({
          departmentId: department.id,
          payload: { name: values.name.trim() },
        });
      } else {
        await createMutation.mutateAsync({
          company_id: Number(companyId),
          name: values.name.trim(),
        });
      }
      onClose();
    } catch (error) {
      console.error("Department Submit Error:", error?.response?.data || error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Department" : "New Department"}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Department form</legend>
          <div>
            <label htmlFor="dept-name" className="text-sm font-medium">
              Department name *
            </label>
            <input
              id="dept-name"
              type="text"
              autoComplete="off"
              aria-invalid={!!errors.name}
              className="inputbox mt-1"
              {...register("name")}
            />
            <FormError message={errors.name?.message} />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="auth-btn flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isPending && <Spinner size={16} />}
            {isEditMode ? "Save changes" : "Create department"}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};

export default DepartmentFormModal;