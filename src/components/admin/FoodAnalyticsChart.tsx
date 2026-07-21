'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';

interface FoodAnalyticsProps {
  data: {
    veg: number;
    nonVeg: number;
    optOut: number;
  };
}

export function FoodAnalyticsChart({ data }: FoodAnalyticsProps) {
  const chartData = [
    { name: 'Vegetarian', value: data.veg, color: '#4ade80' },
    { name: 'Non-Vegetarian', value: data.nonVeg, color: '#f87171' },
    { name: 'Opted Out', value: data.optOut, color: '#9ca3af' },
  ].filter(item => item.value > 0);

  const total = data.veg + data.nonVeg + data.optOut;

  return (
    <GlassCard className="h-full flex flex-col" hoverEffect={false}>
      <h3 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-wider">Food Preferences</h3>
      
      {total === 0 ? (
        <div className="flex-grow flex items-center justify-center text-text-muted">
          No food preference data available.
        </div>
      ) : (
        <div className="flex-grow min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(5, 5, 5, 0.9)', 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}
