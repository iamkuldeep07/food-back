import React, { useEffect, useState } from "react";
import API from "../api";
import FeedbackForm from "../components/FeedbackForm";
import MyFeedback from "../components/MyFeedback";
import { useAuthStore } from "../context/authStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const [todayMenu, setTodayMenu] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busyMeal, setBusyMeal] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // increments to force child refresh

  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || user?._id;

  const fetchToday = async () => {
    try {
      const { data } = await API.get("/menu/today");
      setTodayMenu(data);
    } catch (err) {
      console.error("fetchToday:", err?.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchToday();
    // optional polling for live counts
    const t = setInterval(fetchToday, 30000);
    return () => clearInterval(t);
  }, []);

  // returns "like"|"dislike"|null
  const myMealReaction = (meal) => {
    if (!todayMenu || !userId) return null;
    const uid = String(userId);
    const likeArr = todayMenu[`${meal}Likes`] || [];
    const dislikeArr = todayMenu[`${meal}Dislikes`] || [];
    if (likeArr.some((x) => String(x.userId) === uid)) return "like";
    if (dislikeArr.some((x) => String(x.userId) === uid)) return "dislike";
    return null;
  };

  const reactToMeal = async (meal, type) => {
    if (!todayMenu || !userId) {
      alert("Please login to react.");
      return;
    }
    setBusyMeal(meal);
    try {
      await API.post("/menu/meal-react", { menuId: todayMenu._id, meal, reaction: type });
      // Refresh local menu counts
      await fetchToday();
      // also tell MyFeedback (and any child listening) to refresh if needed
      setRefreshTrigger((n) => n + 1);
    } catch (err) {
      console.error("reactToMeal error:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Reaction failed");
    } finally {
      setBusyMeal(null);
    }
  };

  // Proper refresh: update today's menu AND increment refreshTrigger so children reload
  const handleRefresh = async () => {
    await fetchToday();
    setRefreshTrigger((n) => n + 1);
  };

  const MealCard = ({ mealKey, label }) => {
    const likes = todayMenu?.[`${mealKey}Likes`]?.length || 0;
    const dislikes = todayMenu?.[`${mealKey}Dislikes`]?.length || 0;
    const reacted = myMealReaction(mealKey);

    return (
      <div className="p-4 border rounded-lg shadow-sm bg-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold">{label}</div>
            <div className="text-gray-700 mt-1">{todayMenu?.[mealKey] ?? "—"}</div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500">Likes / Dislikes</div>
            <div className="mt-2 flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => reactToMeal(mealKey, "like")}
                disabled={busyMeal === mealKey}
                className={`px-3 py-1 rounded-lg ${
                  reacted === "like" ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
                }`}
              >
                👍 {likes}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => reactToMeal(mealKey, "dislike")}
                disabled={busyMeal === mealKey}
                className={`px-3 py-1 rounded-lg ${
                  reacted === "dislike" ? "bg-red-600 text-white" : "bg-red-100 text-red-800"
                }`}
              >
                👎 {dislikes}
              </motion.button>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              {reacted ? <>You reacted: <strong>{reacted}</strong></> : "No reaction yet"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Food-back Hub</h1>
            <p className="text-xs text-gray-500 mt-1">Signed in as <strong>{user?.name ?? "Student"}</strong></p>
          </div>

          <div className="flex gap-2">
            <button className="p-2 border rounded" onClick={() => navigate("/admin")}>Admin</button>
            <button className="p-2 bg-red-500 text-white rounded" onClick={logout}>Logout</button>
          </div>
        </header>

        <section className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Today's Menu</h2>
              <p className="text-sm text-gray-500">React to each meal</p>
            </div>

            <div className="text-right text-sm text-gray-500 space-y-1">
              <div>Breakfast: 👍 {todayMenu?.breakfastLikes?.length || 0} / 👎 {todayMenu?.breakfastDislikes?.length || 0}</div>
              <div>Lunch: 👍 {todayMenu?.lunchLikes?.length || 0} / 👎 {todayMenu?.lunchDislikes?.length || 0}</div>
              <div>Snacks: 👍 {todayMenu?.snacksLikes?.length || 0} / 👎 {todayMenu?.snacksDislikes?.length || 0}</div>
              <div>Dinner: 👍 {todayMenu?.dinnerLikes?.length || 0} / 👎 {todayMenu?.dinnerDislikes?.length || 0}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <MealCard mealKey="breakfast" label="Breakfast" />
            <MealCard mealKey="lunch" label="Lunch" />
            <MealCard mealKey="snacks" label="Snacks" />
            <MealCard mealKey="dinner" label="Dinner" />
          </div>
        </section>

        <div className="flex gap-3 mb-4">
          <button className="p-2 bg-blue-600 text-white rounded" onClick={() => setShowForm(!showForm)}>Give Feedback</button>
        </div>

        {showForm && <FeedbackForm onDone={() => {
          // after feedback submitted close form and refresh both lists
          setShowForm(false);
          fetchToday();
          setRefreshTrigger((n) => n + 1);
        }} />}

        {/* pass refreshTrigger so MyFeedback refetches when this increments */}
        <MyFeedback refresh={refreshTrigger} />
      </div>
    </div>
  );
}