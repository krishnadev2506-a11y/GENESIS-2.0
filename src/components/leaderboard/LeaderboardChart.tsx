'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { m } from 'framer-motion';
import { fadeUp } from '@/lib/motion-variants';

interface LeaderboardChartProps {
  data: {
    teamName: string;
    scoreboardPoints: number;
    rank: number;
  }[];
}

export function LeaderboardChart({ data }: LeaderboardChartProps) {
  if (data.length === 0) return null;

  // Calculate maximum score for dynamic yAxis scaling
  const maxScore = Math.max(...data.map(d => d.scoreboardPoints));
  // Add some padding to the top of the chart (e.g. 20%)
  const yAxisMax = Math.ceil(maxScore * 1.2);

  return (
    <m.div 
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="w-full h-[350px] mb-12 sm:mb-16"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 0, left: -20, bottom: 40 }}
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE047" stopOpacity={1} />
              <stop offset="100%" stopColor="#CA8A04" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="silverGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E2E8F0" stopOpacity={1} />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="bronzeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDBA74" stopOpacity={1} />
              <stop offset="100%" stopColor="#B45309" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="teamName" 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={11} 
            tickMargin={15} 
            axisLine={false} 
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            allowDecimals={false}
            domain={[0, yAxisMax]}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ 
              backgroundColor: 'rgba(20,15,45,0.9)', 
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: '12px',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              fontFamily: 'Outfit, sans-serif'
            }}
            itemStyle={{ color: '#C4B5FD', fontWeight: 'bold' }}
            formatter={(value: number) => [`${value} Points`, 'Score']}
            labelStyle={{ color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}
          />
          <Bar 
            dataKey="scoreboardPoints" 
            radius={[6, 6, 0, 0]}
            maxBarSize={60}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => {
              let fill = "url(#defaultGradient)";
              if (entry.rank === 1) fill = "url(#goldGradient)";
              else if (entry.rank === 2) fill = "url(#silverGradient)";
              else if (entry.rank === 3) fill = "url(#bronzeGradient)";
              
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </m.div>
  );
}
