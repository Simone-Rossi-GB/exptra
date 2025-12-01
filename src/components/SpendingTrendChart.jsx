import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { format, subDays, startOfDay, isWithinInterval, startOfHour } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarDatePicker } from "@/components/ui/date-picker";

const TIME_RANGES = [
  { id: 'day', label: 'Giorno', days: 1 },
  { id: 'week', label: 'Settimana', days: 7 },
  { id: 'month', label: 'Mese', days: 30 },
  { id: 'year', label: 'Anno', days: 365 },
];

export function SpendingTrendChart({ expenses }) {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const chartData = useMemo(() => {
    const range = TIME_RANGES.find(r => r.id === timeRange);
    const days = range?.days || 30;
    const now = new Date();

    // Special handling for single day view
    if (timeRange === 'day') {
      const targetDate = new Date(selectedDate);

      // Create 24 hour slots for the selected day
      const hourArray = Array.from({ length: 24 }, (_, i) => {
        const hourDate = new Date(targetDate);
        hourDate.setHours(i, 0, 0, 0);
        return hourDate;
      });

      const dataByHour = hourArray.map(hourDate => {
        const nextHour = new Date(hourDate);
        nextHour.setHours(hourDate.getHours() + 1);

        const hourExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= hourDate && expenseDate < nextHour;
        });

        const total = hourExpenses.reduce((sum, e) => sum + e.amount, 0);

        return {
          date: hourDate.toISOString(),
          dateLabel: format(hourDate, 'HH:mm', { locale: it }),
          amount: total,
        };
      });

      return dataByHour;
    }

    // Crea array di giorni
    const dateArray = Array.from({ length: days }, (_, i) => {
      const date = subDays(now, days - 1 - i);
      return startOfDay(date);
    });

    // Raggruppa spese per giorno
    const dataByDay = dateArray.map(date => {
      const dayExpenses = expenses.filter(expense => {
        const expenseDate = startOfDay(new Date(expense.date));
        return expenseDate.getTime() === date.getTime();
      });

      const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        date: date.toISOString(),
        dateLabel: format(date, timeRange === 'week' ? 'EEE' : 'dd MMM', { locale: it }),
        amount: total,
      };
    });

    // Calcola cumulative se anno, altrimenti giornaliero
    if (timeRange === 'year') {
      // Raggruppa per mese
      const monthlyData = [];
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - 11 + i + 1, 0);

        const monthExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
        });

        const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

        monthlyData.push({
          date: monthStart.toISOString(),
          dateLabel: format(monthStart, 'MMM', { locale: it }),
          amount: total,
        });
      }
      return monthlyData;
    }

    return dataByDay;
  }, [expenses, timeRange, selectedDate]);

  const stats = useMemo(() => {
    const total = chartData.reduce((sum, d) => sum + d.amount, 0);
    const avg = total / chartData.filter(d => d.amount > 0).length || 0;
    const max = Math.max(...chartData.map(d => d.amount));

    return { total, avg, max };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/95 backdrop-blur-xl border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-gray-400 mb-1">{payload[0].payload.dateLabel}</p>
          <p className="text-lg font-bold text-white">
            €{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="lg:col-span-2 select-none">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-primary" />
              Andamento Spese
            </CardTitle>
            <p className="text-sm text-gray-500">
              Totale: <span className="text-white font-semibold">€{stats.total.toFixed(2)}</span>
              {' • '}
              Media: <span className="text-white font-semibold">€{stats.avg.toFixed(2)}</span>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {TIME_RANGES.map((range) => (
              <Button
                key={range.id}
                size="sm"
                variant={timeRange === range.id ? 'default' : 'outline'}
                onClick={() => setTimeRange(range.id)}
                className="h-8 text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Date picker for day view */}
        {timeRange === 'day' && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <div className="w-64">
              <CalendarDatePicker
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Seleziona giorno"
              />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="w-full h-80 outline-none [&_svg]:outline-none [&_svg]:focus:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              style={{ outline: 'none' }}
            >
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="dateLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
                activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
