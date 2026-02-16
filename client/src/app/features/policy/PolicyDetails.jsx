import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getPolicyById } from "./policyService";
import { getRiskAllocation } from "../reinsurance/reinsuranceService";
import PolicyStatusBadge from "./PolicyStatusBadge";
import AllocationSummary from "../reinsurance/AllocationSummary";
import Loader from "../../shared/components/Loader";
import Card from "../../shared/components/Card";

const PolicyDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [allocation, setAllocation] = useState(location.state?.allocation || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPolicyAndAllocation = async () => {
      try {
        // Fetch policy details
        const policyData = await getPolicyById(id);
        setPolicy(policyData);

        // Fetch risk allocation if policy is ACTIVE or has allocation
        if (policyData.status === "ACTIVE" || policyData.status === "SUSPENDED") {
          try {
            const allocationData = await getRiskAllocation(id);
            setAllocation(allocationData);
          } catch (err) {
            console.log("No allocation found (okay for DRAFT):", err.message);
          }
        }
      } catch (err) {
        console.error("Error loading policy:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPolicyAndAllocation();
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/policies")}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to Policies
        </button>
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          ❌ {error}
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/policies")}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to Policies
        </button>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
          ⚠️ Policy not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/policies")}
        className="text-blue-600 hover:text-blue-800 font-semibold"
      >
        ← Back to Policies
      </button>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{policy.policyNumber}</h1>
          <p className="text-gray-600">{policy.insuredName}</p>
        </div>
        <div>
          <PolicyStatusBadge status={policy.status} />
        </div>
      </div>

      {/* Policy Details Card */}
      <Card>
        <h2 className="text-xl font-semibold mb-6">Policy Information</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-600 uppercase mb-1">Policy Number</p>
            <p className="text-lg font-semibold">{policy.policyNumber}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 uppercase mb-1">Insured Name</p>
            <p className="text-lg font-semibold">{policy.insuredName}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 uppercase mb-1">Insured Type</p>
            <p className="text-lg font-semibold">{policy.insuredType}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 uppercase mb-1">Line of Business</p>
            <p className="text-lg font-semibold">{policy.lineOfBusiness}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 uppercase mb-1">Sum Insured</p>
            <p className="text-lg font-semibold">₹{policy.sumInsured?.toLocaleString()}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 uppercase mb-1">Premium</p>
            <p className="text-lg font-semibold">₹{policy.premium?.toLocaleString()}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 uppercase mb-1">Retention Limit</p>
            <p className="text-lg font-semibold">₹{policy.retentionLimit?.toLocaleString()}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 uppercase mb-1">Status</p>
            <PolicyStatusBadge status={policy.status} />
          </div>

          <div>
            <p className="text-xs text-gray-600 uppercase mb-1">Effective From</p>
            <p className="text-lg font-semibold">
              {new Date(policy.effectiveFrom).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600 uppercase mb-1">Effective To</p>
            <p className="text-lg font-semibold">
              {new Date(policy.effectiveTo).toLocaleDateString()}
            </p>
          </div>

          {policy.approvedBy && (
            <>
              <div>
                <p className="text-xs text-gray-600 uppercase mb-1">Approved By</p>
                <p className="text-lg font-semibold">{policy.approvedBy.email || policy.approvedBy}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 uppercase mb-1">Created By</p>
                <p className="text-lg font-semibold">{policy.createdBy.email || policy.createdBy}</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Reinsurance Allocation (if ACTIVE) */}
      {allocation && policy.status === "ACTIVE" && (
        <AllocationSummary 
          policy={policy} 
          allocation={allocation} 
        />
      )}

      {policy.status === "DRAFT" && !allocation && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-blue-800">
            ℹ️ This policy is in DRAFT status. Approve it to calculate reinsurance allocation.
          </p>
        </div>
      )}
    </div>
  );
};

export default PolicyDetails;
