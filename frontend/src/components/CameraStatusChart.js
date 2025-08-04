import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import { useColorModeValue } from "@chakra-ui/react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const HorizontalBarChart = ({ onlineCamera, offlineCamera }) => {
  const darkModeBackground = useColorModeValue("#fff", "#333"); // Light and dark mode backgrounds
  const darkModeGridLines = useColorModeValue(
    "rgba(0, 0, 0, 0.1)",
    "rgba(255, 255, 255, 0.1)"
  ); // Grid lines for light and dark mode

  const data = {
    labels: ["Online", "Offline"], // Labels for the categories
    datasets: [
      {
        label: "Online", // Label for the online bar
        data: [onlineCamera, 0], // Online value, 0 for Offline
        backgroundColor: ["#73c04e"], // Green color for Online
        borderWidth: 1,
        borderRadius: 5, // Rounded corners
        barThickness: 30, // Adjust bar thickness
      },
      {
        label: "Offline", // Label for the offline bar
        data: [0, offlineCamera], // Offline value, 0 for Online
        backgroundColor: ["#e53935"], // Red color for Offline
        borderWidth: 1,
        borderRadius: 5, // Rounded corners
        barThickness: 30, // Adjust bar thickness
      },
    ],
  };

  const options = {
    indexAxis: "y", // Switches the axes to horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle", // Circular legend points
        },
      },
      tooltip: {
        enabled: true,
      },
      title: {
        display: true,
        text: `Online: ${onlineCamera} | Offline: ${offlineCamera}`, // Dynamic title
        align: "start", // Aligns the title to the left
        font: {
          size: 14,
          weight: "bold",
        },
        padding: {
          top: 0,
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: Math.ceil(onlineCamera + offlineCamera), // Round up total to nearest whole number
        ticks: {
          stepSize: Math.ceil((onlineCamera + offlineCamera) / 5), // Ensure ticks increment by whole numbers
          precision: 0, // Avoid decimal places
        },
        grid: {
          color: darkModeGridLines, // Grid lines based on color mode
        },
      },
      y: {
        ticks: {
          display: false, // Hide labels on y-axis
        },
        grid: {
          color: darkModeGridLines, // Grid lines based on color mode
        },
      },
    },

    elements: {
      bar: {
        backgroundColor: darkModeBackground, // Background color of bars based on color mode
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "210px" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default HorizontalBarChart;
