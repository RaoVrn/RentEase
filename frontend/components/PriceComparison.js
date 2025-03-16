import React from "react";
// import styles from "../styles/pricecomparison.module.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PriceComparison = () => {
  const data = {
    labels: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"],
    datasets: [
      {
        label: "Average Rent (₹ per month)",
        data: [45000, 38000, 40000, 35000, 32000],
        backgroundColor: ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "black",
          font: { size: 14 },
        },
      },
      x: {
        ticks: {
          color: "black",
          font: { size: 14 },
        },
      },
    },
  };

  return (
    <section className="price-comparison">
      <h2>Rental Price Comparison</h2>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </section>
  );
};

export default PriceComparison;
