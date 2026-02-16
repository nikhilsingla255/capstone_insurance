import { useEffect, useState } from "react";
import { getPolicies } from "../policy/policyService";
import { createClaim } from "./claimService";
import Card from "../../shared/components/Card";

const ClaimCreateForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    claimNumber: "",
    policyNumber: "",
    claimAmount: "",
    incidentDate: "",
    reportedDate: "",
    remarks: "",
  });

  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        const data = await getPolicies();
        // Filter only ACTIVE policies
        const activePolicies = data.filter(p => p.status === "ACTIVE");
        setPolicies(activePolicies);
      } catch (err) {
        console.error("Failed to load policies:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePolicySelect = (e) => {
    const policyId = e.target.value;
    const policy = policies.find(p => p._id === policyId);
    
    if (policy) {
      setSelectedPolicy(policy);
      setFormData(prev => ({
        ...prev,
        policyNumber: policy.policyNumber
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validations
      if (!formData.claimNumber.trim()) {
        alert("❌ Claim number is required");
        return;
      }
      if (!selectedPolicy) {
        alert("❌ Please select a policy");
        return;
      }
      if (!formData.claimAmount || formData.claimAmount <= 0) {
        alert("❌ Claim amount must be greater than 0");
        return;
      }
      if (formData.claimAmount > selectedPolicy.sumInsured) {
        alert(`❌ Claim amount (₹${formData.claimAmount}) cannot exceed policy coverage (₹${selectedPolicy.sumInsured})`);
        return;
      }
      if (!formData.incidentDate) {
        alert("❌ Incident date is required");
        return;
      }
      if (!formData.reportedDate) {
        alert("❌ Reported date is required");
        return;
      }

      const incidentDate = new Date(formData.incidentDate);
      const reportedDate = new Date(formData.reportedDate);

      if (incidentDate > reportedDate) {
        alert("❌ Incident date cannot be after reported date");
        return;
      }

      const payload = {
        claimNumber: formData.claimNumber,
        policyNumber: formData.policyNumber,
        claimAmount: parseFloat(formData.claimAmount),
        incidentDate: formData.incidentDate,
        reportedDate: formData.reportedDate,
        remarks: formData.remarks || "",
      };

      await createClaim(payload);
      alert("✅ Claim created successfully");
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
          <h2 className="text-2xl font-bold">Create New Claim</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Claim Number & Policy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Claim Number *
              </label>
              <input
                type="text"
                name="claimNumber"
                value={formData.claimNumber}
                onChange={handleInputChange}
                placeholder="e.g., CLM001"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Select Policy *
              </label>
              <select
                value={selectedPolicy?._id || ""}
                onChange={handlePolicySelect}
                disabled={loading}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">-- Choose Policy --</option>
                {policies.map(policy => (
                  <option key={policy._id} value={policy._id}>
                    {policy.policyNumber} ({policy.insuredName}) - ₹{policy.sumInsured.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Policy Info */}
          {selectedPolicy && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm"><strong>Insured:</strong> {selectedPolicy.insuredName}</p>
              <p className="text-sm"><strong>Type:</strong> {selectedPolicy.insuredType}</p>
              <p className="text-sm"><strong>LOB:</strong> {selectedPolicy.lineOfBusiness}</p>
              <p className="text-sm"><strong>Sum Insured:</strong> ₹{selectedPolicy.sumInsured?.toLocaleString('en-IN')}</p>
            </div>
          )}

          {/* Row 2: Claim Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Claim Amount *
            </label>
            <input
              type="number"
              name="claimAmount"
              value={formData.claimAmount}
              onChange={handleInputChange}
              placeholder={selectedPolicy ? `Max: ₹${selectedPolicy.sumInsured.toLocaleString('en-IN')}` : "Enter claim amount"}
              className="w-full border rounded px-3 py-2 text-sm"
              max={selectedPolicy?.sumInsured}
            />
            {selectedPolicy && (
              <p className="text-xs text-gray-500 mt-1">
                Max: ₹{selectedPolicy.sumInsured?.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          {/* Row 3: Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Incident Date *
              </label>
              <input
                type="date"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Reported Date *
              </label>
              <input
                type="date"
                name="reportedDate"
                value={formData.reportedDate}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Remarks (Optional)
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Add any additional details..."
              rows="3"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              ✅ Create Claim
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

export default ClaimCreateForm;
