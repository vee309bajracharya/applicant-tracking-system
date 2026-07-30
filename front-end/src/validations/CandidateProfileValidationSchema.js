import * as Yup from "yup";

const emptyToNull = (value, originalValue) =>
  typeof originalValue === "string" && originalValue.trim() === "" ? null : value;

export const CandidateProfileValidationSchema = Yup.object({
  headline: Yup.string().transform(emptyToNull).nullable().max(255),
  summary: Yup.string().transform(emptyToNull).nullable(),
  experience_years: Yup.number().transform(emptyToNull).nullable().min(0).max(99.9),
  expected_salary: Yup.number().transform(emptyToNull).nullable().min(0),
  linkedin_url: Yup.string().transform(emptyToNull).nullable().url("Enter a valid URL").max(255),
  github_url: Yup.string().transform(emptyToNull).nullable().url("Enter a valid URL").max(255),
  portfolio_url: Yup.string().transform(emptyToNull).nullable().url("Enter a valid URL").max(255),
});

export const CandidateProfileInitialValues = {
  headline: "",
  summary: "",
  experience_years: "",
  expected_salary: "",
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
};
