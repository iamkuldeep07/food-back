import React, { useEffect, useState } from "react";
import API from "../api";

export default function MyFeedback() {
  const [items, setItems] = useState([]);

  const loadFeedback = async () => {
    try {
      const { data } = await API.get("/feedback/my");
      setItems(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch your feedback.");
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  return (
    <div className="bg-white p-5 rounded shadow border border-gray-100">
      <h3 className="text-xl font-semibold mb-4">My Feedback</h3>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">You haven't submitted any feedback yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((f) => (
            <li key={f._id} className="border p-4 rounded shadow-sm">
              <div className="flex justify-between text-sm mb-2">
                <div>
                  <span className="font-semibold capitalize">{f.mealType}</span>{" "}
                  — {f.rating} ★
                </div>

                <div
                  className={`text-xs font-medium ${
                    f.status === "Pending"
                      ? "text-yellow-600"
                      : f.status === "Viewed"
                      ? "text-blue-600"
                      : f.status === "Resolved"
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {f.status}
                </div>
              </div>

              <p className="text-sm text-gray-700">{f.message}</p>

              {f.photoUrl && (
                <img
                  src={f.photoUrl}
                  alt="feedback"
                  className="w-40 h-28 object-cover mt-3 rounded border"
                />
              )}

              <p className="text-xs text-gray-500 mt-2">
                Submitted: {new Date(f.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}