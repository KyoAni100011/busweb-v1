import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  lineColor?: string;
  fillColor?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  formatValue?: (value: number) => string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  lineColor = '#3b82f6',
  fillColor = 'rgba(59, 130, 246, 0.1)',
  showGrid = true,
  showLabels = true,
  formatValue = (v) => v.toLocaleString(),
}) => {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const width = 100;
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = width - padding.left - padding.right;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  const getX = (index: number) =>
    padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (value: number) =>
    padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

  const pathData = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`)
    .join(' ');

  const areaPath = `${pathData} L ${getX(data.length - 1)} ${
    padding.top + chartHeight
  } L ${padding.left} ${padding.top + chartHeight} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = minValue + valueRange * (1 - ratio);
    const y = padding.top + chartHeight * ratio;

    return { y, value };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      {showGrid &&
        gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={line.y}
              x2={width - padding.right}
              y2={line.y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
            <text
              x={padding.left - 5}
              y={line.y}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-gray-500 text-[4px]"
            >
              {formatValue(line.value)}
            </text>
          </g>
        ))}

      <path d={areaPath} fill={fillColor} />
      <path
        d={pathData}
        fill="none"
        stroke={lineColor}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {data.map((d, i) => (
        <circle
          key={i}
          cx={getX(i)}
          cy={getY(d.value)}
          r="1.5"
          fill={lineColor}
          className="opacity-0 transition-opacity hover:opacity-100"
        />
      ))}

      {showLabels &&
        data
          .filter((_, i) => i % Math.ceil(data.length / 7) === 0)
          .map((d, i) => {
            const originalIndex = data.indexOf(d);

            return (
              <text
                key={i}
                x={getX(originalIndex)}
                y={height - 10}
                textAnchor="middle"
                className="fill-gray-500 text-[3.5px]"
              >
                {d.label}
              </text>
            );
          })}
    </svg>
  );
};

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  barColor?: string;
  showLabels?: boolean;
  formatValue?: (value: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  barColor = '#3b82f6',
  showLabels = true,
  formatValue = (v) => v.toLocaleString(),
}) => {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const width = 100;
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = width - padding.left - padding.right;

  const maxValue = Math.max(...data.map((d) => d.value));
  const barWidth = (chartWidth / data.length) * 0.7;
  const barGap = (chartWidth / data.length) * 0.3;

  const getBarHeight = (value: number) => (value / maxValue) * chartHeight;
  const getBarX = (index: number) =>
    padding.left + index * (barWidth + barGap) + barGap / 2;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = maxValue * (1 - ratio);
    const y = padding.top + chartHeight * ratio;

    return { y, value };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      {gridLines.map((line, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={line.y}
            x2={width - padding.right}
            y2={line.y}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
          <text
            x={padding.left - 5}
            y={line.y}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-gray-500 text-[4px]"
          >
            {formatValue(line.value)}
          </text>
        </g>
      ))}

      {data.map((d, i) => (
        <g key={i}>
          <rect
            x={getBarX(i)}
            y={padding.top + chartHeight - getBarHeight(d.value)}
            width={barWidth}
            height={getBarHeight(d.value)}
            fill={barColor}
            rx="1"
            className="transition-opacity hover:opacity-80"
          />
          {showLabels && (
            <text
              x={getBarX(i) + barWidth / 2}
              y={height - 10}
              textAnchor="middle"
              className="fill-gray-500 text-[3.5px]"
            >
              {d.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  innerRadius?: number;
  showLegend?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  innerRadius = 0.6,
  showLegend = true,
}) => {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 40;
  const innerR = radius * innerRadius;
  const centerX = 50;
  const centerY = 50;

  let currentAngle = -90;

  const slices = data.map((d) => {
    const percentage = d.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const ix1 = centerX + innerR * Math.cos(startRad);
    const iy1 = centerY + innerR * Math.sin(startRad);
    const ix2 = centerX + innerR * Math.cos(endRad);
    const iy2 = centerY + innerR * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${ix2} ${iy2}
      A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}
      Z
    `;

    return { ...d, path, percentage };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-full w-full max-w-[150px]">
        {slices.map((slice, i) => (
          <path
            key={i}
            d={slice.path}
            fill={slice.color}
            className="transition-opacity hover:opacity-80"
          />
        ))}
        <text
          x={centerX}
          y={centerY - 2}
          textAnchor="middle"
          className="fill-gray-900 text-[8px] font-bold"
        >
          {total.toLocaleString()}
        </text>
        <text
          x={centerX}
          y={centerY + 6}
          textAnchor="middle"
          className="fill-gray-500 text-[4px]"
        >
          Total
        </text>
      </svg>

      {showLegend && (
        <div className="flex flex-col gap-2">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm text-gray-600">
                {slice.label} ({(slice.percentage * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = '#3b82f6',
  showLabel = true,
  label,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium text-gray-900">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#3b82f6',
  height = 40,
}) => {
  if (data.length < 2) {
    return null;
  }

  const width = 100;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const valueRange = maxValue - minValue || 1;

  const getX = (index: number) => padding + (index / (data.length - 1)) * chartWidth;
  const getY = (value: number) =>
    padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;

  const pathData = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
