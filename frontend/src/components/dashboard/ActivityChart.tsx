import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ActivityChartProps {
  data?: { day: string; words: number; sentences: number }[];
}

const DEFAULT_ACTIVITY = [
  { day: 'Mon', words: 18, sentences: 4 },
  { day: 'Tue', words: 26, sentences: 8 },
  { day: 'Wed', words: 34, sentences: 11 },
  { day: 'Thu', words: 22, sentences: 6 },
  { day: 'Fri', words: 42, sentences: 15 },
  { day: 'Sat', words: 38, sentences: 12 },
  { day: 'Sun', words: 29, sentences: 9 },
];

export const ActivityChart: React.FC<ActivityChartProps> = ({
  data = DEFAULT_ACTIVITY,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#F0F2F3] flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[#252720]">Recognition Activity</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E4F2D8] text-[#21431A]">
              Past 7 Days
            </span>
          </div>
          <p className="text-xs text-[#747873] mt-0.5">
            Static words and dynamic sentences translated
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-[#F0F2F3] flex items-center justify-center text-[#747873]">
          <TrendingUp className="w-4 h-4 text-[#84A45B]" />
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#747873' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#747873' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8EEDF',
                boxShadow: '0 8px 24px -4px rgba(37, 39, 32, 0.08)',
                fontSize: '12px',
                color: '#252720',
              }}
              cursor={{ fill: '#F7F8F4', radius: 8 }}
            />
            <Bar dataKey="words" name="Static Words" fill="#D5E2C2" radius={[6, 6, 0, 0]} />
            <Bar dataKey="sentences" name="Dynamic Sentences" fill="#B7C8FF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-[#F0F2F3] flex items-center justify-center gap-6 text-xs text-[#747873]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#D5E2C2]" />
          <span>Static Words</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#B7C8FF]" />
          <span>Dynamic Sentences</span>
        </div>
      </div>
    </div>
  );
};

