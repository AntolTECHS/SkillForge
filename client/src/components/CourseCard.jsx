import { Link } from "react-router-dom";
import { BookOpen, User, DollarSign } from "lucide-react";

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 w-[95%] sm:w-full max-w-sm mx-auto">
      {/* Course Image */}
      <div className="relative w-full h-44 bg-gray-100">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-950 to-blue-900">
            <BookOpen className="w-16 h-16 text-white opacity-80" />
          </div>
        )}

        {/* Optional tags */}
        {(course.isFree || course.skillLevel) && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-2">
            {course.isFree && (
              <span className="bg-white text-blue-900 text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                Free Trial
              </span>
            )}
            {course.skillLevel && (
              <span className="bg-white text-blue-900 text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                {course.skillLevel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Course Details */}
      <div className="p-5">
        {course.provider && (
          <div className="flex items-center space-x-2 mb-2">
            {course.providerLogo && (
              <img
                src={course.providerLogo}
                alt={course.provider}
                className="w-5 h-5 rounded-sm"
              />
            )}
            <span className="text-sm text-gray-700 font-medium">
              {course.provider}
            </span>
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {course.title}
        </h3>

        {course.subtitle && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {course.subtitle}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <User className="w-4 h-4" />
            <span className="text-sm">
              {course.teacher?.name || course.teacher || "Instructor"}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-blue-900 font-bold">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">{course.price || "0"}</span>
          </div>
        </div>

        <Link
          to={`/course/${course._id}`}
          className="block w-full text-center bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
