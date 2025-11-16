// src/pages/AdminPanel.jsx
import React, { useEffect, useState, useMemo } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuthStore } from "../context/authStore";

const WEEK_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PIE_COLORS = ["#ef4444", "#f59e0b", "#fbbf24", "#3b82f6", "#10b981"];

export default function AdminPanel() {
  const [week, setWeek] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [form, setForm] = useState({
    day: "",
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
    special: "",
  });
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user); // expected shape: { name, role, ... }

  // fallback to token decode if user not present
  const adminName = useMemo(() => {
    if (user?.name) return user.name;
    // try token
    const token = localStorage.getItem("fb_token");
    if (!token) return "Admin";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.name || payload.fullName || payload.username || "Admin";
    } catch {
      return "Admin";
    }
  }, [user]);

  // live clock in sidebar
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // fetch data on mount
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchMenu(), fetchFeedbacks()]);
  };

  const fetchMenu = async () => {
    try {
      const { data } = await API.get("/menu/week");
      const sorted = (data || [])
        .slice()
        .sort((a, b) => WEEK_ORDER.indexOf(a.day) - WEEK_ORDER.indexOf(b.day));
      setWeek(sorted);
    } catch (err) {
      console.error("fetchMenu error:", err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data } = await API.get("/feedback");
      setFeedbacks(data || []);
    } catch (err) {
      console.error("fetchFeedbacks error:", err);
    }
  };

  const editDay = (d) => {
    setSelectedDay(d._id);
    setForm({
      day: d.day || "",
      breakfast: d.breakfast || "",
      lunch: d.lunch || "",
      snacks: d.snacks || "",
      dinner: d.dinner || "",
      special: d.special || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setSelectedDay(null);
    setForm({
      day: "",
      breakfast: "",
      lunch: "",
      snacks: "",
      dinner: "",
      special: "",
    });
  };

  const submitMenu = async (e) => {
    e.preventDefault();
    // validation: require day, breakfast, lunch, dinner
    if (!form.day || !form.breakfast || !form.lunch || !form.dinner) {
      alert("Please fill Day, Breakfast, Lunch and Dinner.");
      return;
    }

    // normalize day capitalization to match enum
    const normalizedDay =
      form.day.charAt(0).toUpperCase() + form.day.slice(1).toLowerCase();
    const payload = { ...form, day: normalizedDay };

    try {
      setLoading(true);
      await API.post("/menu", payload);
      alert("Menu saved successfully.");
      await fetchMenu();
      resetForm();
    } catch (err) {
      console.error("submitMenu error:", err);
      alert(err.response?.data?.message || "Failed to save menu");
    } finally {
      setLoading(false);
    }
  };

  // Mark viewed / resolve with metadata
  const updateStatus = async (id, status) => {
    try {
      const statusUpdatedBy = adminName;
      const statusUpdatedAt = new Date().toISOString();

      // PATCH payload includes metadata for audit
      await API.patch(`/feedback/${id}/status`, {
        status,
        statusUpdatedBy,
        statusUpdatedAt,
      });

      // optimistic: update local state quickly
      setFeedbacks((prev) =>
        prev.map((f) =>
          f._id === id ? { ...f, status, statusUpdatedBy, statusUpdatedAt } : f
        )
      );
    } catch (err) {
      console.error("updateStatus error:", err);
      alert("Failed to update status");
    }
  };

  // Derived analytics
  const totalFeedbacks = feedbacks.length;
  const avgRating =
    feedbacks.reduce((s, f) => s + (Number(f.rating) || 0), 0) /
    (feedbacks.length || 1);

  // Prepare chart data (line: avgRating & count per day; pie: rating distribution)
  const { lineData, ratingCounts } = useMemo(() => {
    // initialize
    const map = {};
    WEEK_ORDER.forEach((d) => (map[d] = { ratings: [], count: 0 }));

    feedbacks.forEach((f) => {
      // Prefer explicit f.day, else derive from createdAt
      let dayName = "";
      if (f.day) dayName = String(f.day);
      else if (f.createdAt) {
        try {
          dayName = new Date(f.createdAt).toLocaleString("en-US", {
            weekday: "long",
          });
        } catch {
          dayName = "";
        }
      }
      if (!dayName) return;
      dayName =
        dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
      if (!WEEK_ORDER.includes(dayName)) return;

      const r = Number(f.rating) || 0;
      map[dayName].ratings.push(r);
      map[dayName].count += 1;
    });

    const line = WEEK_ORDER.map((d) => {
      const { ratings, count } = map[d];
      const avg = ratings.length
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;
      return {
        day: d,
        avgRating: Number(avg.toFixed(2)),
        feedbackCount: count,
      };
    });

    const counts = [1, 2, 3, 4, 5].map((v) => ({
      name: `${v}★`,
      value: feedbacks.filter((f) => Number(f.rating) === v).length,
    }));

    return { lineData: line, ratingCounts: counts };
  }, [feedbacks]);

  // helper render for status badge (Option A style)
  const StatusBadge = ({ f }) => {
    if (!f?.status || f.status === "Pending") {
      return (
        <span className="inline-block px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
          Pending
        </span>
      );
    }

    const isResolved = f.status === "Resolved";
    const color = isResolved
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
    const label = isResolved ? "Resolved ✓" : "Viewed ✓";
    const when = f.statusUpdatedAt
      ? new Date(f.statusUpdatedAt).toLocaleString()
      : "";
    const by = f.statusUpdatedBy || "";

    return (
      <div className="text-sm">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${color}`}
        >
          <span className="font-medium">{label}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {when && <span>{when}</span>}
          {by && (
            <span className="ml-2">
              by <strong>{by}</strong>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 hidden md:block bg-white border-r">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-600">Food-back Admin</h2>
          <p className="text-sm text-gray-500 mt-1">Manage menus & feedback</p>

          {/* Admin name + live time */}
          <div className="mt-6 p-3 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">Signed in as</div>
            <div className="font-semibold">{adminName}</div>
            <div className="text-xs text-gray-500 mt-2">
              {now.toLocaleDateString()} • {now.toLocaleTimeString()}
            </div>
          </div>
        </div>

        <nav className="px-4 py-2 space-y-1">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-full text-left p-3 rounded hover:bg-gray-100"
          >
            Overview
          </button>

          <button
            onClick={() =>
              document
                .getElementById("weekly-menu")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-full text-left p-3 rounded hover:bg-gray-100"
          >
            Weekly Menu
          </button>

          <button
            onClick={() =>
              document
                .getElementById("feedbacks")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-full text-left p-3 rounded hover:bg-gray-100"
          >
            Feedbacks
          </button>

          <button
            className="mt-6 w-full p-3 rounded bg-blue-600 text-white"
            onClick={() => navigate("/")}
          >
            Preview
          </button>

          <button
            className="mt-2 w-full p-3 rounded bg-red-500 text-white"
            onClick={() => {
              localStorage.removeItem("fb_token");
              window.location.reload();
            }}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500">Overview & quick actions</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-3 py-2 border rounded hover:bg-gray-100 hidden md:inline"
              onClick={() => navigate("/")}
            >
              Preview
            </button>
            <button
              className="px-3 py-2 bg-red-500 text-white rounded"
              onClick={() => {
                localStorage.removeItem("fb_token");
                window.location.reload();
              }}
            >
              Logout
            </button>
          </div>
        </motion.header>

        {/* Analytics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500">Total Feedbacks</div>
            <div className="text-3xl font-bold mt-2">{totalFeedbacks}</div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500">Average Rating</div>
            <div className="text-3xl font-bold mt-2">
              {avgRating.toFixed(1)} ★
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="text-sm text-gray-500">Menu Days Added</div>
            <div className="text-3xl font-bold mt-2">{week.length} / 7</div>
          </div>
        </section>

        {/* Charts */}
        {/* Charts */}
<section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
  
  {/* Line Chart - No animation */}
  <div className="bg-white p-6 rounded-xl shadow border">
    <h3 className="text-lg font-semibold mb-4">Daily Rating & Feedback Count</h3>

    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={lineData}>

        <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
        <XAxis dataKey="day" />
        <YAxis yAxisId="left" domain={[0, 5]} ticks={[0,1,2,3,4,5]} />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />

        {/* Avg Rating Line (no animation) */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="avgRating"
          name="Avg Rating"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ r: 5, fill: "#3b82f6" }}
          activeDot={{ r: 7 }}
          isAnimationActive={false}
        />

        {/* Feedback Count Line (no animation) */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="feedbackCount"
          name="Feedback Count"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ r: 5, fill: "#10b981" }}
          activeDot={{ r: 7 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* Pie Chart - No animation */}
  <div className="bg-white p-6 rounded-xl shadow border">
    <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>

    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={ratingCounts}
          dataKey="value"
          nameKey="name"
          outerRadius={110}
          innerRadius={50}
          paddingAngle={3}
          label
          isAnimationActive={false}
        >
          {ratingCounts.map((entry, idx) => (
            <Cell
              key={entry.name}
              fill={PIE_COLORS[idx % PIE_COLORS.length]}
              stroke="#ffffff"
              strokeWidth={2}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </div>

</section>

        {/* Weekly Menu & Form */}
        <section
          id="weekly-menu"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Weekly Menu</h3>
              <div>
                <button
                  onClick={() => {
                    resetForm();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3 py-1 border rounded text-sm"
                >
                  New
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {week.length === 0 && (
                <div className="text-sm text-gray-500">No menus added yet.</div>
              )}
              {week.map((d) => (
                <div
                  key={d._id}
                  className={`p-4 rounded-xl border flex justify-between items-center ${
                    selectedDay === d._id ? "bg-blue-50 border-blue-300" : ""
                  }`}
                >
                  <div>
                    <div className="font-bold text-gray-800">{d.day}</div>
                    <div className="text-sm text-gray-600">
                      <div>
                        <strong>Breakfast:</strong> {d.breakfast}
                      </div>
                      <div>
                        <strong>Lunch:</strong> {d.lunch}
                      </div>
                      <div>
                        <strong>Dinner:</strong> {d.dinner}
                      </div>
                      {d.special && (
                        <div className="text-xs text-indigo-600 mt-1">
                          Special: {d.special}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => editDay(d)}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-3">
              {selectedDay ? "Edit Menu" : "Create Menu"}
            </h3>
            <form onSubmit={submitMenu} className="space-y-3">
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
              >
                <option value="">Select day</option>
                {WEEK_ORDER.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <input
                value={form.breakfast}
                onChange={(e) =>
                  setForm({ ...form, breakfast: e.target.value })
                }
                placeholder="Breakfast"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                value={form.lunch}
                onChange={(e) => setForm({ ...form, lunch: e.target.value })}
                placeholder="Lunch"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                value={form.snacks}
                onChange={(e) => setForm({ ...form, snacks: e.target.value })}
                placeholder="Snacks (optional)"
                className="w-full p-3 border rounded-lg"
              />
              <input
                value={form.dinner}
                onChange={(e) => setForm({ ...form, dinner: e.target.value })}
                placeholder="Dinner"
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                value={form.special}
                onChange={(e) => setForm({ ...form, special: e.target.value })}
                placeholder="Special (optional)"
                className="w-full p-3 border rounded-lg"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {loading ? "Saving..." : "Save Menu"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Feedbacks */}
        <section id="feedbacks" className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Student Feedbacks</h3>

          <div className="space-y-4">
            {feedbacks.length === 0 && (
              <div className="text-sm text-gray-500">No feedbacks yet.</div>
            )}
            {feedbacks.map((f) => (
              <div key={f._id} className="p-4 border rounded-xl bg-gray-50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">
                      {new Date(f.createdAt).toLocaleString()}
                    </div>
                    <div className="font-semibold text-gray-800">
                      {f.userId?.name || "Anonymous"}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      {f.mealType} • {f.rating}★
                    </div>
                    <p className="mt-2 text-gray-700">{f.message}</p>

                    {f.photoUrl && (
                      <img
                        src={f.photoUrl}
                        alt="fb"
                        className="w-40 h-28 object-cover rounded-lg mt-3"
                      />
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {/* status badge */}
                    <StatusBadge f={f} />

                    {/* action buttons */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => updateStatus(f._id, "Viewed")}
                        disabled={
                          f.status === "Viewed" || f.status === "Resolved"
                        }
                        className={`px-3 py-1 rounded ${
                          f.status === "Viewed" || f.status === "Resolved"
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-yellow-100 hover:bg-yellow-200"
                        }`}
                      >
                        Mark Viewed
                      </button>

                      <button
                        onClick={() => updateStatus(f._id, "Resolved")}
                        disabled={f.status === "Resolved"}
                        className={`px-3 py-1 rounded ${
                          f.status === "Resolved"
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-green-100 hover:bg-green-200"
                        }`}
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
