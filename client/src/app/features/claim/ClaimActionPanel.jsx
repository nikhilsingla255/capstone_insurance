import { useState } from "react";
import { reviewClaim, approveClaim, rejectClaim, settleClaim } from "./claimService";
import Button from "../../shared/components/Button";
import Card from "../../shared/components/Card";
import { useAuth } from "../../providers/AuthProvider";

const ClaimActionPanel = ({ claim, onStatusChange }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState(claim?.claimAmount || 0);
  const [approveRemarks, setApproveRemarks] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const canModify = user?.role === "CLAIMS_ADJUSTER" || user?.role === "ADMIN";

  const handleReview = async () => {
    try {
      setLoading(true);
      const updated = await reviewClaim(claim._id);
      alert("✅ Claim moved to IN_REVIEW");
      onStatusChange(updated);
    } catch (err) {
      alert(`❌ Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      if (approvedAmount > claim.claimAmount) {
        alert(`❌ Approved amount cannot exceed claim amount (₹${claim.claimAmount.toLocaleString('en-IN')})`);
        return;
      }
      if (approvedAmount <= 0) {
        alert("❌ Approved amount must be greater than 0");
        return;
      }
      if (!approveRemarks || !approveRemarks.trim()) {
        alert("❌ Remarks are required when approving a claim");
        return;
      }

      setLoading(true);
      const updated = await approveClaim(claim._id, parseFloat(approvedAmount), approveRemarks);
      alert("✅ Claim approved");
      setShowApproveModal(false);
      setApproveRemarks("");
      onStatusChange(updated);
    } catch (err) {
      alert(`❌ Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectRemarks || !rejectRemarks.trim()) {
      alert("❌ Remarks are required when rejecting a claim");
      return;
    }

    try {
      setLoading(true);
      const updated = await rejectClaim(claim._id, rejectRemarks);
      alert("✅ Claim rejected");
      setShowRejectModal(false);
      setRejectRemarks("");
      onStatusChange(updated);
    } catch (err) {
      alert(`❌ Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!window.confirm("Are you sure you want to settle this claim?")) return;

    try {
      setLoading(true);
      const updated = await settleClaim(claim._id);
      alert("✅ Claim settled");
      onStatusChange(updated);
    } catch (err) {
      alert(`❌ Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!canModify) {
    return (
      <Card className="bg-gray-50">
        <p className="text-sm text-gray-600">You don't have permission to modify this claim.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-bold mb-4">Actions</h3>

      <div className="space-y-3">
        {/* SUBMITTED → Review */}
        {claim.status === "SUBMITTED" && (
          <Button
            variant="primary"
            onClick={handleReview}
            disabled={loading}
            className="w-full"
          >
            📋 Move to Review
          </Button>
        )}

        {/* IN_REVIEW → Approve / Reject */}
        {claim.status === "IN_REVIEW" && (
          <>
            <Button
              variant="primary"
              onClick={() => setShowApproveModal(true)}
              disabled={loading}
              className="w-full"
            >
              ✅ Approve Claim
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="w-full"
            >
              ❌ Reject Claim
            </Button>
          </>
        )}

        {/* APPROVED → Settle */}
        {claim.status === "APPROVED" && (
          <Button
            variant="primary"
            onClick={handleSettle}
            disabled={loading}
            className="w-full"
          >
            💰 Settle Claim
          </Button>
        )}

        {/* REJECTED / SETTLED → No actions */}
        {(claim.status === "REJECTED" || claim.status === "SETTLED") && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              ℹ️ No actions available for {claim.status} claims.
            </p>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Approve Claim</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Claim Amount</p>
                <p className="text-2xl font-bold">₹{claim.claimAmount?.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Approved Amount (Max: ₹{claim.claimAmount?.toLocaleString('en-IN')})
                </label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  max={claim.claimAmount}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Remarks (required)</label>
                <textarea
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value)}
                  rows={4}
                  placeholder="Enter remarks explaining approval decision..."
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded font-semibold hover:bg-gray-400"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Reject Claim</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Remarks (required)</label>
                <textarea
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  rows={4}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 disabled:bg-gray-400"
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded font-semibold hover:bg-gray-400"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default ClaimActionPanel;
