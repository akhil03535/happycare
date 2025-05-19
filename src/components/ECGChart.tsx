import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../contexts/ThemeContext';
import './ECGChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ECGChartProps {
  data: number[];
}

const ECGChart: React.FC<ECGChartProps> = ({ data }) => {
  const { darkMode } = useTheme();
  
  const chartData = {
    labels: Array.from({ length: data.length }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'ECG',
        data: data,
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderWidth: 1.5,
        tension: 0.2,
        pointRadius: 0,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        min: -1.5,
        max: 1.5,
      },
    },
    animation: {
      duration: 0
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className="ecg-chart-container flex items-center justify-center text-gray-500">
        Waiting for ECG data...
      </div>
    );
  }

  return (
    <div className="ecg-chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ECGChart;