import { useState } from "react";
import { Calendar, MapPin, Link as LinkIcon, Pencil, XCircle, Plus } from "lucide-react";
import { useApplicationInterviewsQuery, useCancelInterviewMutation } from "../../hooks/useInterviews";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../ui/Spinner";
import StatusBadge from "../ui/StatusBadge";
import ConfirmDialog from "../ui/ConfirmDialog";
import InterviewFormModal from "./InterviewFormModal";
import InterviewFeedbackPanel from "./InterviewFeedbackPanel";
import { INTERVIEW_STATUS_LABELS, INTERVIEW_STATUS_BADGE_CLASSES } from "../../constants/interviewStatus";

const InterviewsPanel = ({ application }) => {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("interviews.manage");
  // interviews can only be scheduled once the pipeline has reached 'interview'
  const canSchedule = canManage && application.status === "interview";

  const { data: interviews, isLoading } = useApplicationInterviewsQuery(application.id, canManage);
  const cancelMutation = useCancelInterviewMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  if (!canManage) return null;

  return (
    <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Interviews</h3>
        {canSchedule && (
          <button
            type="button"
            onClick={() => {
              setEditingInterview(null);
              setIsFormOpen(true);
            }}
            className="text-xs text-primary-blue hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus size={12} /> Schedule
          </button>
        )}
      </div>

      {!canSchedule && (!interviews || interviews.length === 0) && (
        <p className="text-xs text-gray-400">
          Interviews can only be scheduled once this application reaches the "Interview" stage.
        </p>
      )}

      {isLoading ? (
        <Spinner size={16} />
      ) : (
        <ul className="flex flex-col gap-3">
          {(interviews ?? []).map((interview) => (
            <li key={interview.id} className="text-sm bg-gray-50 dark:bg-dark-hover rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-1.5 font-medium">
                    <Calendar size={13} aria-hidden="true" />{" "}
                    {interview.interview_date
                      ? new Date(interview.interview_date).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {interview.interview_type === "online" ? (
                      <>
                        <LinkIcon size={12} aria-hidden="true" />
                        <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Join meeting
                        </a>
                      </>
                    ) : (
                      <>
                        <MapPin size={12} aria-hidden="true" /> Offline
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={interview.status}
                    labels={INTERVIEW_STATUS_LABELS}
                    classes={INTERVIEW_STATUS_BADGE_CLASSES}
                  />
                  {canManage && interview.status === "scheduled" && !["hired", "rejected"].includes(application.status) && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingInterview(interview);
                          setIsFormOpen(true);
                        }}
                        aria-label="Reschedule interview"
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-box-outline cursor-pointer"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmCancel(interview)}
                        aria-label="Cancel interview"
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-box-outline text-error-red cursor-pointer"
                      >
                        <XCircle size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <InterviewFeedbackPanel interview={interview} applicationId={application.id} />
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <InterviewFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          applicationId={application.id}
          interview={editingInterview}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        onConfirm={async () => {
          if (!confirmCancel) return;
          await cancelMutation.mutateAsync({ interviewId: confirmCancel.id, applicationId: application.id });
          setConfirmCancel(null);
        }}
        isPending={cancelMutation.isPending}
        isDangerous
        title="Cancel this interview?"
        message="The candidate will need to be rescheduled separately."
        confirmLabel="Cancel interview"
      />
    </div>
  );
};

export default InterviewsPanel;
