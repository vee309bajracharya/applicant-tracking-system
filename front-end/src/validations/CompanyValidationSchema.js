import * as Yup from "yup";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const emptyToNull = (value, originalValue) =>
  typeof originalValue === "string" && originalValue.trim() === "" ? null : value;

export const CompanyValidationSchema = Yup.object({
  company_name: Yup.string().trim().max(255).required("Company name is required"),
  website: Yup.string()
    .transform(emptyToNull)
    .nullable()
    .url("Enter a valid URL (include https://)")
    .max(255),
  email: Yup.string()
    .transform(emptyToNull)
    .nullable()
    .email("Enter a valid email")
    .max(255),
  phone: Yup.string()
    .transform(emptyToNull)
    .nullable()
    .max(20, "Max 20 characters"),
  description: Yup.string()
    .transform(emptyToNull)
    .nullable(),
  logo: Yup.mixed()
    .nullable()
    .test("fileType", "Logo must be an image", (file) => !file || file.type?.startsWith("image/"))
    .test("fileSize", "Logo must be under 2MB", (file) => !file || file.size <= MAX_LOGO_BYTES),
});

export const CompanyInitialValues = {
  company_name: "",
  website: "",
  email: "",
  phone: "",
  description: "",
  logo: null,
};