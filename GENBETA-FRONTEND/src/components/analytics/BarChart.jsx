import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];
const GRADIENTS = [
  { id: 'grad1', colors: ['#6366f1', '#818cf8'] },
  { id: 'grad2', colors: ['#ec4899', '#f472b6'] },
  { id: 'grad3', colors: ['#8b5cf6', '#a78bfa'] },
  { id: 'grad4', colors: ['#10b981', '#34d399'] },
  { id: 'grad5', colors: ['#f59e0b', '#fbbf24'] },
];

export default function BarChart({ data, title, xLabel = "Plant", yLabel = "Count" }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-full flex flex-col min-h-[300px]">
        <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="font-medium text-gray-400">No data available for this period</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic max for Y-Axis to ensure nice ticks
  const maxVal = Math.max(...data.map(d => d.value), 0);
  const yAxisMax = maxVal === 0 ? 5 : Math.ceil(maxVal * 1.2 / 5) * 5;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-50 text-xs font-bold">
          <p className="mb-2 text-gray-500 uppercase tracking-widest text-[10px]">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill?.includes('url') ? COLORS[0] : payload[0].fill }} />
            <p className="text-sm text-gray-900">{yLabel}: <span className="text-indigo-600 font-black">{payload[0].value}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-full flex flex-col min-h-[300px] transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">{yLabel} Distribution</p>
        </div>
      </div>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height={220}>
          <ReBarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
            <defs>
              {GRADIENTS.map((grad) => (
                <linearGradient key={grad.id} id={grad.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={grad.colors[0]} stopOpacity={1}/>
                  <stop offset="100%" stopColor={grad.colors[1]} stopOpacity={1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              domain={[0, yAxisMax]}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 12 }} />
            <Bar 
              dataKey="value" 
              radius={[8, 8, 4, 4]}
              barSize={32}
              animationDuration={1500}
            >
              <LabelList 
                dataKey="value" 
                position="top" 
                fill="#64748b" 
                fontSize={12} 
                fontWeight={800}
                formatter={(val) => val > 0 ? val : ''}
                offset={10}
              />
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#grad${(index % 5) + 1})`}
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                />
              ))}
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
