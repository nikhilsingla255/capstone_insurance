import Card from "../../shared/components/Card";

const AllocationValidation = ({ policy, allocation }) => {
  if (!allocation || !allocation.allocations) {
    return null;
  }

  const checks = [];

  // Check 1: Exceeds retention limit
  const exceedsRetention = policy.sumInsured > policy.retentionLimit;
  checks.push({
    id: "retention",
    label: "Retention Limit Check",
    description: `Policy value (₹${policy.sumInsured.toLocaleString('en-IN')}) exceeds retention limit (₹${policy.retentionLimit.toLocaleString('en-IN')})`,
    passed: exceedsRetention,
    icon: exceedsRetention ? "✅" : "ℹ️"
  });

  // Check 2: Allocation total matches sum insured
  const totalAllocated = allocation.retainedAmount + allocation.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
  const allocationMatches = Math.abs(totalAllocated - policy.sumInsured) < 1; // Allow 1 rupee difference due to rounding
  checks.push({
    id: "total",
    label: "Total Allocation Match",
    description: `Total allocated (₹${totalAllocated.toLocaleString('en-IN')}) matches sum insured (₹${policy.sumInsured.toLocaleString('en-IN')})`,
    passed: allocationMatches,
    icon: allocationMatches ? "✅" : "⚠️"
  });

  // Check 3: No allocation overflow
  const noOverflow = allocation.allocations.every(alloc => alloc.allocatedAmount <= policy.sumInsured);
  checks.push({
    id: "overflow",
    label: "No Overflow",
    description: "No individual allocation exceeds total sum insured",
    passed: noOverflow,
    icon: noOverflow ? "✅" : "❌"
  });

  // Check 4: Retained within policy
  const retainedValid = allocation.retainedAmount >= 0 && allocation.retainedAmount <= policy.sumInsured;
  checks.push({
    id: "retained",
    label: "Retention Valid",
    description: `Company retains ₹${allocation.retainedAmount.toLocaleString('en-IN')} (${((allocation.retainedAmount / policy.sumInsured) * 100).toFixed(2)}%)`,
    passed: retainedValid,
    icon: retainedValid ? "✅" : "❌"
  });

  // Check 5: Ceded amount respects treaty limits
  const cededValid = allocation.allocations.every(alloc => 
    alloc.allocatedAmount <= (alloc.treatyId?.treatyLimit || Infinity)
  );
  checks.push({
    id: "treaties",
    label: "Treaty Limits Respected",
    description: "All allocations are within respective treaty limits",
    passed: cededValid,
    icon: cededValid ? "✅" : "⚠️"
  });

  const allPassed = checks.every(c => c.passed);

  return (
    <Card className={`border-l-4 ${allPassed ? 'border-l-green-600 bg-green-50' : 'border-l-yellow-600 bg-yellow-50'}`}>
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">{allPassed ? "✅" : "⚠️"}</span>
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {allPassed ? "Allocation Validated" : "Allocation Review"}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {allPassed 
              ? "All validation checks passed. Allocation is compliant." 
              : "Review allocation details below."}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {checks.map(check => (
          <div 
            key={check.id}
            className={`flex items-start gap-3 p-3 rounded border-l-2 ${
              check.passed
                ? "border-l-green-500 bg-green-50"
                : "border-l-yellow-500 bg-yellow-50"
            }`}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{check.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{check.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{check.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Breakdown */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-semibold text-sm mb-2">Risk Breakdown</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Company Retained:</span>
            <span className="font-semibold text-green-700">
              ₹{allocation.retainedAmount.toLocaleString('en-IN')} 
              <span className="text-gray-500 ml-1">
                ({((allocation.retainedAmount / policy.sumInsured) * 100).toFixed(2)}%)
              </span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ceded to Reinsurers:</span>
            <span className="font-semibold text-red-600">
              ₹{allocation.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0).toLocaleString('en-IN')}
              <span className="text-gray-500 ml-1">
                ({((allocation.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0) / policy.sumInsured) * 100).toFixed(2)}%)
              </span>
            </span>
          </div>
          <div className="border-t pt-1 mt-1 flex justify-between font-bold">
            <span>Total Exposure:</span>
            <span className="text-blue-700">
              ₹{policy.sumInsured.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AllocationValidation;
