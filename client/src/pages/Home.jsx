import { useState, useEffect } from 'react';
import axios from '../api/axios';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import { AlertCircle, BookOpen } from 'lucide-react';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/courses'); // ✅ backend returns { courses, total, page, totalPages }
      setCourses(response.data.courses || []); // ✅ access nested array
      setTotal(response.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <BookOpen className="w-12 h-12 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold">Welcome to SkillForge</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Unlock your potential with expert-led courses. Learn new skills and advance your career.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Available Courses</h2>
          <p className="text-gray-600">{total} courses available</p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No courses available at the moment</p>
            <p className="text-gray-500 mt-2">Check back soon for new courses!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
