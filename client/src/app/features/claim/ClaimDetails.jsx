import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClaimById } from "./claimService";
import { getRiskAllocation } from "../reinsurance/reinsuranceService";
import ClaimStatusTimeline from "./ClaimStatusTimeline";
import ClaimActionPanel from "./ClaimActionPanel";
import ClaimNotes from "./ClaimNotes";
import Loader from "../../shared/components/Loader";
import Card from "../../shared/components/Card";

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load claim
        const claimData = await getClaimById(id);
        setClaim(claimData);

        // Load risk allocation if policy has one
        if (claimData.policyId?._id) {
          try {
            const allocationData = await getRiskAllocation(claimData.policyId._id);
            setAllocation(allocationData);
          } catch (err) {
            console.log("No allocation found for policy");
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load claim details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);
console.log("allocation", allocation);
  const handleStatusChange = (updated) => {
    setClaim(updated);
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/claims")}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to Claims
        </button>
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          ❌ {error}
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/claims")}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to Claims
        </button>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
          ⚠️ Claim not found
        </div>
      </div>
    );
  }

  const policy = claim.policyId;

  // Safe numeric helpers to avoid NaN when policy or allocation values are missing
  const sumInsured = Number(policy?.sumInsured) || 0;
  const cededTotal = allocation
    ? allocation.allocations.reduce((sum, a) => sum + (Number(a.allocatedAmount) || 0), 0)
    : 0;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/claims")}
          className="text-blue-600 hover:text-blue-800 font-semibold mb-2"
        >
          ← Back to Claims
        </button>
        <h1 className="text-3xl font-bold">{claim.claimNumber}</h1>
        <p className="text-gray-600 mt-1">
          Policy: <span className="font-semibold">{policy?.policyNumber}</span> - {policy?.insuredName}
        </p>
      </div>

      {/* Claim Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-gray-600 uppercase">Claim Amount</p>
          <p className="text-2xl font-bold text-blue-600">₹{claim.claimAmount?.toLocaleString('en-IN')}</p>
        </Card>

        <Card>
          <p className="text-xs text-gray-600 uppercase">Approved Amount</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{(claim.approvedAmount || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-gray-600 uppercase">Status</p>
          <p className="text-lg font-bold">{claim.status}</p>
        </Card>

        <Card>
          <p className="text-xs text-gray-600 uppercase">Incident Date</p>
          <p className="text-lg font-bold">{new Date(claim.incidentDate).toLocaleDateString('en-IN')}</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Timeline & Actions */}
        <div className="col-span-2 space-y-6">
          {/* Status Timeline */}
          <ClaimStatusTimeline claim={claim} />

          {/* Policy Details */}
          <Card>
            <h3 className="text-lg font-bold mb-4">Policy Details</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Insured Name</p>
                  <p className="font-semibold">{policy?.insuredName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Insured Type</p>
                  <p className="font-semibold">{policy?.insuredType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Line of Business</p>
                  <p className="font-semibold">{policy?.lineOfBusiness}</p>
                </div>
                <div>
                  <p className="text-gray-600">Sum Insured</p>
                  <p className="font-semibold">₹{policy?.sumInsured?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Premium</p>
                  <p className="font-semibold">₹{policy?.premium?.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold">{policy?.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Effective From</p>
                  <p className="font-semibold">{new Date(policy?.effectiveFrom).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Effective To</p>
                  <p className="font-semibold">{new Date(policy?.effectiveTo).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Risk Allocation (if available) */}
          {allocation && (
            <Card>
              <h3 className="text-lg font-bold mb-4">Reinsurance Allocation</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-gray-600 text-xs">Company Retained</p>
                    <p className="text-lg font-bold text-green-600">
                      ₹{(Number(allocation?.retainedAmount) || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ({sumInsured > 0 ? (((Number(allocation?.retainedAmount) || 0) / sumInsured) * 100).toFixed(2) : "0.00"}%)
                    </p>
                  </div>

                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-gray-600 text-xs">Ceded to Reinsurers</p>
                    <p className="text-lg font-bold text-red-600">
                      ₹{cededTotal.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ({sumInsured > 0 ? ((cededTotal / sumInsured) * 100).toFixed(2) : "0.00"}%)
                    </p>
                  </div>
                </div>

                {/* Reinsurer Breakdown */}
                <div className="border-t pt-3">
                  <p className="font-semibold text-xs mb-2">Reinsurer Breakdown:</p>
                  <div className="space-y-2">
                    {allocation.allocations.map((alloc, idx) => {
                      const amount = Number(alloc.allocatedAmount) || 0;
                      const pct = typeof alloc.allocatedPercentage === 'number'
                        ? alloc.allocatedPercentage.toFixed(2)
                        : sumInsured > 0
                          ? ((amount / sumInsured) * 100).toFixed(2)
                          : '0.00';

                      return (
                        <div key={idx} className="bg-gray-50 p-2 rounded text-xs flex justify-end items-center">
                          <span className="font-semibold">₹{amount.toLocaleString('en-IN')} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Claim Notes */}
          <ClaimNotes claim={claim} onUpdate={setClaim} />
        </div>

        {/* Right Column - Actions */}
        <div>
          <ClaimActionPanel claim={claim} onStatusChange={handleStatusChange} />
        </div>
      </div>

      {/* Claim Dates Timeline */}
      <Card>
        <h3 className="text-lg font-bold mb-4">Important Dates</h3>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Incident Date</p>
              <p className="font-semibold">{new Date(claim.incidentDate).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-gray-600">Reported Date</p>
              <p className="font-semibold">{new Date(claim.reportedDate).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            <div>
              <p className="text-gray-600">Created At</p>
              <p className="font-semibold">{new Date(claim.createdAt).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="font-semibold">{new Date(claim.updatedAt).toLocaleString('en-IN')}</p>
            </div>
          </div>

          {claim.handledBy && (
            <div className="pt-3 border-t">
              <p className="text-gray-600">Handled By</p>
              <p className="font-semibold">{claim.handledBy?.username || "System"}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ClaimDetails;
