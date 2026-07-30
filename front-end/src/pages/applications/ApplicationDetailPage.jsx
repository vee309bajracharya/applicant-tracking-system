import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { useApplicationQuery, useRecomputeMatchScoreMutation } from "../../hooks/useApplications";
import { useDownloadResumeMutation } from "../../hooks/useResumes";
import { useAuth } from "../../contexts/AuthContext";
import CustomLoader from "../../components/common/CustomLoader";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import StatusTimeline from "../../components/applications/StatusTimeline";
import SkillGapPanel from "../../components/applications/SkillGapPanel";
import UpdateStatusModal from "../../components/applications/UpdateStatusModal";
import { APPLICATION_STATUS_LABELS } from "../../constants/applicationStatus";

const STATUS_CLASSES = {
  applied: "bg-information-purple/10 text-information-purple",
  screening: "bg-warning-orange/10 text-warning-orange",
  shortlisted: "bg-secondary-blue/10 text-secondary-blue",
  interview: "bg-primary-blue/10 text-primary-blue",
  selected: "bg-success-green/10 text-success-green",
  hired: "bg-success-green/10 text-success-green",
  rejected: "bg-error-red/10 text-error-red",
};

const ApplicationDetailPage = () => {
  const { applicationId } = useParams();
  const { hasPermission } = useAuth();
  const { data: application, isLoading } = useApplicationQuery(applicationId);
  const recomputeMutation = useRecomputeMatchScoreMutation();
  const downloadMutation = useDownloadResumeMutation();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [showSkillGap, setShowSkillGap] = useState(false);

  if (isLoading) return <CustomLoader label="Loading application..." />;
  if (!application) return <EmptyState title="Application not found" />;

  const canScreen = hasPermission("applications.screen") || hasPermission("hiring.manage");
  const canViewResume = hasPermission("resumes.view");
  const score = application.match_score;

  return (
    <section>
      <Link
        to="/applications"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-blue mb-4"
      >
        <ArrowLeft size={14} /> Back to queue
      </Link>

      <header className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{application.candidate_profile?.fullname || `Candidate #${application.candidate_id}`}</h1>
            <StatusBadge status={application.status} labels={APPLICATION_STATUS_LABELS} classes={STATUS_CLASSES} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Applied to{" "}
            <Link to={`/jobs/${application.job_id}`} className="hover:text-primary-blue hover:underline">
              {application.job?.title || `Job #${application.job_id}`}
            </Link>
          </p>
        </div>

        {canScreen && (
          <button type="button" onClick={() => setIsStatusModalOpen(true)} className="auth-btn w-auto px-4">
            Update status
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-2">Candidate profile</h2>
            {application.candidate_profile?.headline && (
              <p className="text-sm font-medium mb-1">{application.candidate_profile.headline}</p>
            )}
            {application.candidate_profile?.summary && (
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                {application.candidate_profile.summary}
              </p>
            )}
            <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3">
              {application.candidate_profile?.experience_years != null && (
                <span>{application.candidate_profile.experience_years} yrs experience</span>
              )}
              {application.candidate_profile?.linkedin_url && (
                <a href={application.candidate_profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary-blue hover:underline">
                  LinkedIn
                </a>
              )}
              {application.candidate_profile?.github_url && (
                <a href={application.candidate_profile.github_url} target="_blank" rel="noopener noreferrer" className="text-primary-blue hover:underline">
                  GitHub
                </a>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-2">Status history</h2>
            <StatusTimeline history={application.status_history} />
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          {canViewResume && application.resume && (
            <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">Resume</h3>
              <button
                type="button"
                onClick={() => downloadMutation.mutate(application.resume)}
                className="text-sm text-primary-blue hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download size={14} /> {application.resume.file_name}
              </button>
            </div>
          )}

          {score && (
            <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Match score</h3>
                {canScreen && (
                  <button
                    type="button"
                    onClick={() => recomputeMutation.mutate(application.id)}
                    disabled={recomputeMutation.isPending}
                    aria-label="Recompute match score"
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover cursor-pointer"
                  >
                    <RefreshCw size={14} className={recomputeMutation.isPending ? "animate-spin" : ""} />
                  </button>
                )}
              </div>
              <p className="text-2xl font-bold text-primary-blue mb-2">{score.final_score}%</p>
              <dl className="text-xs space-y-1 text-gray-500 dark:text-gray-400">
                <div className="flex justify-between"><dt>Skill</dt><dd>{score.skill_score}%</dd></div>
                <div className="flex justify-between"><dt>Experience</dt><dd>{score.experience_score}%</dd></div>
                <div className="flex justify-between"><dt>Keyword</dt><dd>{score.keyword_score}%</dd></div>
                <div className="flex justify-between"><dt>TF-IDF</dt><dd>{score.tfidf_score}%</dd></div>
              </dl>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowSkillGap((v) => !v)}
            className="text-sm text-primary-blue hover:underline cursor-pointer text-left"
          >
            {showSkillGap ? "Hide skill gap" : "View skill gap"}
          </button>
          <SkillGapPanel applicationId={application.id} enabled={showSkillGap} />
        </aside>
      </div>

      <UpdateStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        application={application}
        hasPermission={hasPermission}
      />
    </section>
  );
};

export default ApplicationDetailPage;
