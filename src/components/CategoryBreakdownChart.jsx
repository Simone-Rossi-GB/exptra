import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

export function CategoryBreakdownChart({ expenses, categories }) {
  const chartData = useMemo(() => {
    // Raggruppa spese per categoria
    const categoryMap = new Map();

    expenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, existing + expense.amount);
    });

    // Trasforma in array e aggiungi info categoria
    const data = Array.from(categoryMap.entries()).map(([catId, amount]) => {
      const category = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: category?.name || 'Altro',
        amount: amount,
        color: category?.color || '#6b7280',
      };
    });

    // Ordina per importo decrescente
    data.sort((a, b) => b.amount - a.amount);

    // Calcola percentuali
    const total = data.reduce((sum, d) => sum + d.amount, 0);
    return data.map(d => ({
      ...d,
      percentage: total > 0 ? ((d.amount / total) * 100).toFixed(1) : 0,
    }));
  }, [expenses, categories]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface/95 backdrop-blur-xl border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white mb-1">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            €{data.amount.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {data.percentage}% del totale
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props) => {
    const { fill, x, y, width, height } = props;
    const radius = 8;

    return (
      <g>
        <defs>
          <linearGradient id={`gradient-${fill}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity={0.9}/>
            <stop offset="100%" stopColor={fill} stopOpacity={0.6}/>
          </linearGradient>
        </defs>
        <path
          d={`
            M${x},${y + radius}
            Q${x},${y} ${x + radius},${y}
            L${x + width - radius},${y}
            Q${x + width},${y} ${x + width},${y + radius}
            L${x + width},${y + height}
            L${x},${y + height}
            Z
          `}
          fill={`url(#gradient-${fill})`}
        />
      </g>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-white">Spese per Categoria</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-gray-500">Nessun dato disponibile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="select-none">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          Spese per Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="w-full h-[420px] outline-none [&_svg]:outline-none [&_svg]:focus:outline-none px-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 40, left: 30, bottom: 70 }}
              style={{ outline: 'none' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.3 }} />
              <Bar
                dataKey="amount"
                shape={<CustomBar />}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {chartData.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-400 truncate">{item.name}</span>
              <span className="text-xs text-gray-500 ml-auto">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
