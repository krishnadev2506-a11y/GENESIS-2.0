'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';

export interface RegistrationData {
  date: string;
  registrations: number;
}

interface AnalyticsChartProps {
  data: RegistrationData[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <GlassCard className="p-6 h-full flex flex-col w-full" hoverEffect={false}>
      <h2 className="text-xl font-display font-bold text-white uppercase mb-6">Registration Trend</h2>
      
      {data.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-text-muted">
          No registration data available.
        </div>
      ) : (
        <div className="flex-grow w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12} 
                tickMargin={10} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(20,15,45,0.9)', 
                  border: '1px solid rgba(139,92,246,0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ color: '#C4B5FD' }}
              />
              <Area 
                type="monotone" 
                dataKey="registrations" 
                name="Teams Registered"
                stroke="#A855F7" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRegs)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}
