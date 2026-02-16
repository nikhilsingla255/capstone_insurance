import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { getClaims } from "./claimService";
import Button from "../../shared/components/Button";
import Loader from "../../shared/components/Loader";
import Card from "../../shared/components/Card";
import ClaimCreateForm from "./ClaimCreateForm";

const ClaimsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const canCreate = user?.role === "CLAIMS_ADJUSTER" || user?.role === "ADMIN";

  const loadClaims = async () => {
    try {
      setLoading(true);
      const data = await getClaims();
      setClaims(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load claims");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadClaims();
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800";
      case "IN_REVIEW":
        return "bg-orange-100 text-orange-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "SETTLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredClaims = filterStatus === "ALL" 
    ? claims 
    : claims.filter(c => c.status === filterStatus);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
        ❌ {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Claims</h1>
          <p className="text-gray-600">Manage insurance claims</p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            ➕ New Claim
          </Button>
        )}
      </div>

      {/* Filter by Status */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED", "SETTLED"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded font-semibold text-sm transition ${
              filterStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Claims Table */}
      {filteredClaims.length === 0 ? (
        <Card>
          <p className="text-gray-600 text-center py-8">
            No claims found. {canCreate && "Create one to get started."}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left border-b">
              <tr>
                <th className="p-4">Claim #</th>
                <th className="p-4">Policy #</th>
                <th className="p-4">Claim Amount</th>
                <th className="p-4">Approved Amount</th>
                <th className="p-4">Incident Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredClaims.map((claim) => (
                <tr key={claim._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-semibold">{claim.claimNumber}</td>
                  
                  <td className="p-4">
                    <span className="bg-blue-50 px-2 py-1 rounded text-xs">
                      {claim.policyId?.policyNumber || "N/A"}
                    </span>
                  </td>

                  <td className="p-4 font-semibold">
                    ₹{claim.claimAmount?.toLocaleString('en-IN')}
                  </td>

                  <td className="p-4">
                    {claim.approvedAmount > 0 ? (
                      <span className="text-green-600 font-semibold">
                        ₹{claim.approvedAmount?.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>

                  <td className="p-4 text-xs">
                    {new Date(claim.incidentDate).toLocaleDateString('en-IN')}
                  </td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(claim.status)}`}>
                      {claim.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/claims/${claim._id}`)}
                      className="text-xs"
                    >
                      👁️ View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <Card>
        <h3 className="font-semibold mb-3">Claims Summary</h3>
        <div className="grid grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-gray-600 uppercase text-xs">Total Claims</p>
            <p className="text-2xl font-bold">{claims.length}</p>
          </div>
          <div>
            <p className="text-gray-600 uppercase text-xs">Submitted</p>
            <p className="text-2xl font-bold text-blue-600">{claims.filter(c => c.status === "SUBMITTED").length}</p>
          </div>
          <div>
            <p className="text-gray-600 uppercase text-xs">In Review</p>
            <p className="text-2xl font-bold text-orange-600">{claims.filter(c => c.status === "IN_REVIEW").length}</p>
          </div>
          <div>
            <p className="text-gray-600 uppercase text-xs">Approved</p>
            <p className="text-2xl font-bold text-green-600">{claims.filter(c => c.status === "APPROVED").length}</p>
          </div>
          <div>
            <p className="text-gray-600 uppercase text-xs">Settled</p>
            <p className="text-2xl font-bold text-gray-600">{claims.filter(c => c.status === "SETTLED").length}</p>
          </div>
        </div>
      </Card>

      {/* Create Claim Modal */}
      {showCreateModal && (
        <ClaimCreateForm
          onSuccess={handleCreateSuccess}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default ClaimsList;
