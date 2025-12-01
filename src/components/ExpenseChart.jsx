import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChartIcon, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

const categoryLabels = {
  groceries: 'Spesa',
  food: 'Cibo',
  transport: 'Trasporti',
  home: 'Casa',
  entertainment: 'Intrattenimento',
};

export function ExpenseChart({ expenses }) {
  const [chartType, setChartType] = useState('pie');

  if (!expenses || expenses.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">Statistiche</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-slate-400">Nessun dato disponibile</p>
        </CardContent>
      </Card>
    );
  }

  // Raggruppa spese per categoria
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.categoria);
    if (existing) {
      existing.value += expense.importo;
    } else {
      acc.push({
        name: expense.categoria,
        label: categoryLabels[expense.categoria] || expense.categoria,
        value: expense.importo
      });
    }
    return acc;
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{payload[0].payload.label}</p>
          <p className="text-blue-400 font-bold">
            €{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          {chartType === 'pie' ? <PieChartIcon className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
          Statistiche per Categoria
        </CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={chartType === 'pie' ? 'default' : 'outline'}
            onClick={() => setChartType('pie')}
            className="h-8"
          >
            <PieChartIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={chartType === 'bar' ? 'default' : 'outline'}
            onClick={() => setChartType('bar')}
            className="h-8"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : (
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
