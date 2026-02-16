import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { approvePolicy, deletePolicy } from "./policyService";
import Button from "../../shared/components/Button";

const PolicyActions = ({ policy, refresh }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const canApprove =
    policy.status === "DRAFT" &&
    (user?.role === "UNDERWRITER" || user?.role === "ADMIN");

  const handleApprove = async () => {
    if (!window.confirm("Approve this policy? Reinsurance allocation will be calculated.")) {
      return;
    }

    setLoading(true);
    try {
      const result = await approvePolicy(policy.policyNumber);
      console.log("✅ Policy approved:", result);
      
      // Check if allocation was created
      const allocation = result.allocation;
      const hasAllocation = allocation && allocation.retainedAmount !== undefined;
      
      if (hasAllocation) {
        // Allocation was calculated
        const cededAmount = policy.sumInsured - allocation.retainedAmount;
        alert(
          `✅ Policy approved!\n\nReinsurance Allocation:\n` +
          `- Company retained: ₹${allocation.retainedAmount.toLocaleString()}\n` +
          `- Ceded to reinsurers: ₹${cededAmount.toLocaleString()}`
        );
      } else {
        // No matching treaty, no reinsurance allocated
        alert(
          `✅ Policy approved!\n\n⚠️ No matching treaty found.\n` +
          `Company retains full risk: ₹${policy.sumInsured.toLocaleString()}`
        );
      }
      
      if (refresh) {
        refresh();
      }
      
      // Navigate to policy details to see full details
      navigate(`/policies/${policy._id}`, {
        state: { allocation: result.allocation }
      });
    } catch (err) {
      console.error("❌ Approval failed:", err);
      alert(`❌ Failed to approve: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this policy?")) {
      return;
    }

    setLoading(true);
    try {
      await deletePolicy(policy._id);
      alert("✅ Policy deleted");
      if (refresh) {
        refresh();
      }
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert(`❌ Delete failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/policies/${policy._id}`);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {canApprove && (
        <Button
          variant="primary"
          onClick={handleApprove}
          disabled={loading}
          className="text-xs"
        >
          {loading ? "⏳ Approving..." : "✓ Approve"}
        </Button>
      )}

      {policy.status === "DRAFT" && (
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={loading}
          className="text-xs"
        >
          {loading ? "⏳ Deleting..." : "🗑 Delete"}
        </Button>
      )}

      <Button
        variant="secondary"
        onClick={handleViewDetails}
        className="text-xs"
      >
        👁 View
      </Button>
    </div>
  );
};

export default PolicyActions;