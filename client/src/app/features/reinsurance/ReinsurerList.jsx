import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { getReinsurers, createReinsurer, deleteReinsurer, updateReinsurer } from "./reinsurerService";
import Button from "../../shared/components/Button";
import Loader from "../../shared/components/Loader";
import Card from "../../shared/components/Card";

const ReinsurerList = () => {
  const { user } = useAuth();
  const [reinsurers, setReinsurers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReinsurer, setEditingReinsurer] = useState(null);

  const canCreate = user?.role === "REINSURANCE_ANALYST";

  const loadReinsurers = async () => {
    try {
      setLoading(true);
      const data = await getReinsurers();
      setReinsurers(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load reinsurers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReinsurers();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadReinsurers(); // Reload list
  };

  const handleDelete = async (reinsurerId, reinsurerName) => {
    if (!window.confirm(`Are you sure you want to delete "${reinsurerName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteReinsurer(reinsurerId);
      alert("✅ Reinsurer deleted successfully");
      loadReinsurers(); // Reload list
    } catch (err) {
      alert(`❌ Failed to delete: ${err.response?.data?.message || err.message}`);
    }
  };

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
          <h1 className="text-2xl font-bold">Reinsurers</h1>
          <p className="text-gray-600">Manage reinsurer companies</p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            ➕ Add Reinsurer
          </Button>
        )}
      </div>

      {/* Reinsurers Table */}
      {reinsurers.length === 0 ? (
        <Card>
          <p className="text-gray-600 text-center py-8">
            No reinsurers found. {canCreate && "Create one to get started."}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left border-b">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Code</th>
                <th className="p-4">Country</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Contact Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {reinsurers.map((reinsurer) => (
                <tr key={reinsurer._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{reinsurer.name}</td>

                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                      {reinsurer.code}
                    </span>
                  </td>

                  <td className="p-4">{reinsurer.country}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        reinsurer.rating === "AAA"
                          ? "bg-green-100 text-green-800"
                          : reinsurer.rating === "AA"
                            ? "bg-blue-100 text-blue-800"
                            : reinsurer.rating === "A"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {reinsurer.rating}
                    </span>
                  </td>

                  <td className="p-4 text-xs">{reinsurer.contactEmail}</td>

                  <td className="p-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        reinsurer.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {reinsurer.status === "ACTIVE" ? "✓ ACTIVE" : "✕ INACTIVE"}
                    </span>
                  </td>

                  <td className="p-4">
                    {canCreate && (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditingReinsurer(reinsurer);
                            setShowEditModal(true);
                          }}
                          className="text-xs"
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(reinsurer._id, reinsurer.name)}
                          className="text-xs"
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Card */}
      <Card>
        <h3 className="text-lg font-semibold mb-3">About Reinsurers</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Reinsurers:</strong> Companies that provide reinsurance coverage to your insurance company.
          </p>
          <p>
            <strong>Ratings:</strong> Credit ratings (AAA = highest, BBB = lowest) indicate reinsurer financial strength.
          </p>
          <p>
            <strong>Status:</strong> Only <strong>ACTIVE</strong> reinsurers can be selected when creating treaties.
          </p>
        </div>
      </Card>

      {/* Create Reinsurer Modal */}
      {showCreateModal && (
        <CreateReinsurerModal
          onSuccess={handleCreateSuccess}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Reinsurer Modal */}
      {showEditModal && editingReinsurer && (
        <EditReinsurerModal
          reinsurer={editingReinsurer}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingReinsurer(null);
            loadReinsurers();
          }}
          onClose={() => {
            setShowEditModal(false);
            setEditingReinsurer(null);
          }}
        />
      )}
    </div>
  );
};

// Create Reinsurer Modal Component
const CreateReinsurerModal = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    country: "",
    rating: "AA",
    contactEmail: "",
    status: "ACTIVE",
  });

  const [submitting, setSubmitting] = useState(false);
  const COUNTRIES = ["India", "USA", "UK", "Germany", "Singapore", "Japan", "Australia"];
  const RATINGS = ["AAA", "AA", "A", "BBB"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        alert("❌ Name is required");
        return;
      }
      if (!formData.code.trim()) {
        alert("❌ Code is required");
        return;
      }
      if (!formData.country) {
        alert("❌ Please select a country");
        return;
      }
      if (!formData.contactEmail.trim()) {
        alert("❌ Contact email is required");
        return;
      }
      // Simple email validation
      if (!formData.contactEmail.includes("@")) {
        alert("❌ Please enter a valid email address");
        return;
      }

      await createReinsurer(formData);
      alert("✅ Reinsurer created successfully");
      onSuccess();
    } catch (err) {
      alert(`❌ Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add New Reinsurer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name & Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Reinsurer Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Swiss Re, Munich Re"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., SRE, MRE"
                className="w-full border rounded px-3 py-2 text-sm uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier (will be uppercase)</p>
            </div>
          </div>

          {/* Row 2: Country & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Country *
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">-- Select Country --</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Credit Rating *
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {RATINGS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">AAA = Best, BBB = Acceptable</p>
            </div>
          </div>

          {/* Row 3: Contact Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Email *
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              placeholder="e.g., contact@reinsurer.com"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Row 4: Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              ✅ Create Reinsurer
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

export default ReinsurerList;

// Edit Reinsurer Modal Component
const EditReinsurerModal = ({ reinsurer, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: reinsurer.name || "",
    code: reinsurer.code || "",
    country: reinsurer.country || "",
    rating: reinsurer.rating || "AA",
    contactEmail: reinsurer.contactEmail || "",
    status: reinsurer.status || "ACTIVE",
  });

  const [submitting, setSubmitting] = useState(false);
  const COUNTRIES = ["India", "USA", "UK", "Germany", "Singapore", "Japan", "Australia"];
  const RATINGS = ["AAA", "AA", "A", "BBB"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Basic validation
      if (!formData.name.trim()) throw new Error("Name is required");
      if (!formData.code.trim()) throw new Error("Code is required");
      if (!formData.country) throw new Error("Country is required");
      if (!formData.contactEmail.trim() || !formData.contactEmail.includes("@")) throw new Error("Valid contact email is required");

      await updateReinsurer(reinsurer._id, formData);
      onSuccess();
    } catch (err) {
      // simple inline error handling via alert to match existing style
      alert(`❌ Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Reinsurer</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reinsurer Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm uppercase" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Country *</label>
              <select name="country" value={formData.country} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm">
                <option value="">-- Select Country --</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Credit Rating *</label>
              <select name="rating" value={formData.rating} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm">
                {RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contact Email *</label>
            <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 text-sm">✅ Save</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded font-semibold hover:bg-gray-400 text-sm">✕ Cancel</button>
          </div>
        </form>
      </Card>
    </div>
  );
};
