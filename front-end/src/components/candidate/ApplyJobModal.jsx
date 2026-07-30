import { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";
import { useResumesQuery } from "../../hooks/useResumes";
import { useApplyToJobMutation } from "../../hooks/useCandidateApplications";

const ApplyJobModal = ({ isOpen, onClose, job }) => {
  const { data, isLoading } = useResumesQuery({ page: 1 });
  const resumes = data?.data ?? [];
  const applyMutation = useApplyToJobMutation();
  const [resumeId, setResumeId] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!resumeId) return;
    try {
      await applyMutation.mutateAsync({ job_id: job.id, resume_id: Number(resumeId) });
      onClose();
    } catch (error) {
      console.error("Apply error:", error?.response?.data || error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply to ${job?.title ?? "job"}`}>
      {isLoading ? (
        <Spinner size={20} />
      ) : resumes.length === 0 ? (
        <EmptyState
          title="No resume on file"
          description="Upload a resume from your profile before applying."
        />
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">Choose resume to apply with</legend>
            <div>
              <label htmlFor="resume_id" className="text-sm font-medium">
                Choose resume *
              </label>
              <select
                id="resume_id"
                className="inputbox mt-1"
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                required
              >
                <option value="">Select a resume</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.file_name} {resume.is_primary ? "(primary)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={applyMutation.isPending || !resumeId}
              className="auth-btn flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {applyMutation.isPending && <Spinner size={16} />}
              Submit application
            </button>
          </fieldset>
        </form>
      )}

      {resumes.length === 0 && !isLoading && (
        <Link to="/candidate/profile" className="text-sm text-primary-blue hover:underline mt-4 inline-block">
          Go to profile to upload a resume
        </Link>
      )}
    </Modal>
  );
};

export default ApplyJobModal;
