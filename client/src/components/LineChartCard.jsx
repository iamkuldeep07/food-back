// src/components/LineChartCard.jsx
import React from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

export default function LineChartCard({ data = [] }) {
  const safe = Array.isArray(data) ? data : [];
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-blue-600" /> Daily Rating & Feedback Count</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={safe}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} />
          <YAxis yAxisId="left" domain={[0,5]} ticks={[0,1,2,3,4,5]} tick={{ fill: "#6b7280", fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: "#9ca3af" }} />
          <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Line yAxisId="left" type="monotone" dataKey="avgRating" name="Avg Rating" stroke="#3b82f6" strokeWidth={3} dot={{ r:5 }} activeDot={{ r:7 }} isAnimationActive={false} />
          <Line yAxisId="right" type="monotone" dataKey="feedbackCount" name="Feedback Count" stroke="#10b981" strokeWidth={3} dot={{ r:5 }} activeDot={{ r:7 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}