import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  approved: ['#10b981', '#34d399'], // Emerald to Green
  pending: ['#6366f1', '#818cf8'],  // Indigo to Blue
  rejected: ['#ef4444', '#f87171'], // Red to Light Red
  submitted: ['#3b82f6', '#60a5fa'], // Blue
  pending_approval: ['#f59e0b', '#fbbf24'] // Amber
};

export default function PieChart({ data, title }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-full flex flex-col min-h-[300px]">
        <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="font-medium text-gray-400">No status data available</p>
        </div>
      </div>
    );
  }

  const chartData = Object.entries(data).map(([key, value]) => {
    const statusKey = key.toLowerCase();
    return {
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      value: value || 0,
      statusKey: statusKey,
      color: COLORS[statusKey] ? COLORS[statusKey][0] : '#94a3b8'
    };
  }).filter(d => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-full flex flex-col min-h-[300px]">
        <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <p className="font-medium">No data to display</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-50 text-xs font-bold">
          <p className="mb-2 text-gray-400 uppercase tracking-widest text-[10px]">{data.name}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
            <p className="text-sm text-gray-900">Submissions: <span className="font-black" style={{ color: data.color }}>{data.value}</span></p>
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
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">Distribution by Status</p>
        </div>
      </div>
      
      <div className="flex-1 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <RePieChart>
            <defs>
              {chartData.map((entry) => (
                <linearGradient key={`grad-${entry.statusKey}`} id={`grad-${entry.statusKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS[entry.statusKey] ? COLORS[entry.statusKey][0] : '#94a3b8'} stopOpacity={1}/>
                  <stop offset="100%" stopColor={COLORS[entry.statusKey] ? COLORS[entry.statusKey][1] || COLORS[entry.statusKey][0] : '#cbd5e1'} stopOpacity={1}/>
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={6}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#grad-${entry.statusKey})`}
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">{value}</span>}
            />
          </RePieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute top-[41%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-2xl font-black text-gray-900 tracking-tighter">
            {chartData.reduce((acc, curr) => acc + curr.value, 0)}
          </p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Total</p>
        </div>
      </div>
    </div>
  );
}
