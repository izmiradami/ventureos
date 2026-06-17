"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RevenuePoint } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(258 90% 66%)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="hsl(258 90% 66%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mrrStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(258 90% 66%)" />
              <stop offset="100%" stopColor="hsl(187 92% 56%)" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(230 18% 18%)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="hsl(222 12% 50%)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(222 12% 50%)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
            width={56}
          />
          <Tooltip
            cursor={{ stroke: "hsl(258 90% 66%)", strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              background: "hsl(230 26% 8% / 0.95)",
              border: "1px solid hsl(0 0% 100% / 0.08)",
              borderRadius: "0.75rem",
              backdropFilter: "blur(12px)",
              fontSize: "0.8rem",
            }}
            labelStyle={{ color: "hsl(222 12% 70%)" }}
            formatter={(value: number, name) => [
              name === "mrr" ? formatCurrency(value) : value,
              name === "mrr" ? "MRR" : "Customers",
            ]}
          />
          <Area
            type="monotone"
            dataKey="mrr"
            stroke="url(#mrrStroke)"
            strokeWidth={2.5}
            fill="url(#mrrFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
