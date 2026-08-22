import { FileDown, FileText } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import { useExportReportMutation } from "../../hooks/useReports";

const REPORT_CARDS = [
  {
    key: "hiring",
    title: "Hiring Report",
    description: "Every job with its applicant counts broken down by pipeline stage.",
  },
  {
    key: "candidates",
    title: "Candidate Summary",
    description: "Every candidate with profile completion, resume, skill, and application counts.",
  },
  {
    key: "interviews",
    title: "Interview Score Sheet",
    description: "Every interview with the interviewer, schedule, and averaged feedback rating.",
  },
];

const ReportExportCard = ({ title, description, reportKey }) => {
  const exportMutation = useExportReportMutation(reportKey);

  return (
    <article className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-main-blue/10 p-2 text-main-blue">
          <FileDown size={20} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => exportMutation.mutate()}
        disabled={exportMutation.isPending}
        aria-label={`Export ${title} as PDF`}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-dark-border px-3 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-dark-overlay transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {exportMutation.isPending ? <Spinner size={14} /> : <FileText size={14} aria-hidden="true" />}
        Export Report
      </button>
    </article>
  );
};

const ReportsPage = () => {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Generate PDF exports for hiring activity, candidates, and interviews.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REPORT_CARDS.map((card) => (
          <ReportExportCard key={card.key} reportKey={card.key} title={card.title} description={card.description} />
        ))}
      </div>
    </section>
  );
};

export default ReportsPage;
