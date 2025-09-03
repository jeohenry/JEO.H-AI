// 📁 src/pages/Admin/MergedFlaggedReports.jsx

import React, { useEffect, useState } from "react";
import API from "../../api";

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
        setFlags(res.data.items);
        setTotalPages(res.data.total_pages);
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
      await API.delete(`/flag/delete/${flag.content_type}/${flag.content_id}`);
      fetchFlags();
    } catch (error) {
      console.error("Error deleting flag:", error);
    }
  };

  const markResolved = async (id) => {
    try {
      await API.put(`/flag/resolve/${id}`);
      fetchFlags();
    } catch (error) {
      console.error("Error marking resolved:", error);
    }
  };

  const banUser = async (userId) => {
    try {
      await API.put(`/flag/ban-user/${userId}`);
      fetchFlags();
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-4">Flagged Content Reports</h2>
        <button
          className="text-sm text-blue-600 underline"
          onClick={() => setPaginated(!paginated)}
        >
          Toggle {paginated ? "Simple View" : "Paginated View"}
        </button>
      </div>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border px-2 py-1 mb-4"
      >
        <option value="">All Types</option>
        <option value="post">Posts</option>
        <option value="comment">Comments</option>
      </select>

      {flags.map((flag) => (
        <div key={flag.id} className="border p-4 mb-3 rounded">
          <p><strong>Type:</strong> {flag.content_type}</p>
          <p><strong>ID:</strong> {flag.content_id}</p>
          <p><strong>Reason:</strong> {flag.reason}</p>
          <p className="text-gray-500 text-sm">{new Date(flag.timestamp).toLocaleString()}</p>

          <div className="mt-2">
            <button onClick={() => deleteFlag(flag)} className="text-red-500 underline mr-4">Delete</button>
            <button onClick={() => markResolved(flag.id)} className="text-blue-500 underline mr-4">Mark Resolved</button>
            <button onClick={() => banUser(flag.user_id)} className="text-orange-500 underline">Ban User</button>
          </div>
        </div>
      ))}

      {paginated && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="bg-gray-300 px-3 py-1 rounded"
          >
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="bg-gray-300 px-3 py-1 rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default MergedFlaggedReports;






