import { Link } from "react-router-dom";
import StatusBadge from "../ui/StatusBadge";
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

const ApplicationRow = ({ application }) => (
  <tr className="border-b border-gray-100 dark:border-dark-box-outline/50">
    <td className="py-3 pr-4">
      <Link to={`/applications/${application.id}`} className="font-medium hover:text-primary-blue hover:underline">
        {application.candidate_profile?.fullname || `Candidate #${application.candidate_id}`}
      </Link>
    </td>
    <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{application.job?.title || `Job #${application.job_id}`}</td>
    <td className="py-3 pr-4">
      <StatusBadge status={application.status} labels={APPLICATION_STATUS_LABELS} classes={STATUS_CLASSES} />
    </td>
    <td className="py-3 pr-4">
      {application.match_score?.final_score != null ? `${application.match_score.final_score}%` : "—"}
    </td>
    <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
      {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : "—"}
    </td>
  </tr>
);

export default ApplicationRow;
