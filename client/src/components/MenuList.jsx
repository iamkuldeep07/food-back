// src/components/MenuList.jsx
import React from "react";

const WEEK_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function MenuList({ week = [], onEdit = () => {} }) {
  const sorted = Array.isArray(week) ? week.slice().sort((a,b) => WEEK_ORDER.indexOf(a.day) - WEEK_ORDER.indexOf(b.day)) : [];
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Weekly Menu</h3>
      </div>

      <div className="space-y-4">
        {sorted.length === 0 ? <div className="text-center py-8 text-sm text-gray-500">No menus added yet. Start by creating one.</div> :
          sorted.map((d, idx) => (
            <div key={d._id || d.day+idx} className="p-5 rounded-xl border bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-bold text-lg text-gray-800 mb-2">{d.day}</div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><span className="w-20 text-gray-500 font-medium">Breakfast:</span><span>{d.breakfast}</span></div>
                    <div className="flex items-center gap-2"><span className="w-20 text-gray-500 font-medium">Lunch:</span><span>{d.lunch}</span></div>
                    {d.snacks && <div className="flex items-center gap-2"><span className="w-20 text-gray-500 font-medium">Snacks:</span><span className="text-indigo-600">{d.snacks}</span></div>}
                    <div className="flex items-center gap-2"><span className="w-20 text-gray-500 font-medium">Dinner:</span><span>{d.dinner}</span></div>
                    {d.special && <div className="flex items-center gap-2 pt-2 border-t border-gray-200"><span className="w-20 text-gray-500 font-medium">Special:</span><span className="text-rose-600 font-medium">{d.special}</span></div>}
                  </div>
                </div>
                <button onClick={() => onEdit(d)} className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">Edit</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}