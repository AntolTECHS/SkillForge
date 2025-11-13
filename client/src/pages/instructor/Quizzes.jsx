import React from "react";
import { Edit3, BarChart3, PlusCircle } from "lucide-react";

const Quizzes = () => {
  const quizzes = [
    { title: "React Basics Quiz", questions: 10, attempts: 120, avgScore: 85 },
    { title: "JavaScript Intermediate", questions: 15, attempts: 98, avgScore: 72 },
    { title: "Node.js Fundamentals", questions: 12, attempts: 75, avgScore: 80 },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg">
          <PlusCircle className="w-5 h-5" /> Create New Quiz
        </button>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="py-3 px-4">Quiz Title</th>
              <th className="py-3 px-4">Questions</th>
              <th className="py-3 px-4">Attempts</th>
              <th className="py-3 px-4">Avg Score</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{quiz.title}</td>
                <td className="py-3 px-4">{quiz.questions}</td>
                <td className="py-3 px-4">{quiz.attempts}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    {quiz.avgScore}%
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Edit3 className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Quizzes;
