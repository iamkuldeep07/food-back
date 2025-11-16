// src/components/PieChartCard.jsx
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

const COLORS = ["#ef4444","#f59e0b","#fbbf24","#3b82f6","#10b981"];

export default function PieChartCard({ data = [] }) {
  const safe = Array.isArray(data) ? data : [];
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><PieIcon size={20} className="text-purple-600" /> Rating Distribution</h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie data={safe} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={3} label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} isAnimationActive={false}>
            {safe.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="#fff" strokeWidth={2} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}