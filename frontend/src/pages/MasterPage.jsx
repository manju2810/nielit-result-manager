import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const SUBJECT_KEYS = {
  O_LEVEL: ["M1_R4", "M2_R4", "M3_R4", "M4_R4", "Project"],
  A_LEVEL: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "PR5"],
};

const STATUS_COLORS = {
  PASS: "bg-green-100 text-green-700",
  FAIL: "bg-red-100 text-red-700",
  ABSENT: "bg-yellow-100 text-yellow-700",
  "RESULT PENDING": "bg-gray-100 text-gray-600",
  "ALL ABSENT": "bg-yellow-100 text-yellow-700",
  "NO SUBJECTS": "bg-gray-100 text-gray-500",
};

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || "bg-gray-100 text-gray-500"}`}>
    {status || "—"}
  </span>
);

const StudentDetailModal = ({ regnNo, course, onClose }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    API.get(`/results/students/${regnNo}`, { params: { course } })
      .then((res) => active && setData(res.data))
      .catch((err) => active && setError(err.response?.data?.message || "Failed to load"));
    return () => { active = false; };
  }, [regnNo, course]);

  const historybyCycle = data?.history?.reduce((acc, h) => {
    if (!acc[h.cycle_name]) acc[h.cycle_name] = [];
    acc[h.cycle_name].push(h);
    return acc;
  }, {}) || {};

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold text-gray-800">Student Detail — Regn No: {regnNo}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!data && !error && <p className="text-gray-400 text-sm">Loading...</p>}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-2 text-sm mb-5 bg-gray-50 rounded-xl p-4">
              <p><span className="text-gray-400">Name:</span> <span className="font-medium">{data.student.name}</span></p>
              <p><span className="text-gray-400">Roll No:</span> {data.student.roll_no || "—"}</p>
              <p><span className="text-gray-400">Father's Name:</span> {data.student.father_name || "—"}</p>
              <p><span className="text-gray-400">Mother's Name:</span> {data.student.mother_name || "—"}</p>
              <p><span className="text-gray-400">DOB:</span> {data.student.dob || "—"}</p>
              <p><span className="text-gray-400">Category:</span> {data.student.category || "—"}</p>
              <p><span className="text-gray-400">City/State:</span> {[data.student.city, data.student.state].filter(Boolean).join(", ") || "—"}</p>
              <p><span className="text-gray-400">Expiry:</span> {data.student.expiry_date || "—"}</p>
              <p className="col-span-2"><span className="text-gray-400">Final Status:</span> <StatusBadge status={data.student.final_status} /></p>
            </div>

            <h3 className="font-semibold text-gray-700 mb-2 text-sm">Latest Subject Status (Best Grade)</h3>
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Subject</th>
                    <th className="px-3 py-2 text-left">Registered</th>
                    <th className="px-3 py-2 text-left">Best Grade</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBJECT_KEYS[course].map((key) => {
                    const subj = data.student.subjects?.[key] || {};
                    return (
                      <tr key={key} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-700">{key}</td>
                        <td className="px-3 py-2">{subj.registered ? "Yes" : "No"}</td>
                        <td className="px-3 py-2 font-mono font-semibold">{subj.latest_grade || "—"}</td>
                        <td className="px-3 py-2"><StatusBadge status={subj.latest_status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-gray-700 mb-2 text-sm">Exam History (cycle-wise)</h3>
            {Object.keys(historybyCycle).length === 0 && (
              <p className="text-gray-400 text-sm">No history yet.</p>
            )}
            {Object.entries(historybyCycle).map(([cycle, rows]) => (
              <div key={cycle} className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700 text-sm">{cycle}</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-gray-100">
                      <th className="px-3 py-2 text-left text-gray-500 font-medium">Subject</th>
                      <th className="px-3 py-2 text-left text-gray-500 font-medium">Grade</th>
                      <th className="px-3 py-2 text-left text-gray-500 font-medium">Status</th>
                      <th className="px-3 py-2 text-left text-gray-500 font-medium">Best?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((h) => (
                      <tr key={h._id} className="border-t border-gray-100">
                        <td className="px-3 py-2">{h.subject_key} <span className="text-gray-400 text-xs">({h.subject_code})</span></td>
                        <td className="px-3 py-2 font-mono font-semibold">{h.grade}</td>
                        <td className="px-3 py-2"><StatusBadge status={h.status} /></td>
                        <td className="px-3 py-2">{h.is_best ? <span className="text-green-600 font-semibold">✓ Best</span> : <span className="text-gray-300">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const SpreadsheetView = ({ course, search, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const subjectKeys = SUBJECT_KEYS[course];

  useEffect(() => {
    setLoading(true);
    API.get("/results/students", { params: { course, search, limit: 200, page: 1 } })
      .then((res) => setStudents(res.data.students))
      .finally(() => setLoading(false));
  }, [course, search]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col">
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-green-400 font-mono text-lg">⊞</span>
          <span className="font-semibold">
            {course.replace("_", " ")} — Spreadsheet View
            {search && <span className="text-gray-400 ml-2 text-sm">Search: "{search}"</span>}
          </span>
          <span className="text-gray-400 text-sm ml-4">{students.length} students</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-sm border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
        >
          ✕ Close
        </button>
      </div>

      <div className="bg-gray-800 border-b border-gray-700 px-6 py-2 flex items-center gap-6 text-xs flex-shrink-0">
        <span className="text-gray-400 font-medium">Legend:</span>
        <span><span className="text-gray-400 font-mono font-bold">NR</span> <span className="text-gray-500">= Not Registered</span></span>
        <span><span className="text-orange-500 font-mono font-bold">ABS</span> <span className="text-gray-500">= Absent</span></span>
        <span><span className="text-red-500 font-mono font-bold">F</span> <span className="text-gray-500">= Fail</span></span>
        <span><span className="text-green-400 font-mono font-bold">A / B / C / D</span> <span className="text-gray-500">= Pass</span></span>
        <span><span className="text-gray-400 font-mono">Pending</span> <span className="text-gray-500">= Registered, result not uploaded yet</span></span>
      </div>

      <div className="overflow-auto flex-1 bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
        ) : (
          <table className="border-collapse text-sm w-max min-w-full">
            <thead>
              <tr className="bg-gray-800 text-white sticky top-0 z-10">
                <th className="border border-gray-600 px-4 py-2.5 text-left font-semibold whitespace-nowrap min-w-[50px]">#</th>
                <th className="border border-gray-600 px-4 py-2.5 text-left font-semibold whitespace-nowrap min-w-[120px]">Regn No</th>
                <th className="border border-gray-600 px-4 py-2.5 text-left font-semibold whitespace-nowrap min-w-[160px]">Name</th>
                <th className="border border-gray-600 px-4 py-2.5 text-left font-semibold whitespace-nowrap min-w-[160px]">Father Name</th>
                {subjectKeys.map((k) => (
                  <th key={k} className="border border-gray-600 px-4 py-2.5 text-center font-semibold whitespace-nowrap min-w-[90px]">{k}</th>
                ))}
                <th className="border border-gray-600 px-4 py-2.5 text-center font-semibold whitespace-nowrap min-w-[140px]">Final Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan={5 + subjectKeys.length} className="px-4 py-8 text-center text-gray-400">
                    No students found
                  </td>
                </tr>
              )}
              {students.map((s, idx) => (
                <tr
                  key={s._id}
                  className={idx % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-50"}
                >
                  <td className="border border-gray-200 px-4 py-2 text-gray-400 text-center">{idx + 1}</td>
                  <td className="border border-gray-200 px-4 py-2 font-mono text-gray-700 whitespace-nowrap">{s.regn_no}</td>
                  <td className="border border-gray-200 px-4 py-2 font-medium whitespace-nowrap">{s.name}</td>
                  <td className="border border-gray-200 px-4 py-2 text-gray-600 whitespace-nowrap">{s.father_name || "—"}</td>
                  {subjectKeys.map((k) => {
                    const subj = s.subjects?.[k];
                    const grade = subj?.latest_grade;
                    const registered = subj?.registered;
                    return (
                      <td key={k} className="border border-gray-200 px-4 py-2 text-center whitespace-nowrap">
                        {!registered ? (
                          <span className="text-gray-400 text-xs font-mono">NR</span>
                        ) : grade ? (
                          <span className={`font-mono font-bold text-sm ${
                            grade === "A" ? "text-green-700" :
                            grade === "B" ? "text-green-600" :
                            grade === "C" ? "text-blue-600" :
                            grade === "D" ? "text-yellow-600" :
                            grade === "F" ? "text-red-600" :
                            grade === "ABS" ? "text-orange-500" :
                            "text-gray-600"
                          }`}>{grade}</span>
                        ) : (
                          <span className="text-gray-400 text-xs">Pending</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="border border-gray-200 px-4 py-2 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      s.final_status === "PASS" ? "bg-green-100 text-green-700" :
                      s.final_status === "FAIL" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {s.final_status || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-gray-800 text-gray-400 text-xs px-6 py-2 flex-shrink-0">
        Showing up to 200 students · Use filters on the main page to narrow down results
      </div>
    </div>
  );
};

const MasterPage = () => {
  const [course, setCourse] = useState("O_LEVEL");
  const [search, setSearch] = useState("");

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [showSpreadsheet, setShowSpreadsheet] = useState(false);
  const limit = 25;

  const fetchStudents = useCallback(() => {
    setLoading(true);
    setError("");
    API.get("/results/students", { params: { course, search, page, limit } })
      .then((res) => { setStudents(res.data.students); setTotal(res.data.total); })
      .catch((err) => setError(err.response?.data?.message || "Failed to load students"))
      .finally(() => setLoading(false));
  }, [course, search, page]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ course });
      if (search) params.append("search", search);
      const res = await API.get(`/results/export?${params.toString()}`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${course}_master_data.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-2xl font-bold text-gray-800">Master Result Data</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSpreadsheet(true)}
                className="bg-gray-700 hover:bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                ⊞ View as Excel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {exporting ? "Exporting..." : "⬇ Export to Excel"}
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-6">One row per student, sorted by registration number. Click a row to view full history.</p>

          <div className="bg-white shadow rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
              <select value={course} onChange={(e) => { setCourse(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="O_LEVEL">O-Level</option>
                <option value="A_LEVEL">A-Level</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search (Regn No / Name / Roll No)</label>
              <input
                type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Type to search..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-sm text-gray-500">{total} student(s)</p>
          </div>

          {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

          <div className="bg-white shadow rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Regn No</th>
                  <th className="px-4 py-3 text-left">Roll No</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Final Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>}
                {!loading && students.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No students found</td></tr>}
                {!loading && students.map((s) => (
                  <tr key={s._id} onClick={() => setSelected(s.regn_no)}
                    className="border-t border-gray-100 hover:bg-blue-50 cursor-pointer">
                    <td className="px-4 py-3 font-mono text-gray-700">{s.regn_no}</td>
                    <td className="px-4 py-3">{s.roll_no || "—"}</td>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.final_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40">Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {selected && (
        <StudentDetailModal regnNo={selected} course={course} onClose={() => setSelected(null)} />
      )}

      {showSpreadsheet && (
        <SpreadsheetView
          course={course}
          search={search}
          onClose={() => setShowSpreadsheet(false)}
        />
      )}
    </div>
  );
};

export default MasterPage;
