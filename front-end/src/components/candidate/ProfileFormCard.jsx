import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import {
  CandidateProfileValidationSchema,
  CandidateProfileInitialValues,
} from "../../validations/CandidateProfileValidationSchema";
import { useSaveCandidateProfileMutation } from "../../hooks/useCandidateProfile";

const ProfileFormCard = ({ profile }) => {
  const isEditMode = !!profile;
  const saveMutation = useSaveCandidateProfileMutation(isEditMode);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CandidateProfileValidationSchema),
    defaultValues: CandidateProfileInitialValues,
  });

  useEffect(() => {
    if (profile) {
      reset({
        headline: profile.headline || "",
        summary: profile.summary || "",
        experience_years: profile.experience_years ?? "",
        expected_salary: profile.expected_salary ?? "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        portfolio_url: profile.portfolio_url || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        headline: values.headline || null,
        summary: values.summary || null,
        experience_years: values.experience_years === "" ? null : Number(values.experience_years),
        expected_salary: values.expected_salary === "" ? null : Number(values.expected_salary),
        linkedin_url: values.linkedin_url || null,
        github_url: values.github_url || null,
        portfolio_url: values.portfolio_url || null,
      };
      await saveMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Profile save error:", error?.response?.data || error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mb-10">
      <fieldset className="flex flex-col gap-4 max-w-2xl">
        <legend className="sr-only">Candidate profile form</legend>

        <div>
          <label htmlFor="headline" className="text-sm font-medium">
            Headline
          </label>
          <input
            id="headline"
            type="text"
            autoComplete="off"
            placeholder="e.g. Senior Backend Engineer"
            className="inputbox mt-1"
            {...register("headline")}
          />
          <FormError message={errors.headline?.message} />
        </div>

        <div>
          <label htmlFor="summary" className="text-sm font-medium">
            Summary
          </label>
          <textarea id="summary" rows={4} className="inputbox mt-1" {...register("summary")} />
          <FormError message={errors.summary?.message} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="experience_years" className="text-sm font-medium">
              Experience (years)
            </label>
            <input
              id="experience_years"
              type="number"
              step="0.1"
              className="inputbox mt-1"
              {...register("experience_years")}
            />
            <FormError message={errors.experience_years?.message} />
          </div>
          <div>
            <label htmlFor="expected_salary" className="text-sm font-medium">
              Expected salary
            </label>
            <input id="expected_salary" type="number" className="inputbox mt-1" {...register("expected_salary")} />
            <FormError message={errors.expected_salary?.message} />
          </div>
        </div>

        <div>
          <label htmlFor="linkedin_url" className="text-sm font-medium">
            LinkedIn URL
          </label>
          <input id="linkedin_url" type="url" className="inputbox mt-1" {...register("linkedin_url")} />
          <FormError message={errors.linkedin_url?.message} />
        </div>

        <div>
          <label htmlFor="github_url" className="text-sm font-medium">
            GitHub URL
          </label>
          <input id="github_url" type="url" className="inputbox mt-1" {...register("github_url")} />
          <FormError message={errors.github_url?.message} />
        </div>

        <div>
          <label htmlFor="portfolio_url" className="text-sm font-medium">
            Portfolio URL
          </label>
          <input id="portfolio_url" type="url" className="inputbox mt-1" {...register("portfolio_url")} />
          <FormError message={errors.portfolio_url?.message} />
        </div>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="auth-btn w-auto px-6 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {saveMutation.isPending && <Spinner size={16} />}
          {isEditMode ? "Save profile" : "Create profile"}
        </button>
      </fieldset>
    </form>
  );
};

export default ProfileFormCard;
