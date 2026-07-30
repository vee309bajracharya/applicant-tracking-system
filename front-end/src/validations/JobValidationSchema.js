import * as Yup from "yup";

const emptyToNull = (value, originalValue) =>
  typeof originalValue === "string" && originalValue.trim() === "" ? null : value;

export const JobValidationSchema = Yup.object({
  company_id: Yup.number().typeError("Select a company").required("Company is required"),
  department_id: Yup.number().typeError("Select a department").required("Department is required"),
  title: Yup.string().trim().max(255).required("Job title is required"),
  employment_type: Yup.string()
    .oneOf(["full_time", "part_time", "internship", "contract"], "Choose a valid employment type")
    .required("Employment type is required"),
  location: Yup.string().trim().max(255).required("Location is required"),
  experience_required: Yup.number()
    .transform(emptyToNull)
    .nullable()
    .min(0)
    .max(99.9, "Max 99.9 years"),
  salary_min: Yup.number().transform(emptyToNull).nullable().min(0),
  salary_max: Yup.number()
    .transform(emptyToNull)
    .nullable()
    .min(Yup.ref("salary_min"), "Max salary must be at or above min salary"),
  description: Yup.string().trim().required("Description is required"),
  deadline: Yup.string().transform(emptyToNull).nullable(),
  status: Yup.string().oneOf(["open", "closed", "draft"]),
  skills: Yup.array().of(
    Yup.object({
      skill_id: Yup.number().required(),
      importance: Yup.string().oneOf(["required", "preferred"]).default("required"),
    })
  ),
});

export const JobInitialValues = {
  company_id: "",
  department_id: "",
  title: "",
  employment_type: "full_time",
  location: "",
  experience_required: "",
  salary_min: "",
  salary_max: "",
  description: "",
  deadline: "",
  skills: [],
};
