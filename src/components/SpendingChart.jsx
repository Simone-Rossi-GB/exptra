import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from "framer-motion";

const COLORS = {
  groceries: '#3B82F6',
  food: '#F97316',
  transport: '#10B981',
  home: '#A855F7',
  entertainment: '#EC4899',
  utilities: '#FBBF24',
};

const categoryLabels = {
  groceries: 'Spesa',
  food: 'Ristoranti',
  transport: 'Trasporti',
  home: 'Casa',
  entertainment: 'Svago',
  utilities: 'Bollette',
};

export function SpendingChart({ expenses }) {
  // Group expenses by category
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.categoria);
    if (existing) {
      existing.value += expense.importo;
    } else {
      acc.push({
        name: expense.categoria,
        label: categoryLabels[expense.categoria] || expense.categoria,
        value: expense.importo,
        color: COLORS[expense.categoria] || COLORS.groceries,
      });
    }
    return acc;
  }, []);

  const total = categoryData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="bg-surface border border-gray-700 rounded-xl p-3 shadow-xl">
          <p className="text-white font-semibold text-sm">{data.label}</p>
          <p className="text-primary font-bold text-lg mt-1">
            €{data.value.toFixed(2)}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">{percentage}% del totale</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show label for small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="border-b border-gray-800/50">
          <CardTitle>Spese per Categoria</CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Nessun dato disponibile
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={90}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legend */}
          {categoryData.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-800/50">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-400 truncate">{item.label}</span>
                  <span className="text-sm font-semibold text-white ml-auto">
                    €{item.value.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
