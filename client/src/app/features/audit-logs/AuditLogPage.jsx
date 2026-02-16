import { useEffect, useState } from "react";
import { auditLogService } from "./auditLogService";

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditLogService.getAllAuditLogs();
      setLogs(data);
    } catch (err) {
      setError(err.message || "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getEntityTypeColor = (type) => {
    const colors = {
      POLICY: "bg-blue-100 text-blue-800",
      CLAIM: "bg-green-100 text-green-800",
      TREATY: "bg-purple-100 text-purple-800",
      USER: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: "bg-green-100 text-green-800",
      UPDATE: "bg-blue-100 text-blue-800",
      DELETE: "bg-red-100 text-red-800",
      APPROVE: "bg-purple-100 text-purple-800",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  const filteredLogs = filter === "ALL" ? logs : logs.filter((log) => log.action === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
          <button
            onClick={fetchAuditLogs}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("CREATE")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "CREATE"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setFilter("UPDATE")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "UPDATE"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Update
          </button>
          <button
            onClick={() => setFilter("DELETE")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "DELETE"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Delete
          </button>
          <button
            onClick={() => setFilter("APPROVE")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "APPROVE"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Approve
          </button>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No audit logs found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Entity Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.performedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEntityTypeColor(log.entityType)}`}>
                        {log.entityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.performedBy?.username || "System"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.ipAddress || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredLogs.length} of {logs.length} audit logs
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
