const PolicyStepGeneral = ({ formData, setFormData, errors = {}, setErrors = () => {} }) => {
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
        <label className="block text-sm font-medium">Policy Number *</label>
        <input
          type="text"
          value={formData.policyNumber}
          onChange={(e) => handleChange("policyNumber", e.target.value)}
          placeholder="e.g., POL1001"
          className={`w-full border rounded px-3 py-2 ${errors.policyNumber ? "border-red-500 bg-red-50" : ""}`}
        />
        {errors.policyNumber && (
          <p className="text-red-600 text-sm mt-1">❌ {errors.policyNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Insured Name *</label>
        <input
          type="text"
          value={formData.insuredName}
          onChange={(e) => handleChange("insuredName", e.target.value)}
          placeholder="e.g., Rahul Sharma"
          className={`w-full border rounded px-3 py-2 ${errors.insuredName ? "border-red-500 bg-red-50" : ""}`}
        />
        {errors.insuredName && (
          <p className="text-red-600 text-sm mt-1">❌ {errors.insuredName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Insured Type *</label>
        <select
          value={formData.insuredType}
          onChange={(e) => handleChange("insuredType", e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="INDIVIDUAL">Individual</option>
          <option value="CORPORATE">Corporate</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Line of Business *</label>
        <select
          value={formData.lineOfBusiness}
          onChange={(e) => handleChange("lineOfBusiness", e.target.value)}
          className={`w-full border rounded px-3 py-2 ${errors.lineOfBusiness ? "border-red-500 bg-red-50" : ""}`}
        >
          <option value="">-- Select --</option>
          <option value="HEALTH">Health</option>
          <option value="MOTOR">Motor</option>
          <option value="LIFE">Life</option>
          <option value="PROPERTY">Property</option>
        </select>
        {errors.lineOfBusiness && (
          <p className="text-red-600 text-sm mt-1">❌ {errors.lineOfBusiness}</p>
        )}
      </div>
    </div>
  );
};

export default PolicyStepGeneral;