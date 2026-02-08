/**
 * Enhanced StatCard Component
 * 
 * WHAT: Modern KPI card with trend indicators and improved visual hierarchy
 * WHY: Better data visualization, trend awareness, and professional appearance
 * 
 * Props:
 * - title: Card title
 * - value: Main metric value
 * - subtitle: Optional secondary text
 * - icon: React icon component
 * - color: Color theme (indigo, blue, green, red, orange, amber, purple)
 * - trend: Percentage change (positive = green up arrow, negative = red down arrow)
 * - previousValue: Previous period value for trend calculation
 * - loading: Show skeleton state
 */
export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = "indigo", 
  trend,
  previousValue,
  loading = false
}) {
  const colorClasses = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      grad: "from-indigo-600 to-blue-600",
      shadow: "shadow-indigo-100",
      border: "border-indigo-100"
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      grad: "from-blue-600 to-cyan-600",
      shadow: "shadow-blue-100",
      border: "border-blue-100"
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      grad: "from-green-600 to-emerald-600",
      shadow: "shadow-green-100",
      border: "border-green-100"
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
      grad: "from-red-600 to-pink-600",
      shadow: "shadow-red-100",
      border: "border-red-100"
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      grad: "from-orange-600 to-amber-600",
      shadow: "shadow-orange-100",
      border: "border-orange-100"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      grad: "from-amber-600 to-yellow-600",
      shadow: "shadow-amber-100",
      border: "border-amber-100"
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      grad: "from-purple-600 to-violet-600",
      shadow: "shadow-purple-100",
      border: "border-purple-100"
    }
  };

  const selectedColor = colorClasses[color] || colorClasses.indigo;

  // Calculate trend if previousValue is provided
  let calculatedTrend = trend;
  if (previousValue !== undefined && value !== undefined && previousValue !== null && value !== null) {
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    const numericPrevious = typeof previousValue === 'string' ? parseFloat(previousValue.replace(/[^0-9.]/g, '')) : previousValue;
    
    if (numericPrevious > 0) {
      calculatedTrend = ((numericValue - numericPrevious) / numericPrevious) * 100;
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-16 bg-gray-100 rounded" />
            <div className="h-5 w-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 border ${selectedColor.border} hover:shadow-md transition-all duration-200 group relative overflow-hidden`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-8 h-8 bg-gradient-to-br ${selectedColor.grad} rounded-md flex items-center justify-center shadow-sm ${selectedColor.shadow} transition-all duration-200`}>
            {icon && <div className="text-white scale-75">{icon}</div>}
          </div>
          {calculatedTrend !== undefined && calculatedTrend !== null && (
            <div className={`px-1.5 py-0.5 rounded text-[9px] font-black flex items-center gap-0.5 ${
              calculatedTrend > 0 
                ? "bg-emerald-50 text-emerald-700" 
                : calculatedTrend < 0
                ? "bg-red-50 text-red-700"
                : "bg-gray-50 text-gray-600"
            }`}>
              {calculatedTrend > 0 ? "↗" : calculatedTrend < 0 ? "↘" : "→"}
              {calculatedTrend !== 0 && `${Math.abs(calculatedTrend).toFixed(1)}%`}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{title}</h3>
          <div className="flex items-baseline gap-1.5">
            <p className="text-xl font-black text-gray-900 tracking-tighter">{value}</p>
            {subtitle && (
              <p className="text-[10px] font-semibold text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

