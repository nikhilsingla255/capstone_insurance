const PolicyStepReview = ({ formData }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Review Policy Details</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-600 uppercase">Policy Number</p>
          <p className="text-lg font-semibold">{formData.policyNumber}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-600 uppercase">Insured Name</p>
          <p className="text-lg font-semibold">{formData.insuredName}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-600 uppercase">Insured Type</p>
          <p className="text-lg font-semibold">{formData.insuredType}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-600 uppercase">Line of Business</p>
          <p className="text-lg font-semibold">{formData.lineOfBusiness}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-600 uppercase">Sum Insured</p>
          <p className="text-lg font-semibold">₹{formData.sumInsured?.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-600 uppercase">Premium</p>
          <p className="text-lg font-semibold">₹{formData.premium?.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-600 uppercase">Retention Limit</p>
          <p className="text-lg font-semibold">₹{formData.retentionLimit?.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-600 uppercase">Effective From</p>
          <p className="text-lg font-semibold">{formData.effectiveFrom}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded col-span-2">
          <p className="text-xs text-gray-600 uppercase">Effective To</p>
          <p className="text-lg font-semibold">{formData.effectiveTo}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <p className="text-sm text-blue-800">✓ Please review all details carefully before submitting.</p>
      </div>
    </div>
  );
};

export default PolicyStepReview;