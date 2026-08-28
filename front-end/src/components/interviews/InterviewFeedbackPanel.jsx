import { useState } from "react";
import { Star, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Spinner from "../ui/Spinner";
import FormError from "../ui/FormError";
import ConfirmDialog from "../ui/ConfirmDialog";
import {
  InterviewFeedbackValidationSchema,
  InterviewFeedbackInitialValues,
} from "../../validations/InterviewValidationSchema";
import {
  useStoreFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
} from "../../hooks/useInterviews";
import { useAuth } from "../../contexts/AuthContext";

const InterviewFeedbackPanel = ({ interview, applicationId }) => {
  const { user, hasPermission } = useAuth();
  const storeMutation = useStoreFeedbackMutation();
  const updateMutation = useUpdateFeedbackMutation();
  const deleteMutation = useDeleteFeedbackMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(InterviewFeedbackValidationSchema),
    defaultValues: InterviewFeedbackInitialValues,
  });

  const feedbackEntries = interview.feedback ?? [];
  // the button doesn't even appear for an interview that hasn't happened yet or was cancelled.
  const interviewHasPassed = interview.interview_date ? new Date(interview.interview_date) <= new Date() : false;
  const interviewIsCancelled = interview.status === "cancelled";
  // one feedback entry per interview is enough.
  const canAddFeedback =
    (hasPermission("candidate.notes.create") || hasPermission("interviews.manage")) &&
    feedbackEntries.length === 0 &&
    interviewHasPassed &&
    !interviewIsCancelled;

  const openCreate = () => {
    setEditingFeedback(null);
    reset(InterviewFeedbackInitialValues);
    setIsFormOpen(true);
  };

  const openEdit = (feedback) => {
    setEditingFeedback(feedback);
    reset({ rating_score: feedback.rating_score, notes: feedback.notes || "" });
    setIsFormOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      const payload = { rating_score: Number(values.rating_score), notes: values.notes || null };
      if (editingFeedback) {
        await updateMutation.mutateAsync({ feedbackId: editingFeedback.id, payload, applicationId });
      } else {
        await storeMutation.mutateAsync({ interviewId: interview.id, payload, applicationId });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Feedback save error:", error?.response?.data || error);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-box-outline/50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Feedback</h4>
        {canAddFeedback && !isFormOpen && (
          <button type="button" onClick={openCreate} className="text-xs text-primary-blue hover:underline cursor-pointer">
            + Add feedback
          </button>
        )}
      </div>

      {feedbackEntries.length === 0 && !isFormOpen && (
        <p className="text-xs text-gray-400">
          {interviewIsCancelled
            ? "This interview was cancelled — no feedback to log."
            : !interviewHasPassed
              ? "Feedback can be logged once this interview has taken place."
              : "No feedback logged yet."}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {feedbackEntries.map((fb) => {
          const isOwn = fb.reviewer_id === user?.id;
          const canEdit = isOwn || hasPermission("interviews.manage");
          return (
            <li key={fb.id} className="text-sm bg-gray-50 dark:bg-dark-hover rounded-lg p-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-medium">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < fb.rating_score ? "fill-warning-orange text-warning-orange" : "text-gray-300"}
                    />
                  ))}
                </span>
                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(fb)} aria-label="Edit feedback" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-box-outline cursor-pointer">
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(fb)}
                      aria-label="Delete feedback"
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-box-outline text-error-red cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              {fb.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fb.notes}</p>}
              <p className="text-[10px] text-gray-400 mt-1">
                {fb.reviewer?.fullname || "Reviewer"} · {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ""}
              </p>
            </li>
          );
        })}
      </ul>

      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-3 flex flex-col gap-2">
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Interview feedback form</legend>
            <div>
              <label htmlFor={`rating-${interview.id}`} className="text-xs font-medium">
                Rating (1-5) *
              </label>
              <select id={`rating-${interview.id}`} className="inputbox mt-1" {...register("rating_score")}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <FormError message={errors.rating_score?.message} />
            </div>
            <div>
              <label htmlFor={`notes-${interview.id}`} className="text-xs font-medium">
                Notes
              </label>
              <textarea id={`notes-${interview.id}`} rows={2} className="inputbox mt-1" {...register("notes")} />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={storeMutation.isPending || updateMutation.isPending}
                className="auth-btn w-auto px-4 flex items-center justify-center gap-2 cursor-pointer"
              >
                {(storeMutation.isPending || updateMutation.isPending) && <Spinner size={14} />}
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-box-outline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </fieldset>
        </form>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          await deleteMutation.mutateAsync({ feedbackId: confirmDelete.id, applicationId });
          setConfirmDelete(null);
        }}
        isPending={deleteMutation.isPending}
        isDangerous
        title="Delete this feedback?"
        message="This action can't be undone."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default InterviewFeedbackPanel;
