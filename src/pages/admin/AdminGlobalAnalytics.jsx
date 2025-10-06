// src/pages/admin/AdminGlobalAnalytics.jsx
import React, { useEffect, useState, useRef } from "react";
import API from "@/api"; // ✅ Import the Axios instance directly
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
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const wsRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await API.get("/admin/analytics/global"); // ✅ Direct Axios call
      setData(res.data);
      setLoading(false);
      updateChart(res.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const token = localStorage.getItem("token");
    const socket = new WebSocket(
      `${API.defaults.baseURL.replace(/^http/, "ws")}/ws/admin/analytics?token=${token}`
    );
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
    const labels = Object.keys(newData).map((mod) =>
      mod.replace(/_/g, " ").toUpperCase()
    );
    const counts = Object.values(newData);
    chart.data.labels = labels;
    chart.data.datasets[0].data = counts;
    chart.update();
  };

  const handleDownloadCSV = () => {
    if (!data) return;
    const csv = [
      ["Module", "Usage Count"],
      ...Object.entries(data).map(([mod, count]) => [mod, count]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "jeoh_global_analytics.csv");
  };

  const handleDownloadPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("JEO.H AI Global Analytics Report", 20, 20);

    const tableData = Object.entries(data).map(([key, count]) => [
      key.replace(/_/g, " ").toUpperCase(),
      count,
    ]);

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
      <div className="overflow-x-auto mt-6">
        <table className="border-collapse w-full text-xs sm:text-sm">
          <thead>
            <tr>
              <th></th>
              {hours.map((h) => (
                <th key={h} className="px-1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((d, dayIdx) => (
              <tr key={d}>
                <td className="font-bold px-2">{d}</td>
                {hours.map((h, hourIdx) => {
                  const value = moduleMap[dayIdx][hourIdx];
                  const color = `rgba(70, 130, 180, ${Math.min(1, value / 30 + 0.2)})`;
                  return (
                    <td
                      key={`${d}-${h}`}
                      style={{
                        backgroundColor: color,
                        width: "22px",
                        height: "22px",
                        textAlign: "center",
                        color: "#fff",
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

  const labels = Object.keys(data).map((mod) =>
    mod.replace(/_/g, " ").toUpperCase()
  );
  const counts = Object.values(data);

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Module Usage",
        data: counts,
        backgroundColor: "#4bc0c0",
      },
    ],
  };

  const handleDrillDown = (moduleKey) => {
    setSelectedModule(moduleKey);
    navigate(`/admin/jeoh-analytics/${moduleKey}`);
  };

  return (
    <div className="analytics-container p-4 sm:p-8">
      <h2 className="text-lg sm:text-2xl font-bold">
        📊 JEO.H AI Admin Analytics (Global)
      </h2>

      <p className="text-gray-500 text-sm mt-1">
        🟢 Live Users: {userCount} | Last updated:{" "}
        {new Date().toLocaleTimeString()}
      </p>

      <div className="mt-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search module..."
          className="w-full sm:w-1/2 p-3 rounded-md border shadow focus:outline-none"
          style={{ backgroundColor: "#fff", color: "#000" }}
        />
      </div>

      <div className="mt-4 max-w-full sm:max-w-3xl">
        <Bar
          data={barChartData}
          options={{ responsive: true, animation: false }}
          ref={(ref) => {
            if (ref) chartRef.current = ref.chartInstance || ref.chart || ref;
          }}
        />
      </div>

      <div className="summary-grid flex flex-wrap gap-4 mt-8">
        {Object.entries(data)
          .filter(([key]) =>
            key.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(([key, count], idx) => (
            <div
              key={idx}
              onClick={() => handleDrillDown(key)}
              className="cursor-pointer min-w-[140px] sm:min-w-[180px] p-4 bg-sky-50 rounded-xl shadow hover:scale-105 transition"
            >
              <strong className="block text-sm sm:text-base">
                {key.replace(/_/g, " ").toUpperCase()}
              </strong>
              <p className="text-lg sm:text-xl font-semibold">{count}</p>
            </div>
          ))}
      </div>

      <h3 className="text-lg sm:text-xl font-bold mt-10">
        🔥 {selectedModule.toUpperCase()} Activity Heatmap
      </h3>
      {renderHeatmap()}

      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={handleDownloadCSV}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow hover:bg-teal-600"
        >
          Download CSV 📥
        </button>

        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
        >
          Export as PDF 📄
        </button>
      </div>
    </div>
  );
};

export default AdminGlobalAnalytics;