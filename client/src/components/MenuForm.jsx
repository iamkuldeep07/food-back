// src/components/MenuForm.jsx
import React, { useEffect, useState } from "react";

const WEEK_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function MenuForm({ initialData = null, onSave = async () => ({ ok: true }), loading = false }) {
  const [form, setForm] = useState({
    day: "",
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
    special: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        day: initialData.day || "",
        breakfast: initialData.breakfast || "",
        lunch: initialData.lunch || "",
        snacks: initialData.snacks || "",
        dinner: initialData.dinner || "",
        special: initialData.special || ""
      });
    } else {
      setForm({
        day: "",
        breakfast: "",
        lunch: "",
        snacks: "",
        dinner: "",
        special: ""
      });
    }
  }, [initialData]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.day || !form.breakfast || !form.lunch || !form.dinner) {
      alert("Please fill Day, Breakfast, Lunch and Dinner.");
      return;
    }
    // normalize
    const payload = { ...form, day: form.day.charAt(0).toUpperCase() + form.day.slice(1) };
    const res = await onSave(payload);
    if (!res.ok) alert(res.error || "Failed to save");
  };

  const reset = () => {
    setForm({ day: "", breakfast: "", lunch: "", snacks: "", dinner: "", special: "" });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{initialData ? "Edit Menu" : "Create Menu"}</h3>
      <form onSubmit={submit} className="space-y-4">
        <select value={form.day} onChange={(e)=>setForm({...form, day: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl" required>
          <option value="">Select day</option>
          {WEEK_ORDER.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <input value={form.breakfast} onChange={(e)=>setForm({...form, breakfast: e.target.value})} placeholder="Breakfast" className="w-full p-3 border rounded-xl" required />
        <input value={form.lunch} onChange={(e)=>setForm({...form, lunch: e.target.value})} placeholder="Lunch" className="w-full p-3 border rounded-xl" required />
        <input value={form.snacks} onChange={(e)=>setForm({...form, snacks: e.target.value})} placeholder="Snacks (optional)" className="w-full p-3 border rounded-xl" />
        <input value={form.dinner} onChange={(e)=>setForm({...form, dinner: e.target.value})} placeholder="Dinner" className="w-full p-3 border rounded-xl" required />
        <input value={form.special} onChange={(e)=>setForm({...form, special: e.target.value})} placeholder="Special (optional)" className="w-full p-3 border rounded-xl" />

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl">{loading ? "Saving..." : "Save Menu"}</button>
          <button type="button" onClick={reset} className="px-4 py-2 border rounded-xl">Reset</button>
        </div>
      </form>
    </div>
  );
}