import * as Yup from "yup";

export const DepartmentValidationSchema = Yup.object({
  name: Yup.string().max(100).required("Department name is required"),
});

export const DepartmentInitialValues = { name: "" };
