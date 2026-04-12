"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  type PieLabelRenderProps,
} from "recharts";

const COLORS = ["#1a4d2e", "#2e7d46", "#c4a882", "#a1887f", "#4caf50", "#81c784", "#d7ccc8", "#795548"];

interface ChartData {
  name: string;
  count: number;
}

export function BarChartCard({
  title,
  data,
}: {
  title: string;
  data: ChartData[];
}) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h3 className="text-sm font-medium text-muted mb-4">{title}</h3>
      <div style={{ width: "100%", height: 256, direction: "ltr" }}>
        <ResponsiveContainer width="100%" height={256}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11 }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
                direction: "rtl",
              }}
            />
            <Bar dataKey="count" fill="#1a4d2e" radius={[0, 4, 4, 0]} name="العدد" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PieChartCard({
  title,
  data,
}: {
  title: string;
  data: ChartData[];
}) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h3 className="text-sm font-medium text-muted mb-4">{title}</h3>
      <div style={{ width: "100%", height: 256, direction: "ltr" }}>
        <ResponsiveContainer width="100%" height={256}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={2}
              label={(props: PieLabelRenderProps) =>
                `${props.name ?? ""} (${(((props.percent as number) ?? 0) * 100).toFixed(0)}%)`
              }
              labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
                direction: "rtl",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
