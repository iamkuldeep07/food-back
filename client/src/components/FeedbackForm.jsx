import React, { useState } from "react";
import API from "../api";

export default function FeedbackForm({ onDone }) {
  const [mealType, setMealType] = useState("breakfast");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = null;

      // 1️⃣ Upload image if exists
      if (photoFile) {
        const formData = new FormData();
        formData.append("photo", photoFile);

        const uploadRes = await API.post("/upload/photo", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        photoUrl = uploadRes.data.url;
      }

      // 2️⃣ Submit feedback with photoUrl (NOT photo file)
      await API.post("/feedback", {
        mealType,
        rating,
        message,
        photoUrl
      });

      alert("Feedback submitted!");
      onDone && onDone();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send feedback");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-3">Give Feedback</h2>

      {/* Meal Type */}
      <label className="block mb-2 text-sm">Meal Type</label>
      <select
        value={mealType}
        onChange={(e) => setMealType(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      >
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="snacks">Snacks</option>
        <option value="dinner">Dinner</option>
      </select>

      {/* Rating */}
      <label className="block mb-2 text-sm">Rating</label>
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      {/* Message */}
      <label className="block mb-2 text-sm">Message</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-3 border rounded mb-3"
        placeholder="Describe your experience..."
        rows={3}
      />

      {/* Photo Upload */}
      <label className="block mb-2 text-sm">Add a photo (optional)</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setPhotoFile(e.target.files[0]);
          setPreview(URL.createObjectURL(e.target.files[0]));
        }}
        className="mb-3"
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 object-cover mb-3 rounded border"
        />
      )}

      <button
        disabled={loading}
        className="p-2 bg-blue-600 text-white rounded w-full"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}