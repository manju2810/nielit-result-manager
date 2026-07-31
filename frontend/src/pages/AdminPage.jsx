import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const ACTION_COLORS = {
  UPLOAD: "bg-blue-100 text-blue-700",
  VIEW: "bg-gray-100 text-gray-600",
  LOGIN: "bg-green-100 text-green-700",
  LOGOUT: "bg-gray-100 text-gray-500",
  DELETE: "bg-red-100 text-red-700",
  DOWNLOAD: "bg-purple-100 text-purple-700",
};

const ActionBadge = ({ action }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[action] || "bg-gray-100 text-gray-500"}`}>
    {action}
  </span>
);

const AdminPage = () => {
  const [tab, setTab] = useState("activity");
  const [logs, setLogs] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [regBatches, setRegBatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCycles = () => {
    setLoading(true);
    setError("");
    API.get("/results/cycles")
      .then((res) => setCycles(res.data.cycles))
      .catch((err) => setError(err.response?.data?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  };

  const fetchRegBatches = () => {
    setLoading(true);
    setError("");
    API.get("/results/registration-batches")
      .then((res) => setRegBatches(res.data.batches))
      .catch((err) => setError(err.response?.data?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    setLoading(true);
    setError("");
    API.get("/users")
      .then((res) => setUsers(res.data.users))
      .catch((err) => setError(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    if (tab === "activity") {
      API.get("/activity", { params: { limit: 100 } })
        .then((res) => setLogs(res.data.logs))
        .catch((err) => setError(err.response?.data?.message || "Failed to load data"))
        .finally(() => setLoading(false));
    } else if (tab === "cycles") {
      fetchCycles();
    } else if (tab === "regbatches") {
      fetchRegBatches();
    } else if (tab === "users") {
      fetchUsers();
    }
  }, [tab]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFormError("Name, email and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setCreating(true);
    try {
      await API.post("/users", form);
      setFormSuccess(`User "${form.name}" created successfully.`);
      setForm({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await API.patch(`/users/${user._id}/status`, { is_active: !user.is_active });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status");
    }
  };

  const handleDeleteCycle = async (cycle) => {
    if (!window.confirm(`Delete exam cycle "${cycle.cycle_name}"? This will roll back grades for all students in this cycle to their previous best attempt.`)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.delete(`/results/cycles/${cycle._id}`);
      alert(res.data.message);
      fetchCycles();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete exam cycle");
      setLoading(false);
    }
  };

  const handleDeleteRegBatch = async (batch) => {
    const warning = batch.updated_regn_nos.length > 0
      ? `This will delete ${batch.created_regn_nos.length} newly-created student(s) from "${batch.batch_name}".\n\nNote: ${batch.updated_regn_nos.length} other student(s) were UPDATED (not created) by this batch and cannot be automatically reverted, since their previous values were not stored. Continue?`
      : `Delete ${batch.created_regn_nos.length} newly-created student(s) from batch "${batch.batch_name}"?`;

    if (!window.confirm(warning)) return;

    setLoading(true);
    setError("");
    try {
      const res = await API.delete(`/results/registration-batches/${batch._id}`);
      alert(res.data.message + (res.data.unrevertedUpdatedCount > 0
        ? `\n\n${res.data.unrevertedUpdatedCount} previously-existing student(s) were updated by this batch and were left untouched.`
        : ""));
      fetchRegBatches();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete registration batch");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">Audit trail of every upload, view, and login across the system.</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setTab("activity")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "activity" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}
          >
            Activity Log
          </button>
          <button
            onClick={() => setTab("cycles")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "cycles" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}
          >
            Exam Cycles
          </button>
          <button
            onClick={() => setTab("regbatches")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "regbatches" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}
          >
            Registration Batches
          </button>
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "users" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}
          >
            Users
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        {tab === "activity" && (
          <div className="bg-white shadow rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>}
                {!loading && logs.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No activity recorded</td></tr>}
                {!loading && logs.map((log) => (
                  <tr key={log._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{new Date(log.performed_at).toLocaleString()}</td>
                    <td className="px-4 py-3">{log.user_name}<br /><span className="text-xs text-gray-400">{log.user_email}</span></td>
                    <td className="px-4 py-3 capitalize">{log.role}</td>
                    <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                    <td className="px-4 py-3 text-gray-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "cycles" && (
          <div className="bg-white shadow rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Cycle Name</th>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-left">Uploaded By</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Uploaded At</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>}
                {!loading && cycles.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No exam cycles uploaded yet</td></tr>}
                {!loading && cycles.map((c) => (
                  <tr key={c._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-700">{c.cycle_name}</td>
                    <td className="px-4 py-3">{c.course.replace("_", " ")}</td>
                    <td className="px-4 py-3">{c.uploaded_by?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "processed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteCycle(c)}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold border border-red-300 hover:border-red-500 px-3 py-1 rounded-lg transition-colors"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "regbatches" && (
          <div className="bg-white shadow rounded-2xl overflow-x-auto">
            <p className="text-xs text-gray-500 px-4 pt-4">
              Deleting a batch only removes students it newly created. Students it merely updated are listed but left untouched, since their previous values weren't stored.
            </p>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Batch Name</th>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-left">Uploaded By</th>
                  <th className="px-4 py-3 text-left">New / Updated</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Uploaded At</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>}
                {!loading && regBatches.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No registration batches uploaded yet</td></tr>}
                {!loading && regBatches.map((b) => (
                  <tr key={b._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-700">{b.batch_name}</td>
                    <td className="px-4 py-3">{b.course.replace("_", " ")}</td>
                    <td className="px-4 py-3">{b.uploaded_by?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-green-700 font-semibold">{b.created_regn_nos.length} new</span>
                      {" / "}
                      <span className="text-amber-600 font-semibold">{b.updated_regn_nos.length} updated</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.status === "reverted" ? "bg-gray-200 text-gray-500" : "bg-green-100 text-green-700"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(b.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {b.status === "active" ? (
                        <button
                          onClick={() => handleDeleteRegBatch(b)}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold border border-red-300 hover:border-red-500 px-3 py-1 rounded-lg transition-colors"
                        >
                          🗑 Delete
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">Already reverted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-2xl p-5">
              <h2 className="font-semibold text-gray-700 mb-4">Add New User</h2>
              {formError && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-3 text-sm">{formError}</div>}
              {formSuccess && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-2 rounded-lg mb-3 text-sm">{formSuccess}</div>}
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white shadow rounded-2xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>}
                  {!loading && users.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No users found</td></tr>}
                  {!loading && users.map((u) => (
                    <tr key={u._id} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-700">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3 capitalize">{u.role}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleUserStatus(u)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminPage;
