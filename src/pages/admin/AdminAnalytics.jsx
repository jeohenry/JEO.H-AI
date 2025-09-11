//src/pages/admin/AdminAnalytics.jsx

import React, { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import { fetchAnalyticsSummary } from "@/api";
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, ArcElement } from "chart.js";
import { saveAs } from "file-saver";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, ArcElement);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data and auto-refresh every 60 seconds
  useEffect(() => {
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

    fetchData();
    const interval = setInterval(fetchData, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

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
      ...data.top_users.map((user) => [user.username, user.posts])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "analytics_summary.csv");
  };

  if (loading || !data) return <p>Loading admin analytics...</p>;

  // Prepare chart data
  const userGrowthChart = {
    labels: Object.keys(data.user_growth_by_month),
    datasets: [{
      label: "Users Joined",
      data: Object.values(data.user_growth_by_month),
      borderColor: "#4bc0c0",
      backgroundColor: "#c8f7f7",
      fill: true,
      tension: 0.4
    }]
  };

  const genderPieChart = {
    labels: Object.keys(data.gender_distribution),
    datasets: [{
      label: "Gender Distribution",
      data: Object.values(data.gender_distribution),
      backgroundColor: ["#36a2eb", "#ff6384", "#ffcd56", "#4bc0c0", "#9966ff"]
    }]
  };

  return (
    <div className="analytics-container" style={{ padding: "2rem" }}>
      <h2>📊 Admin Analytics</h2>

      <div className="summary-boxes" style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div className="box"><strong>Total Users:</strong> {data.total_users}</div>
        <div className="box"><strong>Total Posts:</strong> {data.total_posts}</div>
        <div className="box"><strong>Active This Week:</strong> {data.active_users_week}</div>
        <div className="box"><strong>Active This Month:</strong> {data.active_users_month}</div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>📈 Monthly User Growth</h3>
        <div style={{ maxWidth: "600px" }}>
          <Line data={userGrowthChart} />
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>👥 Gender Distribution</h3>
        <div style={{ maxWidth: "300px" }}>
          <Pie data={genderPieChart} />
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>🏆 Top 5 Users by Posts</h3>
        <ul>
          {data.top_users.map((user, index) => (
            <li key={index}>{user.username} — {user.posts} posts</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={handleDownloadCSV} style={{
          padding: "0.6rem 1rem",
          backgroundColor: "#4bc0c0",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}>
          Download CSV 📥
        </button>
      </div>
    </div>
  );
};

export default AdminAnalytics;
