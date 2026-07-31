import * as Yup from "yup";

export const FaqValidationSchema = Yup.object({
  question: Yup.string().trim().max(255).required("Question is required"),
  answer: Yup.string().trim().required("Answer is required"),
  category: Yup.string().trim().max(100).nullable(),
  is_active: Yup.boolean().default(true),
});

export const FaqInitialValues = { question: "", answer: "", category: "", is_active: true };
