import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import { JobValidationSchema, JobInitialValues } from "../../validations/JobValidationSchema";
import { useCreateJobMutation, useUpdateJobMutation } from "../../hooks/useJobs";
import { useCompaniesQuery } from "../../hooks/useCompanies";
import { useDepartmentsQuery } from "../../hooks/useDepartments";
import { useSkillsQuery } from "../../hooks/useSkills";
import { EMPLOYMENT_TYPE_LABELS, EMPLOYMENT_TYPES } from "../../constants/employmentTypes";

const JobFormModal = ({ isOpen, onClose, job = null }) => {
  const isEditMode = !!job;
  const createMutation = useCreateJobMutation();
  const updateMutation = useUpdateJobMutation();
  const { data: companiesData } = useCompaniesQuery({ page: 1 }, { enabled: isOpen });
  const { data: skillsData } = useSkillsQuery({ page: 1 }, { enabled: isOpen });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(JobValidationSchema),
    defaultValues: JobInitialValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "skills" });
  const companyId = watch("company_id");
  const { data: departmentsData } = useDepartmentsQuery(companyId, { page: 1 });

  useEffect(() => {
    if (!isOpen) return;
    if (job) {
      reset({
        company_id: job.company_id || "",
        department_id: job.department_id || "",
        title: job.title || "",
        employment_type: job.employment_type || EMPLOYMENT_TYPES.FULL_TIME,
        location: job.location || "",
        experience_required: job.experience_required ?? "",
        salary_min: job.salary_min ?? "",
        salary_max: job.salary_max ?? "",
        description: job.description || "",
        deadline: job.deadline ? job.deadline.slice(0, 10) : "",
        status: job.status || "draft",
        skills: (job.skills || []).map((s) => ({ skill_id: s.skill_id, importance: s.importance || "required" })),
      });
    } else {
      reset(JobInitialValues);
    }
  }, [isOpen, job, reset]);

  const companies = companiesData?.data ?? [];
  const departments = departmentsData?.data ?? [];
  const skills = useMemo(() => skillsData?.data ?? [], [skillsData]);

  const onSubmit = async (values) => {
    try {
      const payload = isEditMode
        ? {
            department_id: Number(values.department_id),
            title: values.title.trim(),
            employment_type: values.employment_type,
            location: values.location.trim(),
            experience_required: values.experience_required === "" ? null : Number(values.experience_required),
            salary_min: values.salary_min === "" ? null : Number(values.salary_min),
            salary_max: values.salary_max === "" ? null : Number(values.salary_max),
            description: values.description.trim(),
            deadline: values.deadline || null,
            status: values.status,
            skills: values.skills,
          }
        : {
            company_id: Number(values.company_id),
            department_id: Number(values.department_id),
            title: values.title.trim(),
            employment_type: values.employment_type,
            location: values.location.trim(),
            experience_required: values.experience_required === "" ? null : Number(values.experience_required),
            salary_min: values.salary_min === "" ? null : Number(values.salary_min),
            salary_max: values.salary_max === "" ? null : Number(values.salary_max),
            description: values.description.trim(),
            deadline: values.deadline || null,
            skills: values.skills,
          };

      if (isEditMode) {
        await updateMutation.mutateAsync({ jobId: job.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error("Job submit error:", error?.response?.data || error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit job" : "New job requisition"}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Job requisition form</legend>

          {!isEditMode && (
            <div>
              <label htmlFor="company_id" className="text-sm font-medium">
                Company *
              </label>
              <select id="company_id" className="inputbox mt-1" {...register("company_id")}>
                <option value="">Select a company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
              <FormError message={errors.company_id?.message} />
            </div>
          )}

          <div>
            <label htmlFor="department_id" className="text-sm font-medium">
              Department *
            </label>
            <select
              id="department_id"
              className="inputbox mt-1"
              disabled={!isEditMode && !companyId}
              {...register("department_id")}
            >
              <option value="">Select a department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <FormError message={errors.department_id?.message} />
          </div>

          <div>
            <label htmlFor="title" className="text-sm font-medium">
              Job title *
            </label>
            <input id="title" type="text" autoComplete="off" className="inputbox mt-1" {...register("title")} />
            <FormError message={errors.title?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="employment_type" className="text-sm font-medium">
                Employment type *
              </label>
              <select id="employment_type" className="inputbox mt-1" {...register("employment_type")}>
                {Object.values(EMPLOYMENT_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {EMPLOYMENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <FormError message={errors.employment_type?.message} />
            </div>

            <div>
              <label htmlFor="location" className="text-sm font-medium">
                Location *
              </label>
              <input id="location" type="text" className="inputbox mt-1" {...register("location")} />
              <FormError message={errors.location?.message} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="experience_required" className="text-sm font-medium">
                Experience (yrs)
              </label>
              <input
                id="experience_required"
                type="number"
                step="0.1"
                className="inputbox mt-1"
                {...register("experience_required")}
              />
              <FormError message={errors.experience_required?.message} />
            </div>
            <div>
              <label htmlFor="salary_min" className="text-sm font-medium">
                Salary min
              </label>
              <input id="salary_min" type="number" className="inputbox mt-1" {...register("salary_min")} />
              <FormError message={errors.salary_min?.message} />
            </div>
            <div>
              <label htmlFor="salary_max" className="text-sm font-medium">
                Salary max
              </label>
              <input id="salary_max" type="number" className="inputbox mt-1" {...register("salary_max")} />
              <FormError message={errors.salary_max?.message} />
            </div>
          </div>

          <div>
            <label htmlFor="deadline" className="text-sm font-medium">
              Application deadline
            </label>
            <input id="deadline" type="date" className="inputbox mt-1" {...register("deadline")} />
            <FormError message={errors.deadline?.message} />
          </div>

          {isEditMode && (
            <div>
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select id="status" className="inputbox mt-1" {...register("status")}>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Set to "Open" to make this job visible to candidates.
              </p>
              <FormError message={errors.status?.message} />
            </div>
          )}

          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description *
            </label>
            <textarea id="description" rows={4} className="inputbox mt-1" {...register("description")} />
            <FormError message={errors.description?.message} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Required / preferred skills</span>
              <button
                type="button"
                onClick={() => append({ skill_id: skills[0]?.skill_id || "", importance: "required" })}
                disabled={!skills.length}
                className="text-xs text-primary-blue hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={12} /> Add skill
              </button>
            </div>

            {!skills.length && (
              <p className="text-xs text-gray-400 mb-2">
                No skills available
              </p>
            )}

            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <select className="inputbox" {...register(`skills.${index}.skill_id`)}>
                    {skills.map((s) => (
                      <option key={s.skill_id} value={s.skill_id}>
                        {s.skill_name}
                      </option>
                    ))}
                  </select>
                  <select className="inputbox w-36" {...register(`skills.${index}.importance`)}>
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Remove skill"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-error-red cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="auth-btn flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isPending && <Spinner size={16} />}
            {isEditMode ? "Save changes" : "Create job"}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};

export default JobFormModal;
