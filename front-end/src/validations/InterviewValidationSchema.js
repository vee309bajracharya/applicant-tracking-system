import * as Yup from "yup";

export const InterviewValidationSchema = Yup.object({
  interview_date: Yup.string().required("Date & time is required"),
  interview_type: Yup.string().oneOf(["online", "offline"]).required(),
  meeting_link: Yup.string()
    .max(500)
    .when("interview_type", {
      is: "online",
      then: (schema) => schema.required("Meeting link is required for online interviews"),
      otherwise: (schema) => schema.nullable(),
    }),
});

export const InterviewInitialValues = {
  interview_date: "",
  interview_type: "offline",
  meeting_link: "",
};

export const InterviewFeedbackValidationSchema = Yup.object({
  rating_score: Yup.number()
    .typeError("Select a rating")
    .min(1)
    .max(5)
    .required("Rating is required"),
  notes: Yup.string().nullable(),
});

export const InterviewFeedbackInitialValues = { rating_score: 3, notes: "" };
