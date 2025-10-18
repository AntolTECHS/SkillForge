import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { BookOpen, User, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/courses/${id}`);
      setCourse(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      setError(null);
      setEnrollmentMessage(null);

      const response = await axios.post('/payment/initiate', {
        courseId: id,
      });

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        setEnrollmentMessage('Payment initiated successfully');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center">
          <AlertCircle className="w-6 h-6 mr-3" />
          <div>
            <h3 className="font-semibold mb-1">Error Loading Course</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {enrollmentMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {enrollmentMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
            <div className="flex items-center mb-4">
              <BookOpen className="w-12 h-12 mr-4" />
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                {course.description && (
                  <p className="text-blue-100 text-lg">{course.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-6">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-blue-100 text-sm">Instructor</p>
                  <p className="font-semibold">{course.teacher?.name || course.teacher}</p>
                </div>
              </div>

              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-blue-100 text-sm">Price</p>
                  <p className="font-semibold text-2xl">${course.price || 0}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-blue-100 text-sm">Duration</p>
                  <p className="font-semibold">Self-paced</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {course.description || 'Enhance your skills with this comprehensive course designed by industry experts. Learn at your own pace and gain practical knowledge that you can apply immediately.'}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Master the core concepts and principles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Build practical skills through hands-on projects</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Get guidance from experienced instructors</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Receive a certificate upon completion</span>
                </li>
              </ul>
            </div>

            <div className="border-t pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">${course.price || 0}</p>
                  <p className="text-gray-600">One-time payment</p>
                </div>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Processing...' : 'Enroll Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
