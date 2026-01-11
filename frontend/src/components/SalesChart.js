import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Total Sales",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/sales-data");
      const data = res.data;

      const productNames = data.map(item => item.productName);
      const salesCounts = data.map(item => item.totalSales);

      setChartData({
        labels: productNames,
        datasets: [
          {
            label: "Total Sales",
            data: salesCounts,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  return (
    <div className="container mt-5">
      <h3>Sales Analytics</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center my-5">
          <p>Loading sales data...</p>
        </div>
      ) : (
        <div className="chart-container" style={{ position: 'relative', height: '60vh', width: '100%' }}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SalesChart;
