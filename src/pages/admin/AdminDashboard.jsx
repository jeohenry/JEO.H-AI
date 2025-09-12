// src/pages/admin/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import API from "@/api";

function AdminDashboard() {
  const { logout } = useAdminAuth();

  const [flags, setFlags] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });

  const fetchData = async () => {
    try {
      const [flagRes, adminRes, logRes] = await Promise.all([
        API.get("/admin/flags"),
        API.get("/admin/all"),
        API.get("/admin/logs"),
      ]);
      setFlags(flagRes.data);
      setAdmins(adminRes.data);
      setLogs(logRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password) {
      return alert("Fill all fields");
    }
    try {
      await API.post("/admin/create", newAdmin);
      alert("Admin created");
      setNewAdmin({ username: "", password: "" });
      fetchData();
    } catch (err) {
      console.error("Failed to create admin:", err);
    }
  };

  const handleDeleteFlagged = async (type, id) => {
    try {
      await API.delete(`/admin/flag/delete/${type}/${id}`);
      alert(`${type} deleted`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete flagged content:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h2>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Create Admin */}
      <section className="mt-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Create New Admin
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Username"
            className="flex-1 border p-2 rounded-lg bg-white text-black dark:bg-gray-800 dark:text-white"
            value={newAdmin.username}
            onChange={(e) =>
              setNewAdmin({ ...newAdmin, username: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            className="flex-1 border p-2 rounded-lg bg-white text-black dark:bg-gray-800 dark:text-white"
            value={newAdmin.password}
            onChange={(e) =>
              setNewAdmin({ ...newAdmin, password: e.target.value })
            }
          />
          <button
            onClick={handleCreateAdmin}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>
      </section>

      {/* Flagged Content */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Flagged Content
        </h3>
        <select
          onChange={(e) => setFilter(e.target.value)}
          className="mb-4 p-2 border rounded-lg bg-white text-black dark:bg-gray-800 dark:text-white"
        >
          <option value="">All</option>
          <option value="post">Posts</option>
          <option value="comment">Comments</option>
        </select>
        {flags
          .filter((f) => !filter || f.content_type === filter)
          .map((flag, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 shadow p-4 mb-3 rounded-lg"
            >
              <p>
                <strong>Type:</strong> {flag.content_type}
              </p>
              <p>
                <strong>ID:</strong> {flag.content_id}
              </p>
              <p>
                <strong>Reason:</strong> {flag.reason}
              </p>
              <button
                className="mt-2 text-red-600 dark:text-red-400 underline"
                onClick={() =>
                  handleDeleteFlagged(flag.content_type, flag.content_id)
                }
              >
                Delete {flag.content_type}
              </button>
            </div>
          ))}
      </section>

      {/* Admin Logs */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Admin Logs
        </h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 py-2">
              <p className="text-gray-900 dark:text-gray-100">{log.action}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Admin Users */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Admin Users
        </h3>
        <ul className="list-disc pl-6 text-gray-900 dark:text-gray-100">
          {admins.map((admin, index) => (
            <li key={index}>{admin.username}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;