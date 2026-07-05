import { useState } from "react";
import API from "../../api/axios";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear + 1 - i);

const ExamRegUpload = ({ course }) => {
  const fieldName = course === "A_LEVEL" ? "a_yn" : "o_yn";
  const [file, setFile] = useState(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select a file."); return; }
    setError(""); setResult(null);
    const formData = new FormData();
    if (month && year) formData.append("cycle_name", `${month} ${year}`);
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
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500">
        Upload the YN file for this exam cycle (e.g. <code>O_YN_Jan2025.xlsx</code>). Indicates which subjects each student registered for.
      </p>
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Exam Session <span className="text-gray-400 font-normal">(optional — auto-detected if blank)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Month</option>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Year</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      {!file ? (
        <input
          type="file" accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
        />
      ) : (
        <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 bg-green-50">
          <span className="text-sm text-green-700 truncate">{file.name}</span>
          <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-600 text-sm px-2">✕</button>
        </div>
      )}
      <button
        type="submit" disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Upload Exam Registration"}
      </button>
      {result?.historyRows !== undefined && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-blue-700 mb-2">✓ {result.course?.replace("_"," ")} — {result.cycleName}</p>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-gray-400">New students</p><p className="font-bold">{result.created}</p></div>
            <div><p className="text-gray-400">Updated students</p><p className="font-bold">{result.updated}</p></div>
          </div>
        </div>
      )}
    </form>
  );
};

export default ExamRegUpload;