// 📁 src/pages/Admin/MergedFlaggedReports.jsx

import React, { useEffect, useState } from "react";
import API from "@/api";

function MergedFlaggedReports() {
  const [flags, setFlags] = useState([]);
  const [paginated, setPaginated] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("");

  const fetchFlags = async () => {
    try {
      if (paginated) {
        const res = await API.get(`/admin/flags?page=${page}&filter=${filter}`);
        setFlags(res.data.items || res.data); // handles both paginated & non-paginated
        setTotalPages(res.data.total_pages || 1);
      } else {
        const res = await API.get("/admin/flags");
        const filtered = filter ? res.data.filter((f) => f.content_type === filter) : res.data;
        setFlags(filtered);
      }
    } catch (error) {
      console.error("Error fetching flags:", error);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, [page, paginated, filter]);

  const deleteFlag = async (flag) => {
    try {
      await API.delete(`/admin/flag/delete/${flag.content_type}/${flag.content_id}`);
      fetchFlags();
    } catch (error) {
      console.error("Error deleting flag:", error);
    }
  };

  const markResolved = async (id) => {
    try {
      await API.put(`/admin/flag/resolve/${id}`);
      fetchFlags();
    } catch (error) {
      console.error("Error marking resolved:", error);
    }
  };

  const banUser = async (userId) => {
    try {
      await API.put(`/admin/ban-user/${userId}`);
      fetchFlags();
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Flagged Content Reports
        </h2>
        <button
          className="text-sm text-blue-600 dark:text-blue-400 underline"
          onClick={() => setPaginated(!paginated)}
        >
          Toggle {paginated ? "Simple View" : "Paginated View"}
        </button>
      </div>

      {/* Filter */}
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border p-2 rounded-lg mt-4 mb-6 bg-white text-black dark:bg-gray-800 dark:text-white"
      >
        <option value="">All Types</option>
        <option value="post">Posts</option>
        <option value="comment">Comments</option>
      </select>

      {/* Flags List */}
      <div className="space-y-4">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow"
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
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {new Date(flag.timestamp).toLocaleString()}
            </p>

            <div className="mt-3 flex flex-wrap gap-4">
              <button
                onClick={() => deleteFlag(flag)}
                className="text-red-600 dark:text-red-400 underline"
              >
                Delete
              </button>
              <button
                onClick={() => markResolved(flag.id)}
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => banUser(flag.user_id)}
                className="text-orange-600 dark:text-orange-400 underline"
              >
                Ban User
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Prev
          </button>
          <span className="text-gray-800 dark:text-gray-200">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default MergedFlaggedReports;