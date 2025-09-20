import React from "react";
import backendURL from "../../config";

const ProviderStats = ({ assignedCount, availableCount }) => (
  <div className="provider-stats-row">
    <StatCard title="Assigned" value={assignedCount} color="var(--color-blue)" />
    <StatCard title="Available" value={availableCount} color="#FFD700" />
  </div>
);

function StatCard({ title, value, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `5px solid ${color}` }}>
      <span style={{ fontSize: "0.95em", color: "var(--color-light-grey)", marginRight: 10 }}>
        {title}
      </span>
      <span style={{ fontSize: "1.3em", fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

export default ProviderStats;
