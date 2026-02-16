import Card from "../../shared/components/Card";

const ClaimStatusTimeline = ({ claim }) => {
  const statuses = ["SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED", "SETTLED"];
  
  // Find current status index
  const currentStatusIndex = statuses.indexOf(claim.status);
  
  // Determine the path taken
  let displayStatuses = [];
  
  if (claim.status === "REJECTED") {
    displayStatuses = ["SUBMITTED", "IN_REVIEW", "REJECTED"];
  } else if (claim.status === "SETTLED") {
    displayStatuses = ["SUBMITTED", "IN_REVIEW", "APPROVED", "SETTLED"];
  } else {
    displayStatuses = statuses.slice(0, currentStatusIndex + 1);
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "📝";
      case "IN_REVIEW":
        return "👀";
      case "APPROVED":
        return "✅";
      case "REJECTED":
        return "❌";
      case "SETTLED":
        return "💰";
      default:
        return "•";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-600";
      case "IN_REVIEW":
        return "bg-orange-600";
      case "APPROVED":
        return "bg-green-600";
      case "REJECTED":
        return "bg-red-600";
      case "SETTLED":
        return "bg-gray-600";
      default:
        return "bg-gray-400";
    }
  };

  const getBgColor = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-50";
      case "IN_REVIEW":
        return "bg-orange-50";
      case "APPROVED":
        return "bg-green-50";
      case "REJECTED":
        return "bg-red-50";
      case "SETTLED":
        return "bg-gray-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-bold mb-6">Claim Lifecycle</h3>

      <div className="flex items-center justify-between gap-2 mb-8">
        {displayStatuses.map((status, idx) => (
          <div key={status} className="flex-1">
            {/* Status Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full ${getStatusColor(status)} flex items-center justify-center text-2xl text-white shadow-md ${
                  status === claim.status ? "ring-4 ring-yellow-400" : ""
                }`}
              >
                {getStatusIcon(status)}
              </div>

              {/* Status Label */}
              <p className={`text-xs font-bold mt-2 text-center ${status === claim.status ? "text-blue-600" : "text-gray-600"}`}>
                {status}
              </p>

              {/* Status Box */}
              <div className={`mt-2 px-2 py-1 rounded text-xs ${getBgColor(status)}`}>
                <p className="font-semibold">
                  {status === claim.status ? "🔴 Current" : "✓ Completed"}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {idx < displayStatuses.length - 1 && (
              <div className="mt-4 mx-auto w-full h-1 bg-gray-300"></div>
            )}
          </div>
        ))}
      </div>

      {/* Current Status Details */}
      <div className={`p-4 rounded border-l-4 ${getBgColor(claim.status)}`} style={{ borderLeftColor: "currentcolor" }}>
        <p className="text-sm font-semibold">
          Current Status: <span className="text-lg">{claim.status}</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Last Updated: {new Date(claim.updatedAt).toLocaleString('en-IN')}
        </p>
        {claim.approvedAmount > 0 && (
          <p className="text-xs text-green-700 mt-1">
            Approved Amount: <span className="font-bold">₹{claim.approvedAmount?.toLocaleString('en-IN')}</span>
          </p>
        )}
      </div>

      {/* Status Guide */}
      <div className="mt-6 bg-gray-50 p-4 rounded text-xs space-y-2">
        <p className="font-semibold mb-2">📖 Status Descriptions:</p>
        <div className="space-y-1 text-gray-700">
          <p><strong>📝 SUBMITTED:</strong> Claim has been created and is waiting for review</p>
          <p><strong>👀 IN_REVIEW:</strong> Claim is being reviewed by claims adjuster</p>
          <p><strong>✅ APPROVED:</strong> Claim has been approved for payment</p>
          <p><strong>❌ REJECTED:</strong> Claim has been rejected (final state)</p>
          <p><strong>💰 SETTLED:</strong> Claim payment has been made (final state)</p>
        </div>
      </div>
    </Card>
  );
};

export default ClaimStatusTimeline;
