import Card from "../../shared/components/Card";
import { useAuth } from "../../providers/AuthProvider";
import { useState } from "react";
import { updateClaimRemarks } from "./claimService";

const ClaimNotes = ({ claim, onUpdate }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(claim?.remarks || "");

  const canEdit = user?.role === "CLAIMS_ADJUSTER" || user?.role === "ADMIN";

  const handleSaveNote = async () => {
    try {
      if (!noteText.trim()) {
        alert("❌ Note cannot be empty");
        return;
      }

      // Persist note to server
      const updated = await updateClaimRemarks(claim._id, noteText);
      alert("✅ Note saved successfully");
      setIsEditing(false);
      onUpdate?.(updated);
    } catch (err) {
      alert(`❌ Failed to save note: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Claim Notes</h3>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add notes about this claim..."
            rows="4"
            className="w-full border rounded px-3 py-2 text-sm"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSaveNote}
              className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
            >
              💾 Save Note
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setNoteText(claim?.remarks || "");
              }}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded font-semibold hover:bg-gray-400"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {claim?.remarks && claim.remarks.trim() ? (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm whitespace-pre-wrap">{claim.remarks}</p>
              <p className="text-xs text-gray-600 mt-2">
                Last updated: {new Date(claim.updatedAt).toLocaleString('en-IN')}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <p className="text-sm text-gray-600">
                ℹ️ No notes added yet. {canEdit && "Click edit to add a note."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Note Guidelines */}
      <div className="mt-4 bg-gray-50 p-3 rounded text-xs text-gray-600 space-y-1">
        <p className="font-semibold">📝 Note Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Add relevant information about the claim assessment</li>
          <li>Document reasons for approval/rejection</li>
          <li>Mention any supporting documents or evidence</li>
          <li>Record follow-up actions if needed</li>
        </ul>
      </div>
    </Card>
  );
};

export default ClaimNotes;
