import React from "react";
import { BookOpen, Users, DollarSign, Clock } from "lucide-react";

const InstructorDashboard = () => {
  const stats = [
    { icon: BookOpen, label: "Courses", value: 12, color: "bg-blue-100 text-blue-700" },
    { icon: Users, label: "Students", value: 358, color: "bg-green-100 text-green-700" },
    { icon: DollarSign, label: "Earnings", value: "$2,450", color: "bg-yellow-100 text-yellow-700" },
    { icon: Clock, label: "Pending Reviews", value: 3, color: "bg-red-100 text-red-700" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="bg-white shadow rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <h2 className="text-2xl font-semibold">{value}</h2>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Active Courses */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Active Courses</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b text-gray-600">
              <th className="py-2">Course</th>
              <th className="py-2">Students</th>
              <th className="py-2">Progress</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-medium">React for Beginners</td>
              <td>120</td>
              <td>80%</td>
              <td><span className="text-green-600 font-semibold">Published</span></td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Advanced Node.js</td>
              <td>85</td>
              <td>60%</td>
              <td><span className="text-yellow-600 font-semibold">Draft</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <ul className="space-y-3 text-gray-700">
          <li>✅ You published <b>“Intro to JavaScript”</b></li>
          <li>💬 New student comment on <b>“React for Beginners”</b></li>
          <li>📈 25 new students enrolled this week</li>
        </ul>
      </div>
    </div>
  );
};

export default InstructorDashboard;
