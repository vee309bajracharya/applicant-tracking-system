import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDashboardQuery } from "../hooks/useDashboard";
import CustomLoader from "../components/common/CustomLoader";
import StatsGrid from "../components/dashboard/StatsGrid";
import ChartCanvas from "../components/dashboard/ChartCanvas";
import { APPLICATION_STATUS_LABELS } from "../constants/applicationStatus";
import { JOB_STATUS_LABELS } from "../constants/jobStatus";

const PALETTE = ["#2563eb", "#f59e0b", "#7c3aed", "#0ea5e9", "#16a34a", "#dc2626", "#64748b"];

const pipelineChartData = (pipeline = {}) => {
  const labels = Object.keys(pipeline).map((key) => APPLICATION_STATUS_LABELS[key] || key);
  return {
    labels,
    datasets: [{ data: Object.values(pipeline), backgroundColor: PALETTE }],
  };
};

const jobsByStatusChartData = (jobsByStatus = {}) => ({
  labels: Object.keys(jobsByStatus).map((key) => JOB_STATUS_LABELS[key] || key),
  datasets: [{ label: "Jobs", data: Object.values(jobsByStatus), backgroundColor: PALETTE }],
});

const usersByRoleChartData = (usersByRole = {}) => ({
  labels: Object.keys(usersByRole),
  datasets: [{ label: "Users", data: Object.values(usersByRole), backgroundColor: PALETTE }],
});

const Home = () => {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardQuery();

  if (isLoading) return <CustomLoader label="Loading your dashboard..." />;

  const role = data?.role;
  const hasPipelineData = data?.pipeline && Object.values(data.pipeline).some((v) => v > 0);

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Welcome{user ? `, ${user.fullname}` : ""}</h1>
        {data?.company?.company_name && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{data.company.company_name}</p>
        )}
      </header>

      <StatsGrid stats={data?.stats ?? []} />

      {role === "candidate" && (
        <>
          {!hasPipelineData ? (
            <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                You haven't applied to anything yet — browse open positions to get started.
              </p>
              <Link to="/jobs" className="text-sm text-primary-blue hover:underline">
                Browse jobs
              </Link>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4 max-w-md">
              <h2 className="text-sm font-semibold mb-3">Your applications by stage</h2>
              <ChartCanvas type="doughnut" data={pipelineChartData(data.pipeline)} />
            </div>
          )}
        </>
      )}

      {(role === "hr_manager" || role === "recruiter") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">Applications by pipeline stage</h2>
            {hasPipelineData ? (
              <ChartCanvas type="bar" data={pipelineChartData(data.pipeline)} options={{ plugins: { legend: { display: false } } }} />
            ) : (
              <p className="text-sm text-gray-400">No applications yet.</p>
            )}
          </div>
          <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">Jobs by status</h2>
            <ChartCanvas type="doughnut" data={jobsByStatusChartData(data.jobs_by_status)} />
          </div>
        </div>
      )}

      {role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">Applications by pipeline stage</h2>
            {hasPipelineData ? (
              <ChartCanvas type="bar" data={pipelineChartData(data.pipeline)} options={{ plugins: { legend: { display: false } } }} />
            ) : (
              <p className="text-sm text-gray-400">No applications yet.</p>
            )}
          </div>
          <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">Jobs by status</h2>
            <ChartCanvas type="doughnut" data={jobsByStatusChartData(data.jobs_by_status)} />
          </div>
          <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4 md:col-span-2">
            <h2 className="text-sm font-semibold mb-3">Users by role</h2>
            <ChartCanvas type="bar" data={usersByRoleChartData(data.users_by_role)} options={{ plugins: { legend: { display: false } } }} />
          </div>
        </div>
      )}
    </section>
  );
};

export default Home;
