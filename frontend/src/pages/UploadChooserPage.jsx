import { useState } from "react";
import Navbar from "../components/Navbar";
import CourseUploadForm from "../components/CourseUploadForm";

const UploadChooserPage = () => {
  const [course, setCourse] = useState("O_LEVEL");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Upload Exam Cycle Results</h1>
          <p className="text-gray-500 text-sm mb-6">
            Choose the course, then upload the registration (YN) and/or result file.
          </p>

          <div className="bg-white shadow rounded-2xl p-5 mb-6">
            <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="O_LEVEL">O-Level</option>
              <option value="A_LEVEL">A-Level</option>
            </select>
          </div>

          <CourseUploadForm key={course} course={course} />
        </div>
      </div>
    </div>
  );
};

export default UploadChooserPage;