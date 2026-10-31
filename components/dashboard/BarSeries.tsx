import React from 'react';
import { MonthlyCollection } from '@/types';

interface BarSeriesProps {
  data: MonthlyCollection[];
}

export const BarSeries: React.FC<BarSeriesProps> = ({ data }) => {
  const maxAmount = Math.max(...data.map((d) => d.amount));
  const svgHeight = 180;
  const svgWidth = 400;
  const barWidth = 24;
  const gap = 8;

  return (
    <div className="bg-[#f9f7f2] border border-[#d1c9b8] p-4 rounded-[2px]">
      <h3 className="text-xs font-bold text-[#2b2b2b] uppercase tracking-wider mb-4">
        Collected per month, last 12 months
      </h3>
      <div className="overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="block mx-auto">
          {data.map((d, i) => {
            const barHeight = (d.amount / maxAmount) * 110;
            const x = i * (barWidth + gap) + 10;
            const y = svgHeight - barHeight - 30;
            const formattedK = `₹${Math.round(d.amount / 1000)}k`;

            return (
              <g key={d.period}>
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fill="#6e6a5f"
                  fontSize="9"
                  fontFamily="IBM Plex Mono"
                >
                  {formattedK}
                </text>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#1e4d58"
                  rx="1"
                  ry="1"
                />
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fill="#2b2b2b"
                  fontSize="10"
                  fontFamily="IBM Plex Sans"
                >
                  {d.period}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
