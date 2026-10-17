import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Activity, TrendingDown, TrendingUp, CheckCircle, Info } from 'lucide-react';

export default function TrendCharts() {
  const { t } = useTranslation();
  const [selectedMetric, setSelectedMetric] = useState('HbA1c');
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const metrics = [
    { id: 'HbA1c', label: t('trends.hba1c'), unit: '%', normalMin: 4.0, normalMax: 5.6, target: '< 7.0%' },
    { id: 'Hemoglobin', label: t('trends.hemoglobin'), unit: 'g/dL', normalMin: 12.0, normalMax: 15.5, target: '12 - 15 g/dL' },
    { id: 'Fasting Blood Sugar', label: t('trends.fbs'), unit: 'mg/dL', normalMin: 70, normalMax: 99, target: '< 100 mg/dL' }
  ];

  const currentMetricConfig = metrics.find(m => m.id === selectedMetric) || metrics[0];

  useEffect(() => {
    async function fetchTrend() {
      setLoading(true);
      try {
        const res = await api.getTrends(selectedMetric);
        setTrendData(res.data || []);
      } catch (err) {
        console.error('Failed to load trends:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrend();
  }, [selectedMetric]);

  // SVG Chart Dimensions
  const width = 580;
  const height = 220;
  const padding = { top: 25, right: 30, bottom: 45, left: 45 };

  const values = trendData.map(d => parseFloat(d.value)).filter(v => !isNaN(v));
  const minVal = values.length ? Math.min(...values, currentMetricConfig.normalMin) * 0.9 : 0;
  const maxVal = values.length ? Math.max(...values, currentMetricConfig.normalMax) * 1.1 : 10;

  const getX = (index) => {
    if (trendData.length <= 1) return width / 2;
    return padding.left + (index / (trendData.length - 1)) * (width - padding.left - padding.right);
  };

  const getY = (val) => {
    return height - padding.bottom - ((val - minVal) / (maxVal - minVal || 1)) * (height - padding.top - padding.bottom);
  };

  // Generate SVG path for line
  const linePoints = trendData.map((d, i) => `${getX(i)},${getY(parseFloat(d.value))}`).join(' ');

  // Compute Improvement Summary
  const firstVal = trendData.length > 0 ? parseFloat(trendData[0].value) : null;
  const lastVal = trendData.length > 0 ? parseFloat(trendData[trendData.length - 1].value) : null;
  const isImproved = firstVal !== null && lastVal !== null && (selectedMetric === 'HbA1c' ? lastVal < firstVal : lastVal >= firstVal);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{t('trends.title')}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t('trends.subtitle')}</p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
          {metrics.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMetric(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedMetric === m.id
                  ? 'bg-white text-teal-800 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Improvement Indicator Banner */}
      {firstVal !== null && lastVal !== null && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>
              {t('trends.progress')}: <strong>{firstVal} {currentMetricConfig.unit}</strong> ({t('trends.start')}) → <strong>{lastVal} {currentMetricConfig.unit}</strong> ({t('trends.latest')})
            </span>
          </div>
          <span className="font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[11px]">
            {isImproved ? t('trends.improved') : t('trends.monitored')}
          </span>
        </div>
      )}

      {/* Interactive SVG Chart */}
      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 select-none">
          {/* Normal Range Shaded Zone */}
          <rect
            x={padding.left}
            y={getY(currentMetricConfig.normalMax)}
            width={width - padding.left - padding.right}
            height={Math.max(2, getY(currentMetricConfig.normalMin) - getY(currentMetricConfig.normalMax))}
            fill="#ccfbf1"
            opacity="0.5"
            rx="4"
          />
          <text
            x={width - padding.right - 5}
            y={getY(currentMetricConfig.normalMax) + 12}
            textAnchor="end"
            fontSize="10"
            fill="#0f766e"
            fontWeight="600"
          >
            {t('trends.normalZone')} ({currentMetricConfig.normalMin}-{currentMetricConfig.normalMax} {currentMetricConfig.unit})
          </text>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={getY(currentMetricConfig.normalMax)}
            x2={width - padding.right}
            y2={getY(currentMetricConfig.normalMax)}
            stroke="#99f6e4"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={getY(currentMetricConfig.normalMin)}
            x2={width - padding.right}
            y2={getY(currentMetricConfig.normalMin)}
            stroke="#99f6e4"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Connected Data Line */}
          {trendData.length > 1 && (
            <polyline
              fill="none"
              stroke="#0d9488"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={linePoints}
            />
          )}

          {/* Data Points */}
          {trendData.map((d, idx) => {
            const cx = getX(idx);
            const cy = getY(parseFloat(d.value));
            const isAbnormal = d.flag === 'high' || d.flag === 'low';
            const isHovered = hoveredPoint?.date === d.date;

            return (
              <g key={idx} onMouseEnter={() => setHoveredPoint(d)} onMouseLeave={() => setHoveredPoint(null)}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 8 : 6}
                  fill={isAbnormal ? '#ef4444' : '#14b8a6'}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all drop-shadow"
                />
                {/* Date Label on X Axis */}
                <text
                  x={cx}
                  y={height - 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                  fontWeight="500"
                >
                  {d.date.slice(5)}
                </text>
                {/* Value label */}
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#0f172a"
                  fontWeight="700"
                >
                  {d.value}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 pointer-events-none flex items-center space-x-2">
            <span>📅 {hoveredPoint.date}</span>
            <span>•</span>
            <span className="font-bold text-teal-300">{hoveredPoint.hospital}</span>
            <span>•</span>
            <span className="font-bold">{hoveredPoint.value} {hoveredPoint.unit}</span>
          </div>
        )}
      </div>
    </div>
  );
}
