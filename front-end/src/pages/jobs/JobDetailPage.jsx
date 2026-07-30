import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, XCircle, Trash2, Send, Users } from "lucide-react";
import { useJobQuery, useCloseJobMutation, useDeleteJobMutation } from "../../hooks/useJobs";
import { useAuth } from "../../contexts/AuthContext";
import CustomLoader from "../../components/common/CustomLoader";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import StatusBadge from "../../components/ui/StatusBadge";
import JobFormModal from "../../components/jobs/JobFormModal";
import ApplyJobModal from "../../components/candidate/ApplyJobModal";
import { EMPLOYMENT_TYPE_LABELS } from "../../constants/employmentTypes";
import { JOB_STATUS_LABELS, JOB_STATUS_BADGE_CLASSES } from "../../constants/jobStatus";

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { hasPermission, hasRole } = useAuth();
  const { data: job, isLoading } = useJobQuery(jobId);

  const closeMutation = useCloseJobMutation();
  const deleteMutation = useDeleteJobMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <CustomLoader label="Loading job..." />;
  if (!job) return <EmptyState title="Job not found" />;

  const isCandidate = hasRole("candidate");
  const canEdit = hasPermission("jobs.edit");
  const canClose = hasPermission("jobs.close");
  const canViewApplications = hasPermission("applications.view");

  return (
    <section>
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-blue mb-4"
      >
        <ArrowLeft size={14} /> Back to jobs
      </Link>

      <header className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            {!isCandidate && (
              <StatusBadge status={job.status} labels={JOB_STATUS_LABELS} classes={JOB_STATUS_BADGE_CLASSES} />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {job.company?.company_name} {job.department?.name ? `· ${job.department.name}` : ""} · {job.location} ·{" "}
            {EMPLOYMENT_TYPE_LABELS[job.employment_type] || job.employment_type}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isCandidate && job.status === "open" && (
            <button type="button" onClick={() => setIsApplyOpen(true)} className="auth-btn w-auto px-4 flex items-center gap-2">
              <Send size={14} /> Apply now
            </button>
          )}
          {canViewApplications && (
            <button
              type="button"
              onClick={() => navigate(`/applications?job_id=${job.id}`)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-box-outline hover:bg-gray-50 dark:hover:bg-dark-hover flex items-center gap-2 cursor-pointer"
            >
              <Users size={14} /> View applicants{typeof job.applications_count === "number" ? ` (${job.applications_count})` : ""}
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-box-outline hover:bg-gray-50 dark:hover:bg-dark-hover flex items-center gap-2 cursor-pointer"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
          {canClose && job.status === "open" && (
            <button
              type="button"
              onClick={() => setConfirmClose(true)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-box-outline hover:bg-gray-50 dark:hover:bg-dark-hover flex items-center gap-2 cursor-pointer text-warning-orange"
            >
              <XCircle size={14} /> Close
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-box-outline hover:bg-gray-50 dark:hover:bg-dark-hover flex items-center gap-2 cursor-pointer text-error-red"
            >
              <Trash2 size={14} /> Archive
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article className="md:col-span-2">
          <h2 className="text-lg font-bold mb-2">Description</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{job.description}</p>
        </article>

        <aside className="flex flex-col gap-4">
          <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Details</h3>
            <dl className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <dt>Experience</dt>
                <dd>{job.experience_required} yrs</dd>
              </div>
              {(job.salary_min || job.salary_max) && (
                <div className="flex justify-between">
                  <dt>Salary</dt>
                  <dd>
                    {job.salary_min ?? "—"} – {job.salary_max ?? "—"}
                  </dd>
                </div>
              )}
              {job.deadline && (
                <div className="flex justify-between">
                  <dt>Deadline</dt>
                  <dd>{job.deadline}</dd>
                </div>
              )}
            </dl>
          </div>

          {job.skills?.length > 0 && (
            <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">Skills</h3>
              <ul className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <li
                    key={s.skill_id}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      s.importance === "required"
                        ? "bg-primary-blue/10 text-primary-blue"
                        : "bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-300"
                    }`}
                  >
                    {s.skill_name} · {s.importance}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {canEdit && <JobFormModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} job={job} />}
      {isCandidate && <ApplyJobModal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} job={job} />}

      <ConfirmDialog
        isOpen={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={async () => {
          await closeMutation.mutateAsync(job.id);
          setConfirmClose(false);
        }}
        isPending={closeMutation.isPending}
        title="Close this job?"
        message="Candidates will no longer be able to apply."
        confirmLabel="Close job"
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(job.id);
          navigate("/jobs");
        }}
        isPending={deleteMutation.isPending}
        isDangerous
        title="Archive this job?"
        message="This job posting will be soft-deleted and hidden from listings."
        confirmLabel="Archive"
      />
    </section>
  );
};

export default JobDetailPage;
