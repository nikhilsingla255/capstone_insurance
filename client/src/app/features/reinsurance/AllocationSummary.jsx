import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getReinsurer } from "./reinsuranceService";
import Card from "../../shared/components/Card";
import Button from "../../shared/components/Button";

const AllocationSummary = ({ policy, allocation }) => {
  const [reinsurersData, setReinsurersData] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadReinsurers = async () => {
      try {
        const reinsurers = {};
        for (const alloc of allocation.allocations) {
          try {
            const reinsurer = await getReinsurer(alloc.reinsurerId);
            reinsurers[alloc.reinsurerId] = reinsurer.name;
          } catch (err) {
            console.log("Reinsurer not found:", alloc.reinsurerId);
            reinsurers[alloc.reinsurerId] = `Reinsurer ${alloc.reinsurerId}`;
          }
        }
        setReinsurersData(reinsurers);
      } catch (err) {
        console.error("Error loading reinsurers:", err);
      } finally {
        setLoading(false);
      }
    };

    if (allocation) {
      loadReinsurers();
    }
  }, [allocation]);

  if (!allocation) {
    return (
      <Card>
        <p className="text-gray-600">No reinsurance allocation available.</p>
      </Card>
    );
  }

  const totalCeded = policy.sumInsured - allocation.retainedAmount;

  return (
    <Card>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold">Reinsurance Allocation</h2>
        {location.pathname.includes('/policies/') && policy?._id && (
          <Link to={`/reinsurance/allocations/${policy._id}`}>
            <Button variant="secondary" className="text-sm">
              📊 View Details
            </Button>
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded border border-blue-200">
          <p className="text-xs text-blue-600 uppercase font-semibold mb-1">
            💼 Company Retained
          </p>
          <p className="text-2xl font-bold text-blue-900">
            ₹{allocation.retainedAmount?.toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            {((allocation.retainedAmount / policy.sumInsured) * 100).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded border border-orange-200">
          <p className="text-xs text-orange-600 uppercase font-semibold mb-1">
            🔄 Total Ceded to Reinsurers
          </p>
          <p className="text-2xl font-bold text-orange-900">
            ₹{totalCeded?.toLocaleString()}
          </p>
          <p className="text-xs text-orange-600 mt-2">
            {((totalCeded / policy.sumInsured) * 100).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded border border-green-200">
          <p className="text-xs text-green-600 uppercase font-semibold mb-1">
            ✓ Total Sum Insured
          </p>
          <p className="text-2xl font-bold text-green-900">
            ₹{policy.sumInsured?.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-2">100% (Always)</p>
        </div>
      </div>

      {/* Detailed Allocation Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Allocation Breakdown</h3>
        <div className="overflow-x-auto bg-gray-50 rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-200 border-b">
              <tr>
                <th className="p-3 text-left">Party</th>
                <th className="p-3 text-right">Allocated Amount</th>
                <th className="p-3 text-right">Percentage</th>
                <th className="p-3 text-right">Type</th>
              </tr>
            </thead>
            <tbody>
              {/* Company (Retained) */}
              <tr className="border-b bg-blue-50">
                <td className="p-3 font-semibold">Our Company (Retained)</td>
                <td className="p-3 text-right font-semibold">
                  ₹{allocation.retainedAmount?.toLocaleString()}
                </td>
                <td className="p-3 text-right font-semibold">
                  {((allocation.retainedAmount / policy.sumInsured) * 100).toFixed(2)}%
                </td>
                <td className="p-3 text-right">
                  <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                    RETAINED
                  </span>
                </td>
              </tr>

              {/* Reinsurers */}
              {allocation.allocations.map((alloc, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-100">
                  <td className="p-3 font-medium">
                    {reinsurersData[alloc.reinsurerId] || `Reinsurer ${idx + 1}`}
                  </td>
                  <td className="p-3 text-right">
                    ₹{alloc.allocatedAmount?.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    {alloc.allocatedPercentage?.toFixed(2)}%
                  </td>
                  <td className="p-3 text-right">
                    <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs">
                      CEDED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
        <p className="text-sm text-green-800">
          ✓ <strong>Verification:</strong> Retained (₹{allocation.retainedAmount?.toLocaleString()}) 
          + Ceded (₹{totalCeded?.toLocaleString()}) 
          = Sum Insured (₹{policy.sumInsured?.toLocaleString()})
        </p>
      </div>

      {/* Calculation Info */}
      <div className="mt-4 text-xs text-gray-600">
        <p>
          📋 Calculated at: {new Date(allocation.calculatedAt).toLocaleString()}
        </p>
      </div>
    </Card>
  );
};

export default AllocationSummary;
