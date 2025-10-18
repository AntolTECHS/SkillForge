import { Link } from 'react-router-dom';
import { BookOpen, User, DollarSign } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
        <BookOpen className="w-16 h-16 text-white opacity-80" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        {course.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {course.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <User className="w-4 h-4" />
            <span className="text-sm">{course.teacher?.name || course.teacher}</span>
          </div>

          <div className="flex items-center space-x-1 text-blue-600 font-bold">
            <DollarSign className="w-5 h-5" />
            <span className="text-lg">{course.price || 0}</span>
          </div>
        </div>

        <Link
          to={`/course/${course._id}`}
          className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
