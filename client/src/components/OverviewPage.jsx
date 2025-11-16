// src/components/OverviewPage.jsx
import React from "react";
import { Users, List, MessageSquare } from "lucide-react";

export default function OverviewPage({ menus, feedbacks, users }) {
  const totalStudents = users.length;
  const totalMenus = menus.length;
  const totalFeedbacks = feedbacks.length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
          <Users size={40} className="text-blue-600" />
          <div>
            <p className="text-gray-500 text-sm">Total Students</p>
            <h3 className="text-2xl font-bold">{totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
          <List size={40} className="text-green-600" />
          <div>
            <p className="text-gray-500 text-sm">Menu Days Added</p>
            <h3 className="text-2xl font-bold">{totalMenus} / 7</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
          <MessageSquare size={40} className="text-purple-600" />
          <div>
            <p className="text-gray-500 text-sm">Total Feedbacks</p>
            <h3 className="text-2xl font-bold">{totalFeedbacks}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}