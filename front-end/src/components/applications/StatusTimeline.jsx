import { Check } from "lucide-react";
import { APPLICATION_STATUS_LABELS } from "../../constants/applicationStatus";

const StatusTimeline = ({ history = [] }) => {
  if (!history.length) return <p className="text-sm text-gray-400">No status history yet.</p>;

  return (
    <ol className="flex flex-col gap-4">
      {history.map((entry) => (
        <li key={entry.id} className="flex gap-3">
          <span className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-primary-blue/10 text-primary-blue flex items-center justify-center">
            <Check size={12} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium">
              {entry.old_status ? `${APPLICATION_STATUS_LABELS[entry.old_status]} → ` : ""}
              {APPLICATION_STATUS_LABELS[entry.new_status] || entry.new_status}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {entry.changed_by_user?.fullname ? `by ${entry.changed_by_user.fullname} · ` : ""}
              {entry.created_at ? new Date(entry.created_at).toLocaleString() : ""}
            </p>
            {entry.reason && <p className="text-xs text-gray-400 mt-0.5">{entry.reason}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default StatusTimeline;
