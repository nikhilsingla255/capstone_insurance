const PolicyStepCoverage = ({ formData, setFormData, errors = {}, setErrors = () => {} }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Sum Insured (₹) *</label>
        <input
          type="number"
          value={formData.sumInsured}
          onChange={(e) => handleChange("sumInsured", e.target.value)}
          placeholder="e.g., 10000000"
          className={`w-full border rounded px-3 py-2 ${errors.sumInsured ? "border-red-500 bg-red-50" : ""}`}
        />
        {errors.sumInsured && (
          <p className="text-red-600 text-sm mt-1">❌ {errors.sumInsured}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Premium (₹) *</label>
        <input
          type="number"
          value={formData.premium}
          onChange={(e) => handleChange("premium", e.target.value)}
          placeholder="e.g., 50000"
          className={`w-full border rounded px-3 py-2 ${errors.premium ? "border-red-500 bg-red-50" : ""}`}
        />
        {errors.premium && (
          <p className="text-red-600 text-sm mt-1">❌ {errors.premium}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Retention Limit (₹) *</label>
        <input
          type="number"
          value={formData.retentionLimit}
          onChange={(e) => handleChange("retentionLimit", e.target.value)}
          placeholder="e.g., 5000000"
          className={`w-full border rounded px-3 py-2 ${errors.retentionLimit ? "border-red-500 bg-red-50" : ""}`}
        />
        {errors.retentionLimit && (
          <p className="text-red-600 text-sm mt-1">❌ {errors.retentionLimit}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Effective From *</label>
        <input
          type="date"
          value={formData.effectiveFrom}
          onChange={(e) => handleChange("effectiveFrom", e.target.value)}
          className={`w-full border rounded px-3 py-2 ${errors.effectiveFrom ? "border-red-500 bg-red-50" : ""}`}
        />
        {errors.effectiveFrom && (
          <p className="text-red-600 text-sm mt-1">❌ {errors.effectiveFrom}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Effective To *</label>
        <input
          type="date"
          value={formData.effectiveTo}
          onChange={(e) => handleChange("effectiveTo", e.target.value)}
          className={`w-full border rounded px-3 py-2 ${errors.effectiveTo ? "border-red-500 bg-red-50" : ""}`}
        />
        {errors.effectiveTo && (
          <p className="text-red-600 text-sm mt-1">❌ {errors.effectiveTo}</p>
        )}
      </div>
    </div>
  );
};

export default PolicyStepCoverage;