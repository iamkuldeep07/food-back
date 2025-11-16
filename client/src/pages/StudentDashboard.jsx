// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import FeedbackForm from "../components/FeedbackForm";
import MyFeedback from "../components/MyFeedback";
import { useAuthStore } from "../context/authStore";
import { useNavigate } from "react-router-dom";
import { Utensils, LogOut, PenSquare, RefreshCw } from "lucide-react";

export default function StudentDashboard() {
  const [todayMenu, setTodayMenu] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  // Fetch today's menu
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await API.get("/menu/today");
        setTodayMenu(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMenu();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-sm shadow-md border border-gray-200 p-6 rounded-2xl flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Food-back Hub
            </h1>
            <p className="text-gray-600 text-sm">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow hover:shadow-lg transition"
              onClick={() => navigate("/admin")}
            >
              Admin
            </button>

            <button
              className="p-3 rounded-xl bg-red-500 text-white shadow hover:bg-red-600"
              onClick={logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* TODAY'S MENU */}
        <section className="bg-white/70 backdrop-blur-md border border-gray-200 p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Utensils className="text-blue-600" size={20} />
            Today's Menu
          </h2>

          {todayMenu ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {[
                ["Breakfast", todayMenu.breakfast, "from-yellow-50 to-yellow-100"],
                ["Lunch", todayMenu.lunch, "from-green-50 to-green-100"],
                ["Snacks", todayMenu.snacks || "—", "from-purple-50 to-purple-100"],
                ["Dinner", todayMenu.dinner, "from-blue-50 to-blue-100"],
              ].map(([label, value, bg], i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border bg-gradient-to-br ${bg} shadow-sm hover:shadow-md transition-all`}
                >
                  <h3 className="font-semibold text-gray-800">{label}</h3>
                  <p className="text-gray-700 mt-1">{value}</p>
                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-500">No menu available for today.</p>
          )}
        </section>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
          >
            <PenSquare size={18} />
            {showForm ? "Close Form" : "Give Feedback"}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl bg-white shadow hover:bg-gray-50 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* FEEDBACK FORM */}
        {showForm && (
          <div className="mb-8 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200">
            <FeedbackForm
              onDone={() => setShowForm(false)}
            />
          </div>
        )}

        {/* MY FEEDBACK SECTION */}
        <div className="bg-white/70 backdrop-blur-md border border-gray-200 p-6 rounded-2xl shadow-lg mb-14">
          <MyFeedback />
        </div>

      </div>

      {/* FLOATING FEEDBACK BUTTON (Mobile) */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="md:hidden fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-xl hover:scale-105 transition transform"
      >
        <PenSquare size={22} />
      </button>
    </div>
  );
}