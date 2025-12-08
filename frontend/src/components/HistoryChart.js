import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function HistoryChart({ data, chartType = 'line' }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>データがありません</p>
      </div>
    );
  }

  // 日付をフォーマット（MM/DD）
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  // 時間を分に変換
  const formatTime = (seconds) => {
    return Math.round(seconds / 60);
  };

  const chartData = data.map(item => ({
    date: formatDate(item.date),
    fullDate: item.date,
    学習時間: formatTime(item.study_time_seconds),
    学習単語数: item.words_studied,
    正答率: Math.round(item.accuracy_rate),
    正解数: item.correct_count,
    不正解数: item.wrong_count,
  }));

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="正答率" stroke="#667eea" strokeWidth={2} />
          <Line type="monotone" dataKey="学習単語数" stroke="#764ba2" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  } else {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="学習時間" fill="#667eea" />
          <Bar dataKey="学習単語数" fill="#764ba2" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}

export default HistoryChart;

