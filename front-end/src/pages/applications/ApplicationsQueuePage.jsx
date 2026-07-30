import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpDown } from "lucide-react";
import { useApplicationsQuery } from "../../hooks/useApplications";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import Skeleton from "../../components/ui/Skeleton";
import ApplicationRow from "../../components/applications/ApplicationRow";
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS } from "../../constants/applicationStatus";

const ApplicationsQueuePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get("job_id") || "";
  const [status, setStatus] = useState("");
  const [sortByMatch, setSortByMatch] = useState(false);
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      job_id: jobId || undefined,
      status: status || undefined,
      sort: sortByMatch ? "match_score" : undefined,
    }),
    [page, jobId, status, sortByMatch]
  );

  const { data, isLoading } = useApplicationsQuery(queryParams);
  // sort=match_score returns a plain array (no pagination) — normalize both shapes
  const applications = Array.isArray(data) ? data : data?.data ?? [];
  const meta = Array.isArray(data) ? null : data?.meta;

  return (
    <section>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Application Queue</h1>
      </header>

      <div className="flex justify-between gap-3 mb-4">
        {jobId && (
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="text-xs px-2 py-1 rounded-full bg-primary-blue/10 text-primary-blue cursor-pointer"
          >
            Job #{jobId} × clear
          </button>
        )}
        <select
          aria-label="Filter by status"
          className="inputbox w-auto"
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
        >
          <option value="">All statuses</option>
          {Object.values(APPLICATION_STATUS).map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSortByMatch((v) => !v)}
          className={`inputbox w-auto flex items-center gap-2 cursor-pointer ${
            sortByMatch ? "border-primary-blue text-primary-blue" : ""
          }`}
        >
          <ArrowUpDown size={14} /> Sort by match score
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState title="No applications found" description="Try adjusting your filters." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-dark-box-outline">
                <th className="py-2 pr-4 font-medium">Candidate</th>
                <th className="py-2 pr-4 font-medium">Job</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Match score</th>
                <th className="py-2 pr-4 font-medium">Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <ApplicationRow key={app.id} application={app} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!sortByMatch && <Pagination meta={meta} onPageChange={setPage} />}
    </section>
  );
};

export default ApplicationsQueuePage;
