"use client";

import React, { useMemo, useRef } from "react";
import { useDrawSeries } from "@/lib/motion";
import { formatCompact, formatValue, type ValueFormat } from "@/lib/format";
import { EmptyState } from "./EmptyState";

export interface BarDatum {
  label: string;
  value: number;
}

export interface BarSeriesProps {
  data: BarDatum[];
  format: ValueFormat;
  // Names the chart for assistive technology.
  title: string;
  currency?: string;
  className?: string;
}

const W = 640;
const H = 260;
const M = { top: 24, right: 8, bottom: 32, left: 64 };
const TICKS = 4;
const CHAR = 6.6;

function niceCeil(max: number): number {
  if (max <= 0) return 1;
  const exp = Math.floor(Math.log10(max));
  const base = Math.pow(10, exp);
  const f = max / base;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * base;
}

export function BarSeries({
  data,
  format,
  title,
  currency = "INR",
  className = "",
}: BarSeriesProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dataKey = useMemo(() => JSON.stringify(data), [data]);
  useDrawSeries(svgRef, [dataKey]);

  if (data.length === 0) {
    return <EmptyState message="No values to chart for this period." />;
  }

  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;
  const max = niceCeil(Math.max(...data.map((d) => d.value), 0));
  const band = plotW / data.length;
  const barW = Math.max(2, band * 0.6);
  const yOf = (v: number) => M.top + plotH - (Math.max(v, 0) / max) * plotH;

  const longest = Math.max(...data.map((d) => d.label.length));
  const step = Math.max(1, Math.ceil((longest * CHAR + 4) / band));

  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => (max / TICKS) * i);

  return (
    <div className={className}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={title}
        className="w-full h-auto"
      >
        {ticks.map((t, i) => (
          <g key={t}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={yOf(t)}
              y2={yOf(t)}
              strokeWidth={1}
              className={i === 0 ? "stroke-ink" : "stroke-rule"}
            />
            <text
              x={M.left - 8}
              y={yOf(t) + 4}
              textAnchor="end"
              fontSize={11}
              className="font-mono fill-ink-2"
            >
              {formatCompact(t, format, currency)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = M.left + band * i + (band - barW) / 2;
          const y = yOf(d.value);
          const h = M.top + plotH - y;
          const cx = x + barW / 2;
          return (
            <g key={`${d.label}-${i}`}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(h, 0)}
                className="bar-series-rect fill-accent"
              />
              <text
                x={cx}
                y={y - 4}
                textAnchor="middle"
                fontSize={11}
                className="font-mono fill-ink"
              >
                {formatCompact(d.value, format, currency)}
              </text>
              {i % step === 0 && (
                <text
                  x={cx}
                  y={H - M.bottom + 16}
                  textAnchor="middle"
                  fontSize={11}
                  className="font-mono fill-ink-2"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={`${d.label}-${i}`}>
              <th scope="row">{d.label}</th>
              <td>{formatValue(d.value, format, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
