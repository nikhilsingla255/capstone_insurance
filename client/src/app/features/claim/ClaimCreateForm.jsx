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
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitError, setSubmitError] = useState(null);

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
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
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
      // Clear policy selection error
      if (errors.policyNumber) {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.policyNumber;
          return updated;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.claimNumber.trim()) {
      newErrors.claimNumber = "Claim number is required";
    }
    if (!selectedPolicy) {
      newErrors.policyNumber = "Please select a policy";
    }
    if (!formData.claimAmount || formData.claimAmount <= 0) {
      newErrors.claimAmount = "Claim amount must be greater than 0";
    }
    if (formData.claimAmount > selectedPolicy?.sumInsured) {
      newErrors.claimAmount = `Claim amount (₹${formData.claimAmount}) cannot exceed policy coverage (₹${selectedPolicy?.sumInsured})`;
    }
    if (!formData.incidentDate) {
      newErrors.incidentDate = "Incident date is required";
    }
    if (!formData.reportedDate) {
      newErrors.reportedDate = "Reported date is required";
    }
    if (
      formData.incidentDate &&
      formData.reportedDate &&
      new Date(formData.incidentDate) > new Date(formData.reportedDate)
    ) {
      newErrors.incidentDate = "Incident date cannot be after reported date";
    }

    setErrors(newErrors);
    setSubmitError(null);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        claimNumber: formData.claimNumber,
        policyNumber: formData.policyNumber,
        claimAmount: parseFloat(formData.claimAmount),
        incidentDate: formData.incidentDate,
        reportedDate: formData.reportedDate,
        remarks: formData.remarks || "",
      };

      await createClaim(payload);
      setSuccessMessage(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message);
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
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✅ Claim created successfully
            </div>
          )}
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              ❌ {submitError}
            </div>
          )}
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
                className={`w-full border rounded px-3 py-2 text-sm ${
                  errors.claimNumber ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.claimNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.claimNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Select Policy *
              </label>
              <select
                value={selectedPolicy?._id || ""}
                onChange={handlePolicySelect}
                disabled={loading}
                className={`w-full border rounded px-3 py-2 text-sm ${
                  errors.policyNumber ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              >
                <option value="">-- Choose Policy --</option>
                {policies.map(policy => (
                  <option key={policy._id} value={policy._id}>
                    {policy.policyNumber} ({policy.insuredName}) - ₹{policy.sumInsured.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
              {errors.policyNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.policyNumber}</p>
              )}
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
              className={`w-full border rounded px-3 py-2 text-sm ${
                errors.claimAmount ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              max={selectedPolicy?.sumInsured}
            />
            {errors.claimAmount && (
              <p className="text-red-600 text-xs mt-1">{errors.claimAmount}</p>
            )}
            {selectedPolicy && !errors.claimAmount && (
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
                className={`w-full border rounded px-3 py-2 text-sm ${
                  errors.incidentDate ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.incidentDate && (
                <p className="text-red-600 text-xs mt-1">{errors.incidentDate}</p>
              )}
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
                className={`w-full border rounded px-3 py-2 text-sm ${
                  errors.reportedDate ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.reportedDate && (
                <p className="text-red-600 text-xs mt-1">{errors.reportedDate}</p>
              )}
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
