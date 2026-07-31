import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import { InterviewValidationSchema, InterviewInitialValues } from "../../validations/InterviewValidationSchema";
import { useScheduleInterviewMutation, useUpdateInterviewMutation } from "../../hooks/useInterviews";
import { useAuth } from "../../contexts/AuthContext";

const toDatetimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const InterviewFormModal = ({ isOpen, onClose, applicationId, interview = null }) => {
  const isEditMode = !!interview;
  const { user } = useAuth();
  const scheduleMutation = useScheduleInterviewMutation();
  const updateMutation = useUpdateInterviewMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(InterviewValidationSchema),
    defaultValues: InterviewInitialValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      interview
        ? {
            interview_date: toDatetimeLocal(interview.interview_date),
            interview_type: interview.interview_type || "offline",
            meeting_link: interview.meeting_link || "",
          }
        : InterviewInitialValues
    );
  }, [isOpen, interview, reset]);

  const interviewType = watch("interview_type");
  const isPending = scheduleMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values) => {
    try {
      const payload = {
        interview_date: values.interview_date,
        interview_type: values.interview_type,
        meeting_link: values.interview_type === "online" ? values.meeting_link : null,
      };

      if (isEditMode) {
        await updateMutation.mutateAsync({ interviewId: interview.id, payload, applicationId });
      } else {
        // no backend endpoint to browse other recruiters to assign as the interviewer, so the person scheduling assigns themselves
        await scheduleMutation.mutateAsync({
          application_id: applicationId,
          recruiter_id: user.id,
          ...payload,
        });
      }
      onClose();
    } catch (error) {
      console.error("Interview save error:", error?.response?.data || error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Reschedule interview" : "Schedule interview"}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Interview scheduling form</legend>

          <div>
            <label htmlFor="interview_date" className="text-sm font-medium">
              Date &amp; time *
            </label>
            <input
              id="interview_date"
              type="datetime-local"
              className="inputbox mt-1"
              {...register("interview_date")}
            />
            <FormError message={errors.interview_date?.message} />
          </div>

          <div>
            <label htmlFor="interview_type" className="text-sm font-medium">
              Type *
            </label>
            <select id="interview_type" className="inputbox mt-1" {...register("interview_type")}>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
            <FormError message={errors.interview_type?.message} />
          </div>

          {interviewType === "online" && (
            <div>
              <label htmlFor="meeting_link" className="text-sm font-medium">
                Meeting link *
              </label>
              <input
                id="meeting_link"
                type="url"
                autoComplete="off"
                placeholder="https://meet.example.com/..."
                className="inputbox mt-1"
                {...register("meeting_link")}
              />
              <FormError message={errors.meeting_link?.message} />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="auth-btn flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isPending && <Spinner size={16} />}
            {isEditMode ? "Save changes" : "Schedule interview"}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};

export default InterviewFormModal;
