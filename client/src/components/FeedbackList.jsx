// src/components/FeedbackList.jsx
import React from "react";
import { Eye, CheckCircle } from "lucide-react";

export default function FeedbackList({ feedbacks = [], onStatusChange = async () => ({ ok: true }) }) {
  if (!Array.isArray(feedbacks)) feedbacks = [];

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Student Feedbacks</h3>
      {feedbacks.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">No feedback submitted yet.</div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((f, idx) => (
            <div key={f._id || idx} className="p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all">
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold">{f.userId?.name?.charAt(0)?.toUpperCase() || "A"}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{f.userId?.name || "Anonymous"}</div>
                      <div className="text-xs text-gray-500">{f.createdAt ? new Date(f.createdAt).toLocaleString() : ""}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{f.mealType}</span>
                    <span className="text-2xl font-bold text-yellow-500">{f.rating}★</span>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4">"{f.message}"</p>

                  {f.photoUrl && <img src={f.photoUrl} alt="fb" className="w-48 h-32 object-cover rounded-xl shadow" />}
                </div>

                <div className="flex flex-col items-end gap-4 min-w-[140px]">
                  <StatusBadge status={f.status} updatedAt={f.statusUpdatedAt} updatedBy={f.statusUpdatedBy} />

                  <div className="flex flex-col gap-2">
                    <button onClick={() => onStatusChange(f._id, "Viewed")} disabled={f.status === "Viewed" || f.status === "Resolved"} className={`px-4 py-2 rounded-xl font-medium ${f.status === "Viewed" || f.status === "Resolved" ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-amber-100 text-amber-700"}`}><Eye size={16} /> Mark Viewed</button>
                    <button onClick={() => onStatusChange(f._id, "Resolved")} disabled={f.status === "Resolved"} className={`px-4 py-2 rounded-xl font-medium ${f.status === "Resolved" ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-emerald-100 text-emerald-700"}`}><CheckCircle size={16} /> Resolve</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, updatedAt, updatedBy }) {
  if (!status || status === "Pending") {
    return <span className="inline-flex items-center gap-2 px-3 py-2 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full"><div className="w-2 h-2 bg-orange-400 rounded-full"></div>Pending</span>;
  }
  const isResolved = status === "Resolved";
  const bg = isResolved ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700";
  return (
    <div className="text-xs flex flex-col items-end">
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${bg}`}>{isResolved ? <CheckCircle size={14}/> : <Eye size={14}/>} {status}</div>
      {updatedAt && <span className="text-gray-500 mt-1">{new Date(updatedAt).toLocaleString()}</span>}
      {updatedBy && <span className="text-gray-500">by <strong>{updatedBy}</strong></span>}
    </div>
  );
}