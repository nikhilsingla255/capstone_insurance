import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { getTreaties, deleteTreaty, createTreaty } from "./treatyService";
import { getReinsurers } from "./reinsuranceService";
import Button from "../../shared/components/Button";
import Loader from "../../shared/components/Loader";
import Card from "../../shared/components/Card";

const TreatyList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [treaties, setTreaties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);

  const canCreate =
    user?.role === "REINSURANCE_ANALYST";

  const loadTreaties = async () => {
    try {
      setLoading(true);
      const data = await getTreaties();
      setTreaties(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load treaties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreaties();
  }, []);

  const handleEdit = (treatyId) => {
    navigate(`/reinsurance/treaties/${treatyId}/edit`);
  };

  const handleDelete = async (treatyId, treatyName) => {
    setDeleteModal({ treatyId, treatyName });
    setDeleteMessage(null);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;

    try {
      await deleteTreaty(deleteModal.treatyId);
      setDeleteMessage({ type: "success", text: "Treaty deleted successfully" });
      setTimeout(() => {
        setDeleteModal(null);
        loadTreaties();
      }, 1500);
    } catch (err) {
      setDeleteMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete treaty",
      });
    }
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadTreaties(); // Reload list
  };

  const [showCreateModal, setShowCreateModal] = useState(false);

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
          <h1 className="text-2xl font-bold">Reinsurance Treaties</h1>
          <p className="text-gray-600">Manage reinsurance agreements</p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={handleCreateNew}>
            ➕ Create Treaty
          </Button>
        )}
      </div>

      {/* Treaties Table */}
      {treaties.length === 0 ? (
        <Card>
          <p className="text-gray-600 text-center py-8">
            No treaties found. {canCreate && "Create one to get started."}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left border-b">
              <tr>
                <th className="p-4">Treaty Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Reinsurer</th>
                <th className="p-4">Share %</th>
                <th className="p-4">LOB</th>
                <th className="p-4">Valid From-To</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {treaties.map((treaty) => (
                <tr key={treaty._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{treaty.treatyName}</td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        treaty.treatyType === "QUOTA_SHARE"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {treaty.treatyType}
                    </span>
                  </td>

                  <td className="p-4">
                    {treaty.reinsurerId?.name || "N/A"}
                    <br />
                    <span className="text-xs text-gray-500">
                      {treaty.reinsurerId?.code}
                    </span>
                  </td>

                  <td className="p-4 font-semibold">
                    {treaty.sharePercentage}%
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {treaty.applicableLOBs?.map((lob) => (
                        <span
                          key={lob}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                        >
                          {lob}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 text-xs">
                    {new Date(treaty.effectiveFrom).toLocaleDateString()} -
                    <br />
                    {new Date(treaty.effectiveTo).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        treaty.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {treaty.status === "ACTIVE" ? "✓ ACTIVE" : "✕ EXPIRED"}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      {canCreate && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(treaty._id)}
                            className="text-xs"
                          >
                            ✏️ Edit
                          </Button>

                          <Button
                            variant="danger"
                            onClick={() =>
                              handleDelete(treaty._id, treaty.treatyName)
                            }
                            className="text-xs"
                          >
                            🗑️ Delete
                          </Button>
                        </>
                      )}
                      {!canCreate && (
                        <span className="text-gray-500 text-xs">
                          Read-only
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Card */}
      <Card>
        <h3 className="text-lg font-semibold mb-3">About Treaties</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>QUOTA_SHARE:</strong> Reinsurer takes a fixed percentage of
            all policies written under this treaty.
          </p>
          <p>
            <strong>SURPLUS:</strong> Reinsurer takes only the excess amount
            above the retention limit, up to the treaty limit.
          </p>
          <p>
            Only <strong>ACTIVE</strong> treaties are used for reinsurance
            allocation when policies are approved.
          </p>
        </div>
      </Card>

      {/* Create Treaty Modal */}
      {showCreateModal && (
        <CreateTreatyModal
          onSuccess={handleCreateSuccess}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm">
            {deleteMessage ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg text-center ${
                    deleteMessage.type === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {deleteMessage.type === "success" ? "✅" : "❌"} {deleteMessage.text}
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Delete Treaty?</h2>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete <strong>"{deleteModal.treatyName}"</strong>? This action
                  cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

// Create Treaty Modal Component
const CreateTreatyModal = ({ onSuccess, onClose }) => {
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

  const [submitting, setSubmitting] = useState(false);
  const [reinsurers, setReinsurers] = useState([]);
  const [loadingReinsurers, setLoadingReinsurers] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const LOB_OPTIONS = ["HEALTH", "MOTOR", "LIFE", "PROPERTY"];

  // Load reinsurers on modal open
  useEffect(() => {
    const loadReinsurers = async () => {
      try {
        const data = await getReinsurers();
        setReinsurers(data);
      } catch (err) {
        console.error("Failed to load reinsurers:", err);
      } finally {
        setLoadingReinsurers(false);
      }
    };
    loadReinsurers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleLOBChange = (lob) => {
    setFormData((prev) => ({
      ...prev,
      applicableLOBs: prev.applicableLOBs.includes(lob)
        ? prev.applicableLOBs.filter((item) => item !== lob)
        : [...prev.applicableLOBs, lob],
    }));
    // Clear error for LOBs when user makes changes
    if (errors.applicableLOBs) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.applicableLOBs;
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!formData.treatyName.trim()) {
      newErrors.treatyName = "Treaty name is required";
    }
    if (!formData.reinsurerId) {
      newErrors.reinsurerId = "Please select a reinsurer";
    }
    if (!formData.sharePercentage || formData.sharePercentage <= 0 || formData.sharePercentage > 100) {
      newErrors.sharePercentage = "Share percentage must be between 1 and 100";
    }
    if (!formData.retentionLimit || formData.retentionLimit <= 0) {
      newErrors.retentionLimit = "Retention limit must be greater than 0";
    }
    if (!formData.treatyLimit || formData.treatyLimit <= 0) {
      newErrors.treatyLimit = "Treaty limit must be greater than 0";
    }
    if (formData.applicableLOBs.length === 0) {
      newErrors.applicableLOBs = "Please select at least one Line of Business";
    }
    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = "Effective from date is required";
    }
    if (!formData.effectiveTo) {
      newErrors.effectiveTo = "Effective to date is required";
    }
    if (
      formData.effectiveFrom &&
      formData.effectiveTo &&
      new Date(formData.effectiveTo) <= new Date(formData.effectiveFrom)
    ) {
      newErrors.effectiveTo = "Effective to must be after effective from";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      await createTreaty(formData);
      setSuccessMessage("Treaty created successfully!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Treaty</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}
          {/* Row 1: Treaty Name & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Treaty Name *
              </label>
              <input
                type="text"
                name="treatyName"
                value={formData.treatyName}
                onChange={handleInputChange}
                placeholder="e.g., Health Quota Share"
                className={`w-full border rounded px-3 py-2 text-sm ${
                  errors.treatyName ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.treatyName && (
                <p className="text-red-600 text-xs mt-1">{errors.treatyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Treaty Type *
              </label>
              <select
                name="treatyType"
                value={formData.treatyType}
                onChange={handleInputChange}
                className={`w-full border rounded px-3 py-2 text-sm ${
                  errors.treatyType ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              >
                <option value="QUOTA_SHARE">Quota Share</option>
                <option value="SURPLUS">Surplus</option>
              </select>
              {errors.treatyType && (
                <p className="text-red-600 text-xs mt-1">{errors.treatyType}</p>
              )}
            </div>
          </div>

          {/* Row 1.5: Reinsurer Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Reinsurer *
            </label>
            {loadingReinsurers ? (
              <div className="text-sm text-gray-500">Loading reinsurers...</div>
            ) : (
              <>
                <select
                  name="reinsurerId"
                  value={formData.reinsurerId}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 text-sm ${
                    errors.reinsurerId ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
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
                {errors.reinsurerId && (
                  <p className="text-red-600 text-xs mt-1">{errors.reinsurerId}</p>
                )}
              </>
            )}
          </div>

          {/* Row 2: Share Percentage */}
          <div>
            <label className="block text-sm font-medium mb-1">
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
              className={`w-full border rounded px-3 py-2 text-sm ${
                errors.sharePercentage ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.sharePercentage && (
              <p className="text-red-600 text-xs mt-1">{errors.sharePercentage}</p>
            )}
          </div>

          {/* Row 3: Retention & Treaty Limit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Retention Limit (₹) *
              </label>
              <input
                type="number"
                name="retentionLimit"
                value={formData.retentionLimit}
                onChange={handleInputChange}
                placeholder="e.g., 5000000"
                className={`w-full border rounded px-3 py-2 text-sm ${
                  errors.retentionLimit ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.retentionLimit && (
                <p className="text-red-600 text-xs mt-1">{errors.retentionLimit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Treaty Limit (₹) *
              </label>
              <input
                type="number"
                name="treatyLimit"
                value={formData.treatyLimit}
                onChange={handleInputChange}
                placeholder="e.g., 10000000"
                className={`w-full border rounded px-3 py-2 text-sm ${
                  errors.treatyLimit ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.treatyLimit && (
                <p className="text-red-600 text-xs mt-1">{errors.treatyLimit}</p>
              )}
            </div>
          </div>

          {/* Row 4: LOB Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">LOBs *</label>
            <div className={`flex gap-4 p-2 rounded ${
              errors.applicableLOBs ? "bg-red-50 border border-red-500" : ""
            }`}>
              {LOB_OPTIONS.map((lob) => (
                <label key={lob} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.applicableLOBs.includes(lob)}
                    onChange={() => handleLOBChange(lob)}
                    className="mr-2"
                  />
                  <span className="text-sm">{lob}</span>
                </label>
              ))}
            </div>
            {errors.applicableLOBs && (
              <p className="text-red-600 text-xs mt-1">{errors.applicableLOBs}</p>
            )}
          </div>

          {/* Row 5: Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Effective From *
              </label>
              <input
                type="date"
                name="effectiveFrom"
                value={formData.effectiveFrom}
                onChange={handleInputChange}
                className={`w-full border rounded px-3 py-2 text-sm ${
                  errors.effectiveFrom ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.effectiveFrom && (
                <p className="text-red-600 text-xs mt-1">{errors.effectiveFrom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Effective To *
              </label>
              <input
                type="date"
                name="effectiveTo"
                value={formData.effectiveTo}
                onChange={handleInputChange}
                className={`w-full border rounded px-3 py-2 text-sm ${
                  errors.effectiveTo ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.effectiveTo && (
                <p className="text-red-600 text-xs mt-1">{errors.effectiveTo}</p>
              )}
            </div>
          </div>

          {/* Row 6: Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`w-full border rounded px-3 py-2 text-sm ${
                errors.status ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
            {errors.status && (
              <p className="text-red-600 text-xs mt-1">{errors.status}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              ✅ Create Treaty
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded font-semibold hover:bg-gray-400 text-sm"
            >
              ✕ Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TreatyList;
