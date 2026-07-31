import { useState } from "react";
import API from "../../api/axios";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear + 1 - i);

const ResultUpload = ({ course }) => {
  const fieldName = course === "A_LEVEL" ? "a_result" : "o_result";
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
        Upload the result sheet (e.g. <code>ResultSheet.xls</code>). The highest grade ever achieved per subject is always retained.
      </p>
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Exam Session <span className="text-gray-400 font-normal"></span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Select Month</option>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Select Year</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      {!file ? (
        <input
          type="file" accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium hover:file:bg-green-100"
        />
      ) : (
        <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 bg-green-50">
          <span className="text-sm text-green-700 truncate">{file.name}</span>
          <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-600 text-sm px-2">✕</button>
        </div>
      )}
      <button
        type="submit" disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Upload Result Sheet"}
      </button>
      {result?.historyRows !== undefined && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-green-700 mb-2">✓ {result.course?.replace("_"," ")} — {result.cycleName}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><p className="text-gray-400">New</p><p className="font-bold">{result.created}</p></div>
            <div><p className="text-gray-400">Updated</p><p className="font-bold">{result.updated}</p></div>
            <div><p className="text-gray-400">Subject results</p><p className="font-bold">{result.historyRows}</p></div>
            <div><p className="text-gray-400">Grade improvements</p><p className="font-bold text-green-700">{result.improvedSubjects || 0}</p></div>
          </div>
          {result.skippedResultRows > 0 && (
            <p className="text-xs text-amber-600 mt-2">⚠ {result.skippedResultRows} row(s) skipped (unknown subject code)</p>
          )}
        </div>
      )}
    </form>
  );
};

export default ResultUpload;