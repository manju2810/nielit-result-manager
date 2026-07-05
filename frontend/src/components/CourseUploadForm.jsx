import { useState } from "react";
import API from "../api/axios";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear + 1 - i);

const FileField = ({ label, hint, file, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
    {!file ? (
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
      />
    ) : (
      <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 bg-green-50">
        <span className="text-sm text-green-700 truncate">{file.name}</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-gray-400 hover:text-red-600 font-medium text-sm px-2"
          title="Remove file"
        >
          ✕
        </button>
      </div>
    )}
  </div>
);

const SummaryBlock = ({ title, color, children }) => (
  <div className="mt-5 bg-white shadow rounded-xl p-5">
    <p className={`font-semibold ${color}`}>{title}</p>
    {children}
  </div>
);

/**
 * One independent upload card: its own file, its own submit button,
 * its own loading/error/result state. Doesn't depend on the other cards.
 */
const UploadCard = ({ title, description, fieldName, hint, course, courseTitle, includeSession, summaryRenderer }) => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    if (includeSession && month && year) formData.append("cycle_name", `${month} ${year}`);
    formData.append(fieldName, file);

    setLoading(true);
    try {
      const res = await API.post("/results/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.results.find((r) => r.course === course) || res.data.results[0]);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h2 className="font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-xs text-gray-400 mb-4">{description}</p>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {includeSession && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Exam Session <span className="text-gray-400 font-normal">(optional — auto-detected if blank)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Month</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <FileField label="File" hint={hint} file={file} onChange={setFile} />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {loading ? "Processing..." : `Upload ${title}`}
        </button>
      </form>

      {result && summaryRenderer && summaryRenderer(result)}
    </div>
  );
};

/**
 * Three independent upload cards for a single course (O-Level or A-Level):
 * Student Registration, Exam Registration (YN), Result. Each uploads on its own.
 * @param {"O_LEVEL"|"A_LEVEL"} course
 */
const CourseUploadForm = ({ course }) => {
  const isALevel = course === "A_LEVEL";
  const studentRegField = isALevel ? "a_student_reg" : "o_student_reg";
  const ynField = isALevel ? "a_yn" : "o_yn";
  const resultField = isALevel ? "a_result" : "o_result";
  const title = isALevel ? "A-Level" : "O-Level";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Upload {title} Data</h1>
      <p className="text-gray-500 text-sm mb-6">
        Each file is uploaded independently — only upload what you need right now.
        Existing students are updated by registration number; new students are added automatically.
      </p>

      <div className="space-y-6">
        <UploadCard
          title="Student Registration"
          description="One-time enrollment info — upload once per student, only when new students join."
          fieldName={studentRegField}
          hint={`Field name: ${studentRegField}`}
          course={course}
          courseTitle={title}
          includeSession={false}
          summaryRenderer={(result) =>
            result.studentRegistration && (
              <SummaryBlock title="Student Registration — Processed" color="text-purple-700">
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-400">New students</p>
                    <p className="font-bold text-gray-800">{result.studentRegistration.created}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Updated students</p>
                    <p className="font-bold text-gray-800">{result.studentRegistration.updated}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total processed</p>
                    <p className="font-bold text-gray-800">{result.studentRegistration.totalStudents}</p>
                  </div>
                </div>
              </SummaryBlock>
            )
          }
        />

        <UploadCard
          title="Exam Registration (YN)"
          description="Which subjects a student registered for this specific exam cycle."
          fieldName={ynField}
          hint={`Field name: ${ynField}`}
          course={course}
          courseTitle={title}
          includeSession={true}
          summaryRenderer={(result) =>
            result.historyRows !== undefined && (
              <SummaryBlock title={`${result.course?.replace("_", " ")} — ${result.cycleName}`} color="text-blue-700">
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-400">New students</p>
                    <p className="font-bold text-gray-800">{result.created}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Updated students</p>
                    <p className="font-bold text-gray-800">{result.updated}</p>
                  </div>
                </div>
              </SummaryBlock>
            )
          }
        />

        <UploadCard
          title="Result"
          description="Actual grades for this exam cycle. Highest grade ever achieved per subject is always kept."
          fieldName={resultField}
          hint={`Field name: ${resultField}`}
          course={course}
          courseTitle={title}
          includeSession={true}
          summaryRenderer={(result) =>
            result.historyRows !== undefined && (
              <SummaryBlock title={`${result.course?.replace("_", " ")} — ${result.cycleName}`} color="text-blue-700">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-400">New students</p>
                    <p className="font-bold text-gray-800">{result.created}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Updated students</p>
                    <p className="font-bold text-gray-800">{result.updated}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Subject results recorded</p>
                    <p className="font-bold text-gray-800">{result.historyRows}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Grade improvements</p>
                    <p className="font-bold text-green-700">{result.improvedSubjects || 0}</p>
                  </div>
                </div>
                {result.skippedResultRows > 0 && (
                  <p className="text-xs text-amber-600 mt-3">
                    ⚠ {result.skippedResultRows} result row(s) could not be matched to a known subject code and were skipped.
                  </p>
                )}
              </SummaryBlock>
            )
          }
        />
      </div>
    </div>
  );
};

export default CourseUploadForm;