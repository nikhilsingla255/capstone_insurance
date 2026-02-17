import { useEffect, useState } from "react";
import { getPolicies } from "./policyService";
import PolicyStatusBadge from "./PolicyStatusBadge";
import PolicyActions from "./PolicyActions";
import Loader from "../../shared/components/Loader";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

const PolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadPolicies = async () => {
    try {
      const data = await getPolicies();
      setPolicies(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* <h1 className="text-2xl font-bold">Policies</h1> */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Policies</h1>

        {user?.role !== 'ADMIN' && (
          <button
            onClick={() => navigate("/policies/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Policy
          </button>
        )}
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">Policy No</th>
              <th className="p-4">Insured</th>
              <th className="p-4">LOB</th>
              <th className="p-4">Premium</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {policies.map((policy) => (
              <tr key={policy._id} className="border-t">
                <td className="p-4">{policy.policyNumber}</td>
                <td className="p-4">{policy.insuredName}</td>
                <td className="p-4">{policy.lineOfBusiness}</td>
                <td className="p-4">
                  ₹{policy.premium?.toLocaleString()}
                </td>
                <td className="p-4">
                  <PolicyStatusBadge status={policy.status} />
                </td>
                <td className="p-4">
                  <PolicyActions
                    policy={policy}
                    refresh={loadPolicies}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PolicyList;