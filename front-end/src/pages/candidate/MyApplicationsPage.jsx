import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyApplicationsQuery } from "../../hooks/useCandidateApplications";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import Skeleton from "../../components/ui/Skeleton";
import StatusTimeline from "../../components/applications/StatusTimeline";
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

const MyApplicationsPage = () => {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const { data, isLoading } = useMyApplicationsQuery({ page });
  const applications = data?.data ?? [];
  const meta = data?.meta;

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">My applications</h1>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState title="No applications yet" description="Browse open jobs and apply to get started." />
      ) : (
        <ul className="flex flex-col gap-3">
          {applications.map((app) => (
            <li key={app.id} className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <Link to={`/jobs/${app.job_id}`} className="font-semibold hover:text-primary-blue hover:underline">
                    {app.job?.title || `Job #${app.job_id}`}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} labels={APPLICATION_STATUS_LABELS} classes={STATUS_CLASSES} />
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    className="text-xs text-primary-blue hover:underline cursor-pointer"
                    aria-expanded={expandedId === app.id}
                  >
                    {expandedId === app.id ? "Hide history" : "View history"}
                  </button>
                </div>
              </div>

              {expandedId === app.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-box-outline/50">
                  <StatusTimeline history={app.status_history} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Pagination meta={meta} onPageChange={setPage} />
    </section>
  );
};

export default MyApplicationsPage;
