import { AlertTriangle } from "lucide-react";
import Spinner from "../ui/Spinner";
import { useSkillGapQuery } from "../../hooks/useApplications";

const SkillGapPanel = ({ applicationId, enabled }) => {
  const { data, isLoading } = useSkillGapQuery(applicationId, enabled);

  if (!enabled) return null;
  if (isLoading) return <Spinner size={16} />;

  const missing = data?.missing_skills ?? [];

  return (
    <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
      <h3 className="text-sm font-semibold flex items-center gap-1 mb-2">
        <AlertTriangle size={14} className="text-warning-orange" aria-hidden="true" /> Skill gap
      </h3>
      {missing.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No missing required skills.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {missing.map((skill, idx) => (
            <li
              key={idx}
              className="text-xs px-2 py-0.5 rounded-full bg-warning-orange/10 text-warning-orange"
            >
              {skill.skill_name || skill}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SkillGapPanel;
