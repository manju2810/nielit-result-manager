import { useState } from "react";
import Navbar from "../components/Navbar";
import StudentRegUpload from "../components/uploads/StudentRegUpload";
import ExamRegUpload from "../components/uploads/ExamRegUpload";
import ResultUpload from "../components/uploads/ResultUpload";

const cards = [
  {
    id: "student_reg",
    icon: "👤",
    title: "Student Registration",
    badge: "One-time",
    badgeColor: "bg-purple-100 text-purple-700",
    description: "Upload when new students enroll. Contains Name, DOB, Address, Batch info.",
    buttonLabel: "Upload Student Registration",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
  },
  {
    id: "exam_reg",
    icon: "📋",
    title: "Exam Registration",
    badge: "Per Cycle",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "Upload every Jan/July cycle. Contains which subjects each student registered for.",
    buttonLabel: "Upload Exam Registration",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: "result",
    icon: "📊",
    title: "Result Sheet",
    badge: "Per Cycle",
    badgeColor: "bg-green-100 text-green-700",
    description: "Upload after results are declared. Highest grade per subject is always retained.",
    buttonLabel: "Upload Result Sheet",
    buttonColor: "bg-green-600 hover:bg-green-700",
  },
];

const UploadChooserPage = () => {
  const [active, setActive] = useState(null);
  const [course, setCourse] = useState("O_LEVEL");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Upload Data</h1>
          <p className="text-gray-500 text-sm mb-6">
            Select what you want to upload. Each section is independent — upload only what you need.
          </p>

          {/* Course selector */}
          <div className="bg-white rounded-2xl shadow p-4 mb-8 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Course:</label>
            <select
              value={course}
              onChange={(e) => { setCourse(e.target.value); setActive(null); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="O_LEVEL">O-Level</option>
              <option value="A_LEVEL">A-Level</option>
            </select>
            <span className="text-xs text-gray-400">
              Selected: {course === "O_LEVEL" ? "O-Level" : "A-Level"}
            </span>
          </div>

          {/* 3 Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between border-2 transition-all ${
                  active === card.id ? "border-blue-500" : "border-transparent hover:border-gray-300"
                }`}
              >
                <div>
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-bold text-gray-800 text-base">{card.title}</h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-5">{card.description}</p>
                </div>
                <button
                  onClick={() => setActive(active === card.id ? null : card.id)}
                  className={`w-full text-white text-sm font-semibold py-2.5 rounded-lg transition-colors ${card.buttonColor}`}
                >
                  {active === card.id ? "✕ Close" : card.buttonLabel}
                </button>
              </div>
            ))}
          </div>

          {/* Upload section — shown below cards when active */}
          {active === "student_reg" && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                👤 Upload Student Registration
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">One-time</span>
              </h2>
              <StudentRegUpload course={course} />
            </div>
          )}
          {active === "exam_reg" && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                📋 Upload Exam Registration (YN)
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Per Cycle</span>
              </h2>
              <ExamRegUpload course={course} />
            </div>
          )}
          {active === "result" && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 Upload Result Sheet
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Per Cycle</span>
              </h2>
              <ResultUpload course={course} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadChooserPage;