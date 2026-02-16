import Card from "../../shared/components/Card";

const AllocationTable = ({ allocation }) => {
  if (!allocation || !allocation.allocations || allocation.allocations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Allocation Details</h2>
      
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left border-b">
            <tr>
              <th className="p-4">Reinsurer</th>
              <th className="p-4">Treaty</th>
              <th className="p-4">Allocated Amount</th>
              <th className="p-4">Allocated %</th>
              <th className="p-4">Calculation</th>
            </tr>
          </thead>
          
          <tbody>
            {allocation.allocations.map((item, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏛️</span>
                    {item.reinsurerId?.name || "Unknown"}
                  </div>
                </td>
                
                <td className="p-4">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                    {item.treatyId?.treatyName || "Treaty"}
                  </span>
                </td>
                
                <td className="p-4 font-semibold">
                  <span className="text-green-600">
                    ₹{item.allocatedAmount?.toLocaleString('en-IN')}
                  </span>
                </td>
                
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-semibold">
                    {item.allocatedPercentage?.toFixed(2)}%
                  </span>
                </td>
                
                <td className="p-4 text-xs text-gray-600">
                  {item.treatyId?.treatyType === "QUOTA_SHARE" 
                    ? `${item.treatyId?.sharePercentage}% of sum insured` 
                    : `Excess above ₹${item.treatyId?.retentionLimit?.toLocaleString('en-IN')}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Retained Amount</p>
            <p className="text-2xl font-bold text-green-700">₹{allocation.retainedAmount?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500 mt-1">
              {allocation.retainedPercentage?.toFixed(2) || 
                ((allocation.retainedAmount / (allocation.retainedAmount + allocation.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0))) * 100).toFixed(2)}%
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Ceded Amount</p>
            <p className="text-2xl font-bold text-red-600">
              ₹{allocation.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(
                (allocation.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0) / 
                (allocation.retainedAmount + allocation.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0))) * 100
              ).toFixed(2)}%
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Total Exposed</p>
            <p className="text-2xl font-bold text-blue-700">
              ₹{(allocation.retainedAmount + allocation.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0)).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-500 mt-1">100%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AllocationTable;
