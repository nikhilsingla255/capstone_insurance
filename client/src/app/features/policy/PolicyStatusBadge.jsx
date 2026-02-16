// src/features/policy/PolicyStatusBadge.jsx
import Badge from "../../shared/components/Badge";

const PolicyStatusBadge = ({ status }) => {
  const statusConfig = {
    DRAFT: { label: "DRAFT", color: "gray", icon: "📝" },
    ACTIVE: { label: "ACTIVE", color: "green", icon: "✓" },
    SUSPENDED: { label: "SUSPENDED", color: "orange", icon: "⏸" },
    EXPIRED: { label: "EXPIRED", color: "red", icon: "✕" },
  };

  const config = statusConfig[status] || { label: status, color: "gray", icon: "?" };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
      ${config.color === "gray" && "bg-gray-200 text-gray-800"}
      ${config.color === "green" && "bg-green-200 text-green-800"}
      ${config.color === "orange" && "bg-orange-200 text-orange-800"}
      ${config.color === "red" && "bg-red-200 text-red-800"}
    `}>
      {config.icon} {config.label}
    </span>
  );
};

export default PolicyStatusBadge;