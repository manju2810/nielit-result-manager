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
    {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
    {!file ? (
      <input
        type="file"
        accept=".xlsx"
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

/**
 * Reusable upload form for a single course (O-Level or A-Level).
 * @param {"O_LEVEL"|"A_LEVEL"} course
 */
const CourseUploadForm = ({ course }) => {
  const isALevel = course === "A_LEVEL";
  const ynField = isALevel ? "a_yn" : "o_yn";
  const resultField = isALevel ? "a_result" : "o_result";
  const title = isALevel ? "A-Level" : "O-Level";

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [ynFile, setYnFile] = useState(null);
  const [resultFile, setResultFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!ynFile && !resultFile) {
      setError("Please select at least one file to upload.");
      return;
    }

    const formData = new FormData();
    if (month && year) formData.append("cycle_name", `${month} ${year}`);
    if (ynFile) formData.append(ynField, ynFile);
    if (resultFile) formData.append(resultField, resultFile);

    setLoading(true);
    try {
      const res = await API.post("/results/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.results.find((r) => r.course === course) || res.data.results[0]);
      setYnFile(null);
      setResultFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Upload {title} Results</h1>
      <p className="text-gray-500 text-sm mb-6">
        Upload the registration (YN) file and/or the result file for {title}.
        Existing students will have their results updated; new students will be added automatically.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-2xl p-6 space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Session</label>
          <p className="text-xs text-gray-400 mb-2">
            Optional — if left blank, the cycle name will be auto-detected from the YN file.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Month</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-5 space-y-4">
          <FileField label="Registration (YN) file" hint={`Field name: ${ynField}`} file={ynFile} onChange={setYnFile} />
          <FileField label="Result file" hint={`Field name: ${resultField}`} file={resultFile} onChange={setResultFile} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {loading ? "Processing..." : `Upload ${title} Files`}
        </button>
      </form>

      {result && (
        <div className="mt-8 bg-white shadow rounded-xl p-5">
          <p className="font-semibold text-blue-700">
            {result.course.replace("_", " ")} — {result.cycleName}
          </p>
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
              <p className="text-gray-400">Total students touched</p>
              <p className="font-bold text-gray-800">{result.totalStudents}</p>
            </div>
          </div>
          {result.skippedResultRows > 0 && (
            <p className="text-xs text-amber-600 mt-3">
              ⚠ {result.skippedResultRows} result row(s) could not be matched to a known subject code and were skipped.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseUploadForm;