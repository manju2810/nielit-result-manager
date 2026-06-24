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
    return () => {
      active = false;
    };
  }, [regnNo, course]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold text-gray-800">Student Detail — Regn No: {regnNo}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!data && !error && <p className="text-gray-400 text-sm">Loading...</p>}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-2 text-sm mb-5">
              <p><span className="text-gray-400">Name:</span> {data.student.name}</p>
              <p><span className="text-gray-400">Roll No:</span> {data.student.roll_no || "—"}</p>
              <p><span className="text-gray-400">Father's Name:</span> {data.student.father_name || "—"}</p>
              <p><span className="text-gray-400">Batch:</span> {data.student.batch_no || "—"}</p>
              <p><span className="text-gray-400">Final Status:</span> <StatusBadge status={data.student.final_status} /></p>
            </div>

            <h3 className="font-semibold text-gray-700 mb-2 text-sm">Latest Subject Status</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Subject</th>
                    <th className="px-3 py-2 text-left">Registered</th>
                    <th className="px-3 py-2 text-left">Grade</th>
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
                        <td className="px-3 py-2">{subj.latest_grade || "—"}</td>
                        <td className="px-3 py-2"><StatusBadge status={subj.latest_status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-gray-700 mb-2 text-sm">Result History (every cycle ever recorded)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Cycle</th>
                    <th className="px-3 py-2 text-left">Subject</th>
                    <th className="px-3 py-2 text-left">Grade</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-3 text-gray-400 text-center">No history yet</td></tr>
                  )}
                  {data.history.map((h) => (
                    <tr key={h._id} className="border-t border-gray-100">
                      <td className="px-3 py-2">{h.cycle_name}</td>
                      <td className="px-3 py-2">{h.subject_key} <span className="text-gray-400">({h.subject_code})</span></td>
                      <td className="px-3 py-2">{h.grade}</td>
                      <td className="px-3 py-2"><StatusBadge status={h.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
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
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const limit = 25;

  const fetchStudents = useCallback(() => {
    setLoading(true);
    setError("");
    API.get("/results/students", { params: { course, search, page, limit } })
      .then((res) => {
        setStudents(res.data.students);
        setTotal(res.data.total);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load students"))
      .finally(() => setLoading(false));
  }, [course, search, page]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Master Result Data</h1>
        <p className="text-gray-500 text-sm mb-6">One row per student, sorted by registration number. Click a row to view full history.</p>

        <div className="bg-white shadow rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
            <select
              value={course}
              onChange={(e) => { setCourse(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="O_LEVEL">O-Level</option>
              <option value="A_LEVEL">A-Level</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Search (Regn No / Name / Roll No / Batch)</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Type to search..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-sm text-gray-500">{total} student(s) found</p>
        </div>

        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        <div className="bg-white shadow rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">Regn No</th>
                <th className="px-4 py-3 text-left">Roll No</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Batch</th>
                <th className="px-4 py-3 text-left">Final Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
              )}
              {!loading && students.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No students found</td></tr>
              )}
              {!loading && students.map((s) => (
                <tr
                  key={s._id}
                  onClick={() => setSelected(s.regn_no)}
                  className="border-t border-gray-100 hover:bg-blue-50 cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-gray-700">{s.regn_no}</td>
                  <td className="px-4 py-3">{s.roll_no || "—"}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.batch_no || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.final_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      </div>

      {selected && (
        <StudentDetailModal regnNo={selected} course={course} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default MasterPage;