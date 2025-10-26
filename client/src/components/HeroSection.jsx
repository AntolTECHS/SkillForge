import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = ({
  title = "Welcome to SkillForge",
  subtitle = "A global learning community where curiosity meets opportunity. Discover micro-courses, collaborate with peers, and forge the skills that shape tomorrow’s world.",
  buttonLabel = "Explore Programs",
  showButton = true,
}) => {
  const navigate = useNavigate();

  const handleExplorePrograms = () => {
    navigate("/courses");
  };

  return (
    <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white">
      <div className="px-10 sm:px-16 md:px-24 lg:px-32 xl:px-40 py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left Section */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-3">
            <BookOpen className="w-10 h-10 text-blue-200" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {title}
            </h1>
          </div>

          <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-xl mx-auto lg:mx-0">
            {subtitle}
          </p>

          {showButton && (
            <div className="pt-4">
              <button
                onClick={handleExplorePrograms}
                className="inline-flex items-center rounded-md bg-blue-700 text-white px-6 py-3 font-semibold shadow hover:bg-blue-800 transition"
              >
                {buttonLabel}
              </button>
            </div>
          )}
        </div>

        {/* Right Section: Image */}
        <div className="flex justify-center lg:justify-end">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80"
            alt="Collaborative learning"
            className="w-full max-w-lg rounded-lg shadow-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
