const StatsGrid = ({ stats = [] }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {stats.map((stat) => (
      <div key={stat.label} className="border border-gray-200 dark:border-dark-box-outline rounded-lg p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
        <p className="text-2xl font-bold mt-1">{stat.value}</p>
      </div>
    ))}
  </div>
);

export default StatsGrid;
