"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { useMemo } from "react";

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HealthMetric {
  id: string;
  timestamp: string;
  cpuUsage?: number | null;
  memoryUsage?: number | null;
  diskUsage?: number | null;
  uptime?: number | null;
}

interface ServerHealthChartProps {
  healthMetrics: HealthMetric[];
}

const ServerHealthChart = ({ healthMetrics }: ServerHealthChartProps) => {
  const chartData = useMemo(() => {
    // Reverse the array to show oldest first
    const sortedMetrics = [...healthMetrics].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const labels = sortedMetrics.map((metric) =>
      new Date(metric.timestamp).toLocaleTimeString()
    );

    const data: ChartData<"line"> = {
      labels,
      datasets: [
        {
          label: "CPU Usage (%)",
          data: sortedMetrics.map((metric) => metric.cpuUsage || 0),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          tension: 0.3,
        },
        {
          label: "Memory Usage (%)",
          data: sortedMetrics.map((metric) => metric.memoryUsage || 0),
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          tension: 0.3,
        },
        {
          label: "Disk Usage (%)",
          data: sortedMetrics.map((metric) => metric.diskUsage || 0),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: 0.3,
        },
      ],
    };

    return data;
  }, [healthMetrics]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Usage (%)",
        },
      },
    },
  };

  if (healthMetrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No health data available</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ServerHealthChart;