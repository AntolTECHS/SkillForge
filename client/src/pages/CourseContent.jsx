import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Loader2,
  PlayCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CourseContent() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [openModules, setOpenModules] = useState({});
  const [error, setError] = useState("");

  // Fetch course content
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          `${API_BASE_URL}/api/courses/${id}/content`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // ✅ FIX: Extract the nested "course" object
        const courseData = data.course || data;
        setCourse(courseData);

        // ✅ Set first lesson if available
        if (courseData.modules?.length > 0) {
          const firstModule = courseData.modules[0];
          if (firstModule.lessons?.length > 0) {
            setActiveLesson(firstModule.lessons[0]);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching course content:", err);
        setError("Failed to load course content.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const toggleModule = (moduleId) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading course content...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 font-medium">
        {error}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Course not found.
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          {course.title}
        </h2>

        {course.modules?.map((module) => (
          <div key={module._id} className="mb-3">
            <button
              onClick={() => toggleModule(module._id)}
              className="flex items-center justify-between w-full text-left text-gray-800 font-medium hover:text-indigo-600 transition"
            >
              <span>{module.title}</span>
              {openModules[module._id] ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {openModules[module._id] && (
              <div className="ml-4 mt-2 space-y-1">
                {module.lessons?.map((lesson) => (
                  <button
                    key={lesson._id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`flex items-center w-full text-left px-2 py-1.5 rounded-md ${
                      activeLesson?._id === lesson._id
                        ? "bg-indigo-50 text-indigo-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {lesson.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {activeLesson ? (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              {activeLesson.title}
            </h1>

            {activeLesson.videoUrl ? (
              <div className="aspect-video mb-4">
                <iframe
                  src={activeLesson.videoUrl}
                  title={activeLesson.title}
                  className="w-full h-full rounded-lg shadow-md"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center text-gray-500">
                No video available
              </div>
            )}

            <p className="text-gray-700 leading-relaxed">
              {activeLesson.description || "No description available."}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a lesson to start learning.
          </div>
        )}
      </main>
    </div>
  );
}
