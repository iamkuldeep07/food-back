// src/components/Sidebar.jsx
import React from "react";
import { Home, LogOut, Edit3, BarChart3, TrendingUp, Users, Calendar, Clock } from "lucide-react";

export default function Sidebar({ adminName="Admin", now=new Date(), navigate = () => {} }) {
  return (
    <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 shadow-sm hidden md:flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Admin Panel</h2>
        <p className="text-sm text-gray-500 mt-1">Manage Menu & Feedbacks</p>

        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="text-xs text-gray-500 flex items-center gap-1"><Users size={12} /> Signed in as</div>
          <div className="font-semibold text-gray-800 mt-1">{adminName}</div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-3"><Calendar size={14} /> {now.toLocaleDateString()}</div>
          <div className="flex items-center gap-2 text-xs text-gray-500"><Clock size={14} /> {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      <nav className="px-4 py-2 space-y-1 flex-1">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium"><BarChart3 size={18} className="text-blue-600" /> Overview</button>
        <button onClick={() => document.getElementById("weekly-menu")?.scrollIntoView({ behavior: 'smooth' })} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 text-gray-700 font-medium"><Edit3 size={18} className="text-green-600" /> Weekly Menu</button>
        <button onClick={() => document.getElementById("feedbacks")?.scrollIntoView({ behavior: 'smooth' })} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 font-medium"><TrendingUp size={18} className="text-purple-600" /> Feedbacks</button>
      </nav>

      <div className="p-4 space-y-2">
        <button onClick={() => navigate("/")} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md"><Home size={18} /> Preview</button>
        <button onClick={() => { localStorage.removeItem("fb_token"); window.location.reload(); }} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium shadow-md"><LogOut size={18} /> Logout</button>
      </div>
    </aside>
  );
}