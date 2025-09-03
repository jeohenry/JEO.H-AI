// src/pages/admin/AdminGlobalAnalytics.jsx

import React, { useEffect, useState, useRef } from "react";
import { fetchGlobalAnalytics } from "../../api/AdminGlobalAPI";
import { Bar } from "react-chartjs-2";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = [...Array(24).keys()];

const AdminGlobalAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [heatmap, setHeatmap] = useState({});
  const [selectedModule, setSelectedModule] = useState("chat");
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const wsRef = useRef(null);

  const fetchData = () => {
    fetchGlobalAnalytics()
      .then((res) => {
        setData(res.data);
        setLoading(false);
        updateChart(res.data);
      })
      .catch((err) => console.error("Failed to load analytics", err));
  };

  const setupWebSocket = () => {
    const token = localStorage.getItem("token");
    const socket = new WebSocket(`ws://localhost:8000/ws/admin/analytics?token=${token}`);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      const incoming = JSON.parse(event.data);
      if (incoming.type === "summary") {
        setData(incoming.payload);
        updateChart(incoming.payload);
      } else if (incoming.type === "users") {
        setUserCount(incoming.payload);
      } else if (incoming.type === "heatmap") {
        setHeatmap(incoming.payload);
      }
    };

    socket.onclose = () => {
      console.warn("WebSocket closed. Reconnecting in 3s...");
      setTimeout(setupWebSocket, 3000);
    };

    socket.onerror = (e) => {
      console.error("WebSocket error:", e);
      socket.close();
    };
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    setupWebSocket();
    return () => {
      clearInterval(interval);
      wsRef.current && wsRef.current.close();
    };
  }, []);

  const updateChart = (newData) => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const labels = Object.keys(newData).map((mod) => mod.replace(/_/g, ' ').toUpperCase());
    const counts = Object.values(newData);
    chart.data.labels = labels;
    chart.data.datasets[0].data = counts;
    chart.update();
  };

  const handleDownloadCSV = () => {
    if (!data) return;
    const csv = [
      ["Module", "Usage Count"],
      ...Object.entries(data).map(([mod, count]) => [mod, count])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "jeoh_global_analytics.csv");
  };

  const handleDownloadPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("JEO.H AI Global Analytics Report", 20, 20);

    const tableData = Object.entries(data).map(([key, count]) => [key.replace(/_/g, ' ').toUpperCase(), count]);

    doc.autoTable({
      startY: 30,
      head: [["Module", "Usage Count"]],
      body: tableData,
    });

    doc.save("jeoh_global_analytics.pdf");
  };

  const renderHeatmap = () => {
    const moduleMap = heatmap[selectedModule];
    if (!moduleMap) return <p>No heatmap data yet for {selectedModule}</p>;
    return (
      <div style={{ overflowX: "auto", marginTop: "2rem" }}>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th></th>
              {hours.map((h) => (
                <th key={h} style={{ padding: "3px 5px", fontSize: "0.75rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((d, dayIdx) => (
              <tr key={d}>
                <td style={{ fontWeight: "bold", padding: "3px 5px" }}>{d}</td>
                {hours.map((h, hourIdx) => {
                  const value = moduleMap[dayIdx][hourIdx];
                  const color = `rgba(70, 130, 180, ${Math.min(1, value / 30 + 0.2)})`;
                  return (
                    <td
                      key={`${d}-${h}`}
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: color,
                        textAlign: "center",
                        fontSize: "0.65rem",
                        color: "white"
                      }}
                    >
                      {value > 0 ? value : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading || !data) return <p>Loading global analytics...</p>;

  const labels = Object.keys(data).map(mod => mod.replace(/_/g, ' ').toUpperCase());
  const counts = Object.values(data);

  const barChartData = {
    labels,
    datasets: [{
      label: "Module Usage",
      data: counts,
      backgroundColor: "#4bc0c0",
    }]
  };

  const handleDrillDown = (moduleKey) => {
    setSelectedModule(moduleKey);
    navigate(`/admin/jeoh-analytics/${moduleKey}`);
  };

  return (
    <div className="analytics-container" style={{ padding: "2rem" }}>
      <h2>📊 JEO.H AI Admin Analytics (Global)</h2>

      <p style={{ fontSize: "0.9rem", color: "gray" }}>
        🟢 Live Users: {userCount} &nbsp; | &nbsp; Last updated: {new Date().toLocaleTimeString()}
      </p>

      <div style={{ marginTop: "1rem", maxWidth: 800 }}>
        <Bar
          data={barChartData}
          options={{ responsive: true, animation: false }}
          ref={(ref) => {
            if (ref) chartRef.current = ref.chartInstance || ref.chart || ref;
          }}
        />
      </div>

      <div className="summary-grid" style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginTop: "2rem" }}>
        {Object.entries(data).map(([key, count], idx) => (
          <div
            key={idx}
            onClick={() => handleDrillDown(key)}
            className="box hoverable"
            style={{
              cursor: "pointer",
              minWidth: "180px",
              padding: "1rem",
              background: "#f0f8ff",
              borderRadius: "8px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
            }}
          >
            <strong>{key.replace(/_/g, ' ').toUpperCase()}</strong>
            <p style={{ fontSize: "1.4rem" }}>{count}</p>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: "3rem" }}>🔥 {selectedModule.toUpperCase()} Activity Heatmap</h3>
      {renderHeatmap()}

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <button
          onClick={handleDownloadCSV}
          style={{
            padding: "0.6rem 1rem",
            backgroundColor: "#4bc0c0",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Download CSV 📥
        </button>

        <button
          onClick={handleDownloadPDF}
          style={{
            padding: "0.6rem 1rem",
            backgroundColor: "#36a2eb",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Export as PDF 📄
        </button>
      </div>
    </div>
  );
};

export default AdminGlobalAnalytics;






