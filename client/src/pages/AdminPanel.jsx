// src/pages/AdminPanel.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import API from "../api";
import { useAuthStore } from "../context/authStore";
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
  BarChart,
  Bar,
} from "recharts";
import { RefreshCw, LogOut, Home, Menu as MenuIcon, Edit3 } from "lucide-react";

/**
 * AdminPanel.jsx
 * Responsive admin panel with:
 *  - polling + manual refresh
 *  - slide-over mobile sidebar
 *  - charts (line, pie, stacked bars)
 *  - weekly menu editor
 *  - feedback list with status update
 *
 * Notes:
 * - Uses endpoints: GET /menu/week, GET /feedback, POST /menu, PATCH /feedback/:id/status
 * - Uses your existing API axios instance and useAuthStore (Zustand).
 */

const WEEK_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PIE_COLORS = ["#ef4444", "#f59e0b", "#fbbf24", "#3b82f6", "#10b981", "#8b5cf6"];

export default function AdminPanel() {
  const [week, setWeek] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    day: "",
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
    special: "",
  });
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [now, setNow] = useState(new Date());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pollRef = useRef(null);
  const navigate = useNavigate();

  // useAuthStore should expose user and logout (your existing store)
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);

  // admin name fallback
  const adminName =
    user?.name || user?.fullName || user?.username || (() => {
      const token = localStorage.getItem("fb_token");
      if (!token) return "Admin";
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.name || payload.fullName || payload.username || "Admin";
      } catch {
        return "Admin";
      }
    })();

  // live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // initial fetch + polling
  useEffect(() => {
    fetchAll();

    pollRef.current = setInterval(() => {
      fetchAll();
    }, 15000); // 15s

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchMenu(), fetchFeedbacks()]);
  };

  const fetchMenu = async () => {
    try {
      const { data } = await API.get("/menu/week");
      const arr = Array.isArray(data) ? data : [];
      const sorted = arr.slice().sort((a, b) => {
        const ia = WEEK_ORDER.indexOf(a?.day || "");
        const ib = WEEK_ORDER.indexOf(b?.day || "");
        return ia - ib;
      });
      setWeek(sorted);
    } catch (err) {
      console.error("fetchMenu error:", err?.response?.data || err?.message || err);
      setWeek([]);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data } = await API.get("/feedback");
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchFeedbacks error:", err?.response?.data || err?.message || err);
      setFeedbacks([]);
    }
  };

  // === Form handlers ===
  const editDay = (d) => {
    setSelectedDayId(d._id);
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
    setSelectedDayId(null);
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
    if (!form.day || !form.breakfast || !form.lunch || !form.dinner) {
      alert("Please fill Day, Breakfast, Lunch and Dinner.");
      return;
    }
    try {
      setLoading(true);
      await API.post("/menu", form);
      await fetchMenu();
      resetForm();
    } catch (err) {
      console.error("submitMenu error:", err?.response?.data || err?.message || err);
      alert(err?.response?.data?.message || "Failed to save menu");
    } finally {
      setLoading(false);
    }
  };

  // === Feedback status update ===
  const updateStatus = async (id, status) => {
    try {
      const statusUpdatedBy = adminName;
      const statusUpdatedAt = new Date().toISOString();
      await API.patch(`/feedback/${id}/status`, { status, statusUpdatedBy, statusUpdatedAt });
      setFeedbacks((prev) => prev.map((f) => (f._id === id ? { ...f, status, statusUpdatedBy, statusUpdatedAt } : f)));
    } catch (err) {
      console.error("updateStatus error:", err?.response?.data || err?.message || err);
      alert("Failed to update status");
    }
  };

  // === Derived data for charts ===
  const { lineData, ratingCounts } = useMemo(() => {
    const map = {};
    WEEK_ORDER.forEach((d) => (map[d] = { ratings: [], count: 0 }));

    feedbacks.forEach((f) => {
      const created = f?.createdAt ? new Date(f.createdAt) : null;
      const dayName = created ? created.toLocaleString("en-US", { weekday: "long" }) : null;
      if (!dayName || !map[dayName]) return;
      const r = Number(f.rating) || 0;
      map[dayName].ratings.push(r);
      map[dayName].count += 1;
    });

    const line = WEEK_ORDER.map((d) => {
      const arr = map[d].ratings;
      const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      return { day: d, avgRating: Number(avg.toFixed(2)), feedbackCount: map[d].count };
    });

    const counts = [1, 2, 3, 4, 5].map((v) => ({
      name: `${v}★`,
      value: feedbacks.filter((f) => Number(f.rating) === v).length,
    }));

    return { lineData: line, ratingCounts: counts };
  }, [feedbacks]);

  const reactionChart = useMemo(() => {
    return week.map((m) => ({
      day: m.day || "Unknown",
      breakfastLikes: Array.isArray(m.breakfastLikes) ? m.breakfastLikes.length : 0,
      lunchLikes: Array.isArray(m.lunchLikes) ? m.lunchLikes.length : 0,
      dinnerLikes: Array.isArray(m.dinnerLikes) ? m.dinnerLikes.length : 0,
      breakfastDislikes: Array.isArray(m.breakfastDislikes) ? m.breakfastDislikes.length : 0,
      lunchDislikes: Array.isArray(m.lunchDislikes) ? m.lunchDislikes.length : 0,
      dinnerDislikes: Array.isArray(m.dinnerDislikes) ? m.dinnerDislikes.length : 0,
    }));
  }, [week]);

  // safe image component
  const SafeImage = ({ src, alt, className }) => {
    if (!src) return null;
    return (
      <img
        src={src}
        alt={alt || "img"}
        className={className}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  };

  // Logout helper uses your Zustand store if available, otherwise clears token & navigates
  const handleLogout = () => {
    try {
      if (typeof logoutStore === "function") logoutStore();
    } catch (e) {
      console.warn("logoutStore failed:", e);
    }
    try {
      localStorage.removeItem("fb_token");
    } catch {}
    navigate("/login");
    // reload to ensure protected routes kick in
    setTimeout(() => window.location.reload(), 120);
  };

  // render
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile header */}
      <div className="md:hidden p-3 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileSidebarOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            <MenuIcon size={18} />
          </button>
          <div className="text-lg font-semibold">Food-back Admin</div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-gray-100" onClick={fetchAll} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside
          className={`md:col-span-3 lg:col-span-2 bg-white border rounded-lg p-4 md:block ${
            mobileSidebarOpen ? "block fixed left-3 top-20 z-40 w-64 shadow-xl" : "hidden"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-600">Food-back Admin</h2>
              <p className="text-sm text-gray-500 mt-1">Manage menus & feedback</p>
            </div>
            <div className="md:hidden">
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded hover:bg-gray-100">✕</button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">Signed in as</div>
            <div className="font-semibold">{adminName}</div>
            <div className="text-xs text-gray-500 mt-1">{now.toLocaleDateString()} • {now.toLocaleTimeString()}</div>
          </div>

          <nav className="mt-4 space-y-2">
            <button
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setMobileSidebarOpen(false); }}
              className="w-full text-left p-3 rounded hover:bg-gray-100"
            >
              Overview
            </button>

            <button
              onClick={() => { document.getElementById("weekly-menu")?.scrollIntoView({ behavior: "smooth" }); setMobileSidebarOpen(false); }}
              className="w-full text-left p-3 rounded hover:bg-gray-100"
            >
              Weekly Menu
            </button>

            <button
              onClick={() => { document.getElementById("feedbacks")?.scrollIntoView({ behavior: "smooth" }); setMobileSidebarOpen(false); }}
              className="w-full text-left p-3 rounded hover:bg-gray-100"
            >
              Feedbacks
            </button>

            <button
              onClick={() => { document.getElementById("reactions-dashboard")?.scrollIntoView({ behavior: "smooth" }); setMobileSidebarOpen(false); }}
              className="w-full text-left p-3 rounded hover:bg-gray-100"
            >
              Reactions
            </button>

            <button onClick={() => navigate("/")} className="mt-3 w-full p-3 rounded bg-blue-600 text-white">
              Preview
            </button>

            <button onClick={handleLogout} className="mt-2 w-full p-3 rounded bg-red-500 text-white">
              Logout
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="md:col-span-9 lg:col-span-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Overview & quick actions</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={fetchAll} className="px-3 py-2 border rounded flex items-center gap-2">
                <RefreshCw size={16} /> Refresh
              </button>

              <button onClick={() => navigate("/")} className="px-3 py-2 bg-white border rounded flex items-center gap-2">
                <Home size={16} /> Preview
              </button>

              <button onClick={handleLogout} className="px-3 py-2 bg-red-600 text-white rounded flex items-center gap-2">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 bg-white rounded-xl shadow">
              <div className="text-sm text-gray-500">Total Feedbacks</div>
              <div className="text-3xl font-bold mt-2">{feedbacks.length}</div>
              <div className="text-xs text-gray-400 mt-2">Updated: {now.toLocaleTimeString()}</div>
            </motion.div>

            <motion.div initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 bg-white rounded-xl shadow">
              <div className="text-sm text-gray-500">Average Rating</div>
              <div className="text-3xl font-bold mt-2">
                {feedbacks.length ? (feedbacks.reduce((s, f) => s + (Number(f.rating) || 0), 0) / feedbacks.length).toFixed(1) : "0.0"} ★
              </div>
              <div className="text-xs text-gray-400 mt-2">From all feedback</div>
            </motion.div>

            <motion.div initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 bg-white rounded-xl shadow">
              <div className="text-sm text-gray-500">Menu Days</div>
              <div className="text-3xl font-bold mt-2">{week.length} / 7</div>
              <div className="text-xs text-gray-400 mt-2">Weekly menu entries</div>
            </motion.div>
          </div>

          {/* charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-5 shadow">
              <h3 className="text-lg font-medium">Daily Rating & Feedback Count</h3>
              <div style={{ height: 300 }} className="mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgRating" name="Avg Rating" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false}/>
                    <Line type="monotone" dataKey="feedbackCount" name="Feedback Count" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow">
              <h3 className="text-lg font-medium">Rating Distribution</h3>
              <div style={{ height: 300 }} className="mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ratingCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={36} label>
                      {ratingCounts.map((entry, idx) => (
                        <Cell key={`c-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="#fff" strokeWidth={1} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* reactions stacked bar */}
          <div id="reactions-dashboard" className="bg-white rounded-xl p-5 shadow mb-8">
            <h3 className="text-lg font-medium">Daily Like / Dislike (stacked by meal)</h3>
            <div style={{ height: 360 }} className="mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reactionChart} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {/* Likes stack */}
                  <Bar stackId="likes" dataKey="breakfastLikes" name="Breakfast 👍" fill="#34d399" />
                  <Bar stackId="likes" dataKey="lunchLikes" name="Lunch 👍" fill="#60a5fa" />
                  <Bar stackId="likes" dataKey="dinnerLikes" name="Dinner 👍" fill="#a78bfa" />
                  {/* Dislikes stack */}
                  <Bar stackId="dislikes" dataKey="breakfastDislikes" name="Breakfast 👎" fill="#fb7185" />
                  <Bar stackId="dislikes" dataKey="lunchDislikes" name="Lunch 👎" fill="#f59e0b" />
                  <Bar stackId="dislikes" dataKey="dinnerDislikes" name="Dinner 👎" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-xs text-gray-500">Each grouped bar shows likes/dislikes stacked by breakfast/lunch/dinner.</div>
          </div>

          {/* Weekly menu + editor */}
          <div id="weekly-menu" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-5 shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Weekly Menu</h3>
                <button onClick={resetForm} className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">New</button>
              </div>

              <div className="mt-4 space-y-3">
                {week.length === 0 ? (
                  <div className="text-sm text-gray-500">No menus added yet.</div>
                ) : (
                  week.map((d) => (
                    <div key={d._id} className="p-4 rounded-xl bg-gray-50 flex justify-between items-start gap-4 border">
                      <div>
                        <div className="text-sm text-gray-400">{d.day}</div>
                        <div className="mt-2 text-sm">
                          <div><strong>Breakfast:</strong> {d.breakfast}</div>
                          <div><strong>Lunch:</strong> {d.lunch}</div>
                          <div><strong>Dinner:</strong> {d.dinner}</div>
                          {d.special && <div className="mt-1 text-xs text-indigo-600">Special: {d.special}</div>}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button onClick={() => editDay(d)} className="px-3 py-1 rounded bg-blue-600 text-white flex items-center gap-2">
                          <Edit3 size={14} /> Edit
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow">
              <h3 className="text-lg font-medium">{selectedDayId ? "Edit Menu" : "Create Menu"}</h3>

              <form onSubmit={submitMenu} className="mt-4 space-y-3">
                <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="w-full p-3 border rounded-lg" required>
                  <option value="">Select day</option>
                  {WEEK_ORDER.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>

                <input value={form.breakfast} onChange={(e) => setForm({ ...form, breakfast: e.target.value })} placeholder="Breakfast" className="w-full p-3 border rounded-lg" required />
                <input value={form.lunch} onChange={(e) => setForm({ ...form, lunch: e.target.value })} placeholder="Lunch" className="w-full p-3 border rounded-lg" required />
                <input value={form.snacks} onChange={(e) => setForm({ ...form, snacks: e.target.value })} placeholder="Snacks (optional)" className="w-full p-3 border rounded-lg" />
                <input value={form.dinner} onChange={(e) => setForm({ ...form, dinner: e.target.value })} placeholder="Dinner" className="w-full p-3 border rounded-lg" required />
                <input value={form.special} onChange={(e) => setForm({ ...form, special: e.target.value })} placeholder="Special (optional)" className="w-full p-3 border rounded-lg" />

                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white">
                    {loading ? "Saving..." : "Save Menu"}
                  </button>
                  <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border">Reset</button>
                </div>
              </form>
            </div>
          </div>

          {/* Feedbacks */}
          <div id="feedbacks" className="bg-white rounded-xl p-5 shadow">
            <h3 className="text-lg font-medium mb-4">Student Feedbacks</h3>

            {feedbacks.length === 0 ? (
              <div className="text-sm text-gray-500">No feedbacks yet.</div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((f) => (
                  <div key={f._id} className="p-4 rounded-xl bg-gray-50 border flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                        {f.userId?.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{f.userId?.name || "Anonymous"}</div>
                          <div className="text-xs text-gray-500">{f.createdAt ? new Date(f.createdAt).toLocaleString() : ""}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-700">{f.mealType} • <span className="font-bold">{f.rating}★</span></div>
                          <div className="mt-2">
                            {f.photoUrl && <SafeImage src={f.photoUrl} alt="feedback" className="w-44 h-32 object-cover rounded" />}
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-gray-700">{f.message}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${f.status === "Resolved" ? "bg-green-100 text-green-800" : f.status === "Viewed" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"}`}>
                            {f.status || "Pending"}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button disabled={f.status === "Viewed" || f.status === "Resolved"} onClick={() => updateStatus(f._id, "Viewed")} className="px-3 py-1 rounded bg-amber-100 hover:bg-amber-200">Mark Viewed</button>

                          <button disabled={f.status === "Resolved"} onClick={() => updateStatus(f._id, "Resolved")} className="px-3 py-1 rounded bg-emerald-100 hover:bg-emerald-200">Resolve</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: 24 }} />
        </main>
      </div>
    </div>
  );
}