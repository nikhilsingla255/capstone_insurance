import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPolicyById } from "../policy/policyService";
import { getRiskAllocation } from "./reinsuranceService";
import AllocationSummary from "./AllocationSummary";
import AllocationTable from "./AllocationTable";
import AllocationValidation from "./AllocationValidation";
import Loader from "../../shared/components/Loader";
import Card from "../../shared/components/Card";

const RiskAllocationView = () => {
  const { policyId } = useParams();
  const [policy, setPolicy] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load policy
        const policyData = await getPolicyById(policyId);
        setPolicy(policyData);

        // Load risk allocation (only if policy is ACTIVE)
        if (policyData.status === "ACTIVE") {
          const allocationData = await getRiskAllocation(policyId);
          setAllocation(allocationData);
        } else {
          setError("Risk allocation is only available for ACTIVE policies.");
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load allocation data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [policyId]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
        ❌ {error}
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
        ⚠️ Policy not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Risk Allocation</h1>
        <p className="text-gray-600 mt-1">
          Policy <span className="font-semibold">{policy.policyNumber}</span> - 
          {policy.insuredName}
        </p>
      </div>

      {/* Policy Overview Card */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase">Sum Insured</p>
            <p className="text-xl font-bold">₹{policy.sumInsured?.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase">Retention Limit</p>
            <p className="text-xl font-bold">₹{policy.retentionLimit?.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase">Insurance Type</p>
            <p className="text-lg font-semibold">{policy.lineOfBusiness}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase">Status</p>
            <p className={`text-lg font-semibold ${policy.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}`}>
              {policy.status}
            </p>
          </div>
        </div>
      </Card>

      {/* Allocation Summary */}
      {allocation ? (
        <>
          <AllocationSummary policy={policy} allocation={allocation} />
          <AllocationValidation policy={policy} allocation={allocation} />
          <AllocationTable allocation={allocation} />
        </>
      ) : (
        <Card>
          <p className="text-gray-600 text-center py-8">
            ℹ️ No risk allocation found. Policy may not be approved yet.
          </p>
        </Card>
      )}

      {/* Info Section */}
      <Card className="bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">About Risk Allocation</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Automatic Calculation:</strong> When a policy is approved, the system automatically calculates how much 
            risk is retained by your company and how much is ceded to reinsurers based on active treaties.
          </p>
          <p>
            <strong>Treaty Rules:</strong> Different treaties (QUOTA_SHARE or SURPLUS) apply different allocation methods to 
            distribute risk appropriately.
          </p>
          <p>
            <strong>Compliance:</strong> All allocations are immutable historical records used for claims settlement and 
            regulatory reporting.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RiskAllocationView;
