import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { BookOpen } from "lucide-react";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [trialInfo, setTrialInfo] = useState(null);
  const [error, setError] = useState(null);

  // Fetch course + enrollment info
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(`/courses/${id}`);
        setCourse(data);

        // If user logged in, check access
        if (user) {
          const accessRes = await axios.get(`/courses/${id}/access`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (accessRes.data.access) {
            setEnrolled(true);
            setTrialInfo({
              trialEndsAt: accessRes.data.trialEndsAt,
              hasPaid: accessRes.data.hasPaid,
            });
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch course", err);
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user, token]);

  // Handle enrollment + trial setup
  const handleEnroll = async () => {
    if (!user) return navigate("/login");

    try {
      const res = await axios.post(
        `/courses/${id}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Enrollment response:", res.data);

      // Ensure we got a valid date
      const trialEndsAt = res.data.trialEndsAt
        ? new Date(res.data.trialEndsAt).toISOString()
        : null;

      setEnrolled(true);
      setTrialInfo({ trialEndsAt, hasPaid: false });

      alert(res.data.message || "Enrolled successfully!");
    } catch (err) {
      console.error("❌ Enrollment error:", err);
      const msg = err.response?.data?.message || "Enrollment failed.";
      alert(msg);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading course...</div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!course)
    return <div className="p-10 text-center text-gray-500">Course not found</div>;

  const trialExpired =
    trialInfo &&
    !trialInfo.hasPaid &&
    trialInfo.trialEndsAt &&
    new Date() > new Date(trialInfo.trialEndsAt);

  // Format date safely
  const formattedTrialEnd = trialInfo?.trialEndsAt
    ? new Date(trialInfo.trialEndsAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-8">
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-2">
        Instructor: {course.instructor?.name || "Unknown"}
      </p>
      <p className="text-sm text-gray-500 mb-4">
        Category: {course.category || "Uncategorized"}
      </p>
      <p className="text-gray-700 mb-6">{course.description}</p>

      {/* Enrollment / Trial Logic */}
      {!enrolled ? (
        <button
          onClick={handleEnroll}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Enroll for Free (21-Day Trial)
        </button>
      ) : trialExpired ? (
        <div className="text-center">
          <p className="text-red-500 mb-2 font-medium">
            Your 21-day trial has expired.
          </p>
          <button className="bg-gray-400 text-white px-5 py-2 rounded-lg cursor-not-allowed">
            Trial Ended
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <p className="text-green-600 font-semibold">
            Trial active — ends on <span className="font-bold">{formattedTrialEnd}</span>
          </p>
          <button
            onClick={() => navigate(`/courses/${id}/content`)}
            className="flex items-center bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <BookOpen className="mr-2 h-5 w-5" /> Go to Course Content
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
