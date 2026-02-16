import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { getTreatyById, createTreaty, updateTreaty } from "./treatyService";
import { getReinsurers } from "./reinsuranceService";
import Button from "../../shared/components/Button";
import Card from "../../shared/components/Card";
import Loader from "../../shared/components/Loader";

const TreatyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    treatyName: "",
    treatyType: "QUOTA_SHARE",
    reinsurerId: "",
    sharePercentage: "",
    retentionLimit: "",
    treatyLimit: "",
    applicableLOBs: [],
    effectiveFrom: "",
    effectiveTo: "",
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reinsurers, setReinsurers] = useState([]);

  const LOB_OPTIONS = ["HEALTH", "MOTOR","LIFE" , "PROPERTY"];

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load reinsurers
        const reinsurerData = await getReinsurers();
        setReinsurers(reinsurerData);

        // Load treaty data
        const treatyData = await getTreatyById(id);
        setFormData({
          treatyName: treatyData.treatyName,
          treatyType: treatyData.treatyType,
          reinsurerId: treatyData.reinsurerId._id || treatyData.reinsurerId,
          sharePercentage: treatyData.sharePercentage,
          retentionLimit: treatyData.retentionLimit,
          treatyLimit: treatyData.treatyLimit,
          applicableLOBs: treatyData.applicableLOBs,
          effectiveFrom: treatyData.effectiveFrom.split("T")[0], // Extract date only
          effectiveTo: treatyData.effectiveTo.split("T")[0],
          status: treatyData.status,
        });
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLOBChange = (lob) => {
    setFormData((prev) => ({
      ...prev,
      applicableLOBs: prev.applicableLOBs.includes(lob)
        ? prev.applicableLOBs.filter((item) => item !== lob)
        : [...prev.applicableLOBs, lob],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation
      if (!formData.treatyName.trim()) {
        alert("❌ Treaty name is required");
        return;
      }
      if (!formData.reinsurerId) {
        alert("❌ Please select a reinsurer");
        return;
      }
      if (formData.applicableLOBs.length === 0) {
        alert("❌ Please select at least one Line of Business");
        return;
      }

      await updateTreaty(id, formData);
      alert("✅ Treaty updated successfully");

      navigate("/reinsurance/treaties");
    } catch (err) {
      console.error("Submit failed:", err);
      alert(
        `❌ Failed: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Edit Treaty</h1>
        <p className="text-gray-600">Update the treaty details below</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          ❌ {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Treaty Name & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Treaty Name *
              </label>
              <input
                type="text"
                name="treatyName"
                value={formData.treatyName}
                onChange={handleInputChange}
                placeholder="e.g., Treaty A, Health Quota Share"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Treaty Type *
              </label>
              <select
                name="treatyType"
                value={formData.treatyType}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="QUOTA_SHARE">
                  Quota Share (Fixed % of all risks)
                </option>
                <option value="SURPLUS">
                  Surplus (Only excess above retention)
                </option>
              </select>
            </div>
          </div>

          {/* Row 1.5: Reinsurer Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Reinsurer *
            </label>
            <select
              name="reinsurerId"
              value={formData.reinsurerId}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Select Reinsurer --</option>
              {reinsurers
                .filter((r) => r.status === "ACTIVE")
                .map((reinsurer) => (
                  <option key={reinsurer._id} value={reinsurer._id}>
                    {reinsurer.name} ({reinsurer.code})
                  </option>
                ))}
            </select>
          </div>

          {/* Row 2: Share Percentage */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Share Percentage (%) *
              </label>
              <input
                type="number"
                name="sharePercentage"
                value={formData.sharePercentage}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                min="0"
                max="100"
                className="w-full border rounded px-3 py-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                For QUOTA_SHARE: Fixed percentage of all policies
              </p>
            </div>
          </div>

          {/* Row 3: Retention Limit & Treaty Limit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Retention Limit (₹) *
              </label>
              <input
                type="number"
                name="retentionLimit"
                value={formData.retentionLimit}
                onChange={handleInputChange}
                placeholder="e.g., 5000000"
                className="w-full border rounded px-3 py-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                For SURPLUS: Company keeps up to this amount
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Treaty Limit (₹) *
              </label>
              <input
                type="number"
                name="treatyLimit"
                value={formData.treatyLimit}
                onChange={handleInputChange}
                placeholder="e.g., 100000000"
                className="w-full border rounded px-3 py-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                Maximum this reinsurer will accept
              </p>
            </div>
          </div>

          {/* Lines of Business (Multi-select) */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Applicable Lines of Business *
            </label>
            <div className="space-y-2">
              {LOB_OPTIONS.map((lob) => (
                <label
                  key={lob}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.applicableLOBs.includes(lob)}
                    onChange={() => handleLOBChange(lob)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{lob}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Row 4: Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Effective From *
              </label>
              <input
                type="date"
                name="effectiveFrom"
                value={formData.effectiveFrom}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Effective To *
              </label>
              <input
                type="date"
                name="effectiveTo"
                value={formData.effectiveTo}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "⏳ Saving..." : "✓ Update Treaty"}
            </Button>

            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/reinsurance/treaties")}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Card */}
      <Card>
        <h3 className="text-lg font-semibold mb-3">Treaty Types Explained</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong className="text-blue-600">🔵 QUOTA_SHARE:</strong>
            <p>
              Reinsurer takes a fixed percentage of ALL policies under this
              treaty.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Example: 30% QUOTA_SHARE means reinsurer always takes 30% of every
              policy.
            </p>
          </div>

          <div>
            <strong className="text-orange-600">🟠 SURPLUS:</strong>
            <p>
              Reinsurer takes only the amount ABOVE the retention limit, up to
              the treaty limit.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Example: If policy is ₹10M, retention is ₹5M, excess is ₹5M.
              Reinsurer takes min(₹5M, treatyLimit).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TreatyForm;
