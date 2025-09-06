//src/pages/relationship/Notification.jsx

import React, { useEffect, useState } from 'react';
import axios from '@/api';

const Notifications = () => {
  const [notes, setNotes] = useState([]);
  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    axios.get(`/api/relationship/notifications/${user_id}`)
      .then(res => setNotes(res.data));
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔔 Notifications</h2>
      {notes.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n, idx) => (
            <li key={idx} className="p-3 bg-white shadow rounded">
              <p>{n.message}</p>
              <p className="text-xs text-gray-500">
                {new Date(n.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
