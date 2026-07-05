import { useState } from "react";
import API from "../../api/axios";

const StudentRegUpload = ({ course }) => {
  const fieldName = course === "A_LEVEL" ? "a_student_reg" : "o_student_reg";
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select a file."); return; }
    setError(""); setResult(null);
    const formData = new FormData();
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
        Upload the student enrollment file (e.g. <code>RegisteredCandidate.xls</code>). Only needed when new students are added.
      </p>
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
      )}
      {!file ? (
        <input
          type="file" accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:bg-purple-50 file:text-purple-700 file:font-medium hover:file:bg-purple-100"
        />
      ) : (
        <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 bg-green-50">
          <span className="text-sm text-green-700 truncate">{file.name}</span>
          <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-600 text-sm px-2">✕</button>
        </div>
      )}
      <button
        type="submit" disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Upload Student Registration"}
      </button>
      {result?.studentRegistration && (
        <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-purple-700 mb-2">✓ Processed Successfully</p>
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-gray-400">New</p><p className="font-bold">{result.studentRegistration.created}</p></div>
            <div><p className="text-gray-400">Updated</p><p className="font-bold">{result.studentRegistration.updated}</p></div>
            <div><p className="text-gray-400">Total</p><p className="font-bold">{result.studentRegistration.totalStudents}</p></div>
          </div>
        </div>
      )}
    </form>
  );
};

export default StudentRegUpload;