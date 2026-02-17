import { useEffect, useState } from "react";
import {
  fetchExposureLOB,
  fetchLossRatio,
  fetchRetentionVsCeded,
  fetchReinsurerDistribution,
} from "./dashboardService";

import Card from "../../shared/components/Card";
import Loader from "../../shared/components/Loader";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DashboardPage = () => {
  const [exposure, setExposure] = useState([]);
  const [lossRatio, setLossRatio] = useState(null);
  const [retention, setRetention] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const [exp, loss, ret, dist] = await Promise.all([
          fetchExposureLOB(),
          fetchLossRatio(),
          fetchRetentionVsCeded(),
          fetchReinsurerDistribution(),
        ]);

        setExposure(exp || []);
        setLossRatio(loss || {});
        setRetention(ret || {});
        setDistribution(dist || []);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data. Please check your permissions.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          <p className="font-semibold">❌ Error Loading Dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const hasExposureData = exposure.some(item => item.totalSumInsured > 0);
  const hasData = hasExposureData || (lossRatio?.totalPremium > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {!hasData && (
        <Card className="bg-blue-50 border border-blue-200">
          <p className="text-blue-800">
            ℹ️ <strong>No data available yet.</strong> Dashboard metrics will appear once you create and approve policies.
          </p>
        </Card>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <h3 className="text-sm text-gray-500">Total Premium</h3>
          <p className="text-xl font-bold">
            ₹{(lossRatio?.totalPremium || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card>
          <h3 className="text-sm text-gray-500">Total Approved Claims</h3>
          <p className="text-xl font-bold">
            ₹{(lossRatio?.totalApprovedClaims || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card>
          <h3 className="text-sm text-gray-500">Loss Ratio</h3>
          <p className="text-xl font-bold">
            {lossRatio?.lossRatioPercentage || 0}%
          </p>
        </Card>
      </div>

      {/* EXPOSURE BAR CHART */}
      <Card>
        <h3 className="mb-4 font-semibold">Exposure by LOB</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={exposure}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
            <Bar dataKey="totalSumInsured" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* RETENTION PIE CHART */}
      <Card>
        <h3 className="mb-4 font-semibold">Retention vs Ceded</h3>
        {(retention?.totalRetained || 0) + (retention?.totalCeded || 0) > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Retained", value: retention?.totalRetained || 0 },
                  { name: "Ceded", value: retention?.totalCeded || 0 },
                ]}
                dataKey="value"
                outerRadius={100}
                label
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No allocation data available yet
          </div>
        )}
      </Card>

      {/* REINSURER DISTRIBUTION PIE CHART */}
      <Card>
        <h3 className="mb-4 font-semibold">Reinsurer Distribution</h3>
        {distribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribution}
                dataKey="totalCededAmount"
                nameKey="reinsurerName"
                outerRadius={100}
                label={({ name, value, payload }) =>
                  `${name} - ₹${Number(value).toLocaleString('en-IN')} (${payload.avgCededPercentage || 0}%)`
                }
              >

                {distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6'][index % 5]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No reinsurer distribution data available yet
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;