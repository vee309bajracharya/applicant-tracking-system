const StatusBadge = ({ status, labels, classes }) => (
  <span
    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${classes[status] || ""}`}
  >
    {labels[status] || status}
  </span>
);

export default StatusBadge;
