import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function LineChart({ data, title, xLabel = "Date", yLabel = "Count" }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-full flex flex-col min-h-[300px]">
        <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1 1V4z" />
            </svg>
          </div>
          <p className="font-medium text-gray-400">No activity data available</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic max for Y-Axis
  const maxVal = Math.max(...data.map(d => d.count), 0);
  const yAxisMax = maxVal === 0 ? 5 : Math.ceil(maxVal * 1.2 / 5) * 5;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-50 text-xs font-bold">
          <p className="mb-2 text-gray-400 uppercase tracking-widest text-[10px]">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
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
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">Activity Over Time</p>
        </div>
      </div>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              domain={[0, yAxisMax]}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#6366f1" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorCount)" 
              dot={{ r: 4, fill: '#fff', stroke: '#6366f1', strokeWidth: 3 }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
