// src/pages/admin/AdminAnalytics.jsx

import React, { useEffect, useState, useRef } from "react";
import { Line, Pie } from "react-chartjs-2";
import { fetchAnalyticsSummary } from "@/api";
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, ArcElement } from "chart.js";
import { saveAs } from "file-saver";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, ArcElement);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userCount, setUserCount] = useState(0);
  const wsRef = useRef(null);

  // === Fetch data ===
  const fetchData = () => {
    fetchAnalyticsSummary()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch analytics", err);
      });
  };

  // === Setup WebSocket ===
  const setupWebSocket = () => {
    const token = localStorage.getItem("token");
    const socket = new WebSocket(`ws://localhost:8000/ws/admin/analytics?token=${token}`);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      const incoming = JSON.parse(event.data);
      if (incoming.type === "summary") {
        setData(incoming.payload);
      } else if (incoming.type === "users") {
        setUserCount(incoming.payload);
      }
    };

    socket.onclose = () => {
      console.warn("WebSocket closed. Reconnecting...");
      setTimeout(setupWebSocket, 3000);
    };

    socket.onerror = (e) => {
      console.error("WebSocket error:", e);
      socket.close();
    };
  };

  useEffect(() => {
    fetchData();
    setupWebSocket();
    const interval = setInterval(fetchData, 60000);
    return () => {
      clearInterval(interval);
      wsRef.current && wsRef.current.close();
    };
  }, []);

  // === CSV Download ===
  const handleDownloadCSV = () => {
    if (!data) return;
    const csv = [
      ["Metric", "Value"],
      ["Total Users", data.total_users],
      ["Total Posts", data.total_posts],
      ["Active This Week", data.active_users_week],
      ["Active This Month", data.active_users_month],
      "",
      ["Top Users by Posts"],
      ["Username", "Post Count"],
      ...data.top_users.map((user) => [user.username, user.posts]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "analytics_summary.csv");
  };

  if (loading || !data) return <p>Loading admin analytics...</p>;

  // === Chart Data ===
  const userGrowthChart = {
    labels: Object.keys(data.user_growth_by_month),
    datasets: [
      {
        label: "Users Joined",
        data: Object.values(data.user_growth_by_month),
        borderColor: "#4bc0c0",
        backgroundColor: "#c8f7f7",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const genderPieChart = {
    labels: Object.keys(data.gender_distribution),
    datasets: [
      {
        label: "Gender Distribution",
        data: Object.values(data.gender_distribution),
        backgroundColor: ["#36a2eb", "#ff6384", "#ffcd56", "#4bc0c0", "#9966ff"],
      },
    ],
  };

  return (
    <div className="analytics-container p-4 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold">📊 Admin Analytics</h2>

      <p className="text-gray-600 text-sm mt-1">
        🟢 Live Admins Connected: {userCount} | Last updated:{" "}
        {new Date().toLocaleTimeString()}
      </p>

      {/* Search Input */}
      <div className="mt-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search username or metric..."
          className="w-full sm:w-1/2 p-3 rounded-md border shadow focus:outline-none"
          style={{
            backgroundColor: "#fff",
            color: "#000",
          }}
        />
      </div>

      {/* Summary */}
      <div className="summary-boxes flex flex-wrap gap-4 mt-4">
        <div className="box bg-sky-50 p-4 rounded-lg shadow min-w-[140px]">
          <strong>Total Users:</strong> {data.total_users}
        </div>
        <div className="box bg-sky-50 p-4 rounded-lg shadow min-w-[140px]">
          <strong>Total Posts:</strong> {data.total_posts}
        </div>
        <div className="box bg-sky-50 p-4 rounded-lg shadow min-w-[140px]">
          <strong>Active This Week:</strong> {data.active_users_week}
        </div>
        <div className="box bg-sky-50 p-4 rounded-lg shadow min-w-[140px]">
          <strong>Active This Month:</strong> {data.active_users_month}
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 max-w-full sm:max-w-2xl">
        <h3 className="font-semibold">📈 Monthly User Growth</h3>
        <Line data={userGrowthChart} />
      </div>

      <div className="mt-6 max-w-full sm:max-w-md">
        <h3 className="font-semibold">👥 Gender Distribution</h3>
        <Pie data={genderPieChart} />
      </div>

      {/* Top Users */}
      <div className="mt-6">
        <h3 className="font-semibold">🏆 Top 5 Users by Posts</h3>
        <ul>
          {data.top_users
            .filter((user) =>
              user.username.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((user, index) => (
              <li key={index}>
                {user.username} — {user.posts} posts
              </li>
            ))}
        </ul>
      </div>

      {/* Download */}
      <div className="mt-6">
        <button
          onClick={handleDownloadCSV}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow hover:bg-teal-600"
        >
          Download CSV 📥
        </button>
      </div>
    </div>
  );
};

export default AdminAnalytics;