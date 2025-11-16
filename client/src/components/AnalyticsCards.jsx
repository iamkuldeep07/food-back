// src/components/AnalyticsCards.jsx
import React from "react";
import { Users, TrendingUp, Edit3 } from "lucide-react";

export default function AnalyticsCards({ totalFeedbacks=0, avgRating=0, menuCount=0 }) {
  const cards = [
    { title: "Total Feedbacks", value: totalFeedbacks, icon: <Users size={22} className="text-purple-600" />, bg: "from-purple-50 to-purple-100" },
    { title: "Average Rating", value: `${(Number(avgRating) || 0).toFixed(1)} ★`, icon: <TrendingUp size={22} className="text-blue-600" />, bg: "from-blue-50 to-blue-100" },
    { title: "Menu Days Added", value: `${menuCount} / 7`, icon: <Edit3 size={22} className="text-green-600" />, bg: "from-green-50 to-green-100" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((c,i) => (
        <div key={i} className={`p-6 rounded-2xl shadow-lg border border-gray-100 bg-gradient-to-br ${c.bg} backdrop-blur-sm hover:shadow-xl transition-all`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">{c.icon}</div>
            <div className="text-sm text-gray-600 font-medium">{c.title}</div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{c.value}</div>
        </div>
      ))}
    </div>
  );
}