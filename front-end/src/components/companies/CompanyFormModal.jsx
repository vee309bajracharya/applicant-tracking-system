import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import { CompanyValidationSchema, CompanyInitialValues } from "../../validations/CompanyValidationSchema";
import { useCreateCompanyMutation, useUpdateCompanyMutation } from "../../hooks/useCompanies";

const CompanyFormModal = ({ isOpen, onClose, company = null }) => {
  const isEditMode = !!company;
  const createMutation = useCreateCompanyMutation();
  const updateMutation = useUpdateCompanyMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CompanyValidationSchema),
    defaultValues: CompanyInitialValues,
  });

  useEffect(() => {
    if (isOpen) {
      if (company) {
        reset({
          company_name: company.company_name || "",
          website: company.website || "",
          email: company.email || "",
          phone: company.phone || "",
          description: company.description || "",
          logo: null, // Reset logo file input on open
        });
      } else {
        reset(CompanyInitialValues);
      }
    }
  }, [isOpen, company, reset]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        company_name: values.company_name.trim(),
        website: values.website ? values.website.trim() : null,
        email: values.email ? values.email.trim() : null,
        phone: values.phone ? values.phone.trim() : null,
        description: values.description ? values.description.trim() : null,
        // Only pass logo if a File was chosen
        logo: values.logo instanceof File ? values.logo : null,
      };

      if (isEditMode) {
        await updateMutation.mutateAsync({ companyId: company.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error("Company submit error:", error?.response?.data || error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Company" : "New Company"}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Company form</legend>
          <div>
            <label htmlFor="company_name" className="text-sm font-medium">
              Company name *
            </label>
            <input
              id="company_name"
              type="text"
              autoComplete="off"
              aria-invalid={!!errors.company_name}
              className="inputbox mt-1"
              {...register("company_name")}
            />
            <FormError message={errors.company_name?.message} />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="inputbox mt-1"
              {...register("email")}
            />
            <FormError message={errors.email?.message} />
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-medium">
              Phone
            </label>
            <input
              id="phone"
              type="text"
              className="inputbox mt-1"
              {...register("phone")}
            />
            <FormError message={errors.phone?.message} />
          </div>

          <div>
            <label htmlFor="website" className="text-sm font-medium">
              Website
            </label>
            <input
              id="website"
              type="url"
              className="inputbox mt-1"
              placeholder="https://example.com"
              {...register("website")}
            />
            <FormError message={errors.website?.message} />
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="inputbox mt-1"
              {...register("description")}
            />
            <FormError message={errors.description?.message} />
          </div>

          <div>
            <label htmlFor="logo" className="text-sm font-medium">
              Logo {isEditMode && <span className="text-xs text-gray-400">(Leave empty to keep current)</span>}
            </label>
            <input
              id="logo"
              type="file"
              accept="image/*"
              className="inputbox mt-1 p-1"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setValue("logo", file, { shouldValidate: true });
              }}
            />
            <FormError message={errors.logo?.message} />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="auth-btn flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isPending && <Spinner size={16} />}
            {isEditMode ? "Save changes" : "Create Company"}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};

export default CompanyFormModal;