import { useState } from "react";
import { Download } from "lucide-react";

const StudentCertificates = () => {
  // Dummy certificate data (replace later with API data)
  const [certificates] = useState([
    {
      id: 1,
      course: "React Mastery",
      date: "2025-09-12",
      fileUrl: "/certificates/react-mastery.pdf",
    },
    {
      id: 2,
      course: "Node.js Backend Bootcamp",
      date: "2025-10-01",
      fileUrl: "/certificates/node-bootcamp.pdf",
    },
  ]);

  const handleDownload = (fileUrl) => {
    // trigger download
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split("/").pop();
    link.click();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🎓 Your Certificates</h1>
      <p className="text-gray-600 mb-8">
        View and download certificates for your completed courses.
      </p>

      {certificates.length === 0 ? (
        <div className="text-gray-500">No certificates available yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                {cert.course}
              </h2>
              <p className="text-gray-600 mb-4">
                Earned on <span className="font-medium">{cert.date}</span>
              </p>

              <button
                onClick={() => handleDownload(cert.fileUrl)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;
