import { Link } from "react-router-dom";
import { MapPin, Briefcase, Building2 } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { EMPLOYMENT_TYPE_LABELS } from "../../constants/employmentTypes";
import { JOB_DISPLAY_STATUS_LABELS, JOB_DISPLAY_STATUS_BADGE_CLASSES, getJobDisplayStatus } from "../../constants/jobStatus";

const JobCard = ({ job, showStatus = false }) => (
  <Link
    to={`/jobs/${job.id}`}
    className="block border border-gray-200 dark:border-dark-box-outline rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <h3 className="font-semibold text-lg line-clamp-1">{job.title}</h3>
      {showStatus && (
        <StatusBadge
          status={getJobDisplayStatus(job)}
          labels={JOB_DISPLAY_STATUS_LABELS}
          classes={JOB_DISPLAY_STATUS_BADGE_CLASSES}
        />
      )}
    </div>

    {job.company?.company_name && (
      <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-1">
        <Building2 size={14} aria-hidden="true" /> {job.company.company_name}
        {job.department?.name ? ` · ${job.department.name}` : ""}
      </p>
    )}

    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3">
      <span className="flex items-center gap-1">
        <MapPin size={12} aria-hidden="true" /> {job.location}
      </span>
      <span className="flex items-center gap-1">
        <Briefcase size={12} aria-hidden="true" /> {EMPLOYMENT_TYPE_LABELS[job.employment_type] || job.employment_type}
      </span>
      {typeof job.applications_count === "number" && (
        <span>{job.applications_count} applicant{job.applications_count === 1 ? "" : "s"}</span>
      )}
    </div>
  </Link>
);

export default JobCard;
