import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [flags, setFlags] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');

  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });

  const fetchData = async () => {
    const [flagRes, adminRes, logRes] = await Promise.all([
      API.get('/flag'),
      API.get('/admin/all'),
      API.get('/admin/logs')
    ]);
    setFlags(flagRes.data);
    setAdmins(adminRes.data);
    setLogs(logRes.data);
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password) return alert("Fill all fields");
    await API.post('/admin/create', newAdmin);
    alert('Admin created');
    setNewAdmin({ username: '', password: '' });
    fetchData();
  };

  const handleDeleteFlagged = async (type, id) => {
    await API.delete(`/flag/delete/${type}/${id}`);
    alert(`${type} deleted`);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/admin/login');
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
      </div>

      <section className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Create New Admin</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Username"
            className="border p-2 rounded"
            value={newAdmin.username}
            onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
          />
          <button onClick={handleCreateAdmin} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Flagged Content</h3>
        <select onChange={(e) => setFilter(e.target.value)} className="mb-3 p-2 border rounded">
          <option value="">All</option>
          <option value="post">Posts</option>
          <option value="comment">Comments</option>
        </select>
        {flags
          .filter(f => !filter || f.content_type === filter)
          .map((flag, index) => (
            <div key={index} className="bg-white shadow p-4 mb-3 rounded">
              <p><strong>Type:</strong> {flag.content_type}</p>
              <p><strong>ID:</strong> {flag.content_id}</p>
              <p><strong>Reason:</strong> {flag.reason}</p>
              <button
                className="mt-2 text-red-600 underline"
                onClick={() => handleDeleteFlagged(flag.content_type, flag.content_id)}
              >
                Delete {flag.content_type}
              </button>
            </div>
          ))}
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Admin Logs</h3>
        <div className="bg-white p-4 rounded shadow max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="border-b py-2">
              <p>{log.action}</p>
              <p className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Admin Users</h3>
        <ul className="list-disc pl-6">
          {admins.map((admin, index) => (
            <li key={index}>{admin.username}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;








