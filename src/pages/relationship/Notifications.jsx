//src/pages/relationship/Notification.jsx

import React, { useEffect, useState } from 'react';
import axios from '@/api';

const Notifications = () => {
  const [notes, setNotes] = useState([]);
  const user_id = localStorage.getItem("user_id");

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`/relationship/notifications/${user_id}`);
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/relationship/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`/relationship/notifications/${user_id}/read-all`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🔔 Notifications</h2>
        {notes.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className={`p-3 rounded shadow cursor-pointer ${
                n.is_read ? "bg-gray-100" : "bg-white border-l-4 border-blue-500"
              }`}
              onClick={() => markAsRead(n.id)}
            >
              <p className="font-medium">{n.message}</p>
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