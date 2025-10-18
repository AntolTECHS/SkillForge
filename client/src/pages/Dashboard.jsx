import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import Loader from '../components/Loader';
import { BookOpen, AlertCircle, GraduationCap } from 'lucide-react';

const Dashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/student/courses');
      setEnrolledCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load enrolled courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <GraduationCap className="w-10 h-10 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">My Dashboard</h1>
          </div>
          <p className="text-gray-600 text-lg">Track your learning progress and enrolled courses</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Enrolled Courses</h2>

          {enrolledCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">No courses enrolled yet</p>
              <p className="text-gray-500 mb-6">Start learning by enrolling in a course!</p>
              <Link
                to="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded">
                      Enrolled
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {course.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      Teacher: <span className="font-medium">{course.teacher?.name || course.teacher}</span>
                    </span>
                  </div>

                  <Link
                    to={`/course/${course._id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Continue Learning
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {enrolledCourses.length}
            </div>
            <div className="text-gray-600 font-medium">Courses Enrolled</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {enrolledCourses.length}
            </div>
            <div className="text-gray-600 font-medium">Active Courses</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">0</div>
            <div className="text-gray-600 font-medium">Completed Courses</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
