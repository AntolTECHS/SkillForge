const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 w-[95%] sm:w-full max-w-xs mx-auto cursor-pointer">
      {/* Thumbnail Section */}
      <div className="relative w-full h-48 p-3">
        <div className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
          <img
            src={
              course.image ||
              // 🎨 AI Gradient Image (beautiful abstract fallback)
              "https://img.freepik.com/free-vector/gradient-fluid-abstract-background_23-2149187843.jpg"
            }
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 rounded-2xl"
          />

          {/* Free or Price Badge */}
          <div className="absolute top-5 right-6 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
            {course.isFree ? "Free" : course.price ? `$${course.price}` : "Free Trial"}
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="px-5 pb-5">
        {/* Organization */}
        <div className="text-sm font-medium text-gray-500 mb-1">
          {course.organization || "Vanderbilt University"}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2 mb-2">
          {course.title}
        </h3>

        {/* Subtitle */}
        {course.subtitle && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {course.subtitle}
          </p>
        )}

        {/* Instructor */}
        <div className="text-sm text-gray-500">
          {course.teacher?.name || course.teacher || "Instructor"}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
