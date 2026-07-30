const ProfileCompletionCard = ({ percentage = 0 }) => (
  <div className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4 mb-6">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-sm font-semibold">Profile completion</h2>
      <span className="text-sm font-bold text-primary-blue">{percentage}%</span>
    </div>
    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-dark-hover" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-2 rounded-full bg-primary-blue transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

export default ProfileCompletionCard;
