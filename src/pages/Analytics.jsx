import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import pb, { expensesService, categoriesService } from "../lib/pocketBase.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { SpendingTrendChart } from "../components/SpendingTrendChart.jsx";
import { CategoryBreakdownChart } from "../components/CategoryBreakdownChart.jsx";
import { PieChart, TrendingUp, Calendar } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function Analytics() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Analytics: Fetching data');
    const fetchData = async () => {
      try {
        const [fetchedExpenses, fetchedCategories] = await Promise.all([
          expensesService.getAll(),
          categoriesService.getAll()
        ]);

        // If no categories exist, create default ones
        if (fetchedCategories.length === 0) {
          console.log('Analytics: No categories found, creating default categories');
          try {
            const userID = pb.authStore.model?.id;
            if (userID) {
              await categoriesService.createDefaultCategories(userID);
              const newCategories = await categoriesService.getAll();
              console.log('Analytics: Created', newCategories.length, 'default categories');
              setCategories(newCategories);
            }
          } catch (catError) {
            console.error('Analytics: Error creating default categories', catError);
            setCategories(fetchedCategories);
          }
        } else {
          setCategories(fetchedCategories);
        }

        setExpenses(fetchedExpenses);
      } catch (error) {
        console.error('Analytics: Error', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonth = new Date().getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;

    const thisMonthExpenses = expenses.filter(e => new Date(e.date).getMonth() === thisMonth);
    const lastMonthExpenses = expenses.filter(e => new Date(e.date).getMonth() === lastMonth);

    const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const change = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
      : 0;

    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const topCategoryInfo = categories.find(c => c.id === topCategory?.[0]);

    return {
      total,
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      change,
      topCategory: topCategoryInfo || null,
      topCategoryAmount: topCategory?.[1] || 0,
    };
  }, [expenses, categories]);

  const categoryPieData = useMemo(() => {
    const categoryMap = new Map();
    expenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, existing + expense.amount);
    });

    return Array.from(categoryMap.entries()).map(([catId, amount]) => {
      const category = categories.find(c => c.id === catId);
      return {
        name: category?.name || 'Altro',
        value: amount,
        color: category?.color || '#6b7280',
      };
    }).sort((a, b) => b.value - a.value);
  }, [expenses, categories]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Caricamento analytics...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white/70 uppercase tracking-wider">
                  Spese Totali
                </span>
                <div className="p-2.5 rounded-xl bg-white/10 text-white group-hover:bg-white group-hover:text-primary transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                €{stats.total.toFixed(2)}
              </h3>
            </CardContent>
          </Card>

          <Card className="bg-surface/50 border-gray-800/50 hover:shadow-glow transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Questo Mese
                </span>
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                €{stats.thisMonth.toFixed(2)}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${
                  stats.change >= 0
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-green-500/10 text-green-400'
                }`}>
                  {stats.change >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 rotate-180" />
                  )}
                  <span>{stats.change >= 0 ? '+' : ''}{stats.change}%</span>
                </div>
                <span className="text-xs text-gray-500">vs mese scorso</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/50 border-gray-800/50 hover:shadow-glow transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Mese Scorso
                </span>
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                €{stats.lastMonth.toFixed(2)}
              </h3>
            </CardContent>
          </Card>

          <Card className="bg-surface/50 border-gray-800/50 hover:shadow-glow transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Categoria Top
                </span>
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <PieChart className="w-5 h-5" />
                </div>
              </div>
              {stats.topCategory && (
                <>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {stats.topCategory.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">€{stats.topCategoryAmount.toFixed(2)}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <SpendingTrendChart expenses={expenses} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdownChart expenses={expenses} categories={categories} />

          <Card className="select-none">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Distribuzione per Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              <div className="w-full h-80 outline-none [&_svg]:outline-none [&_svg]:focus:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie style={{ outline: 'none' }}>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={'cell-' + index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(26, 26, 36, 0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        padding: '12px'
                      }}
                      formatter={(value, name, props) => ['€' + value.toFixed(2), props.payload.name]}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>

              {/* Legend - Below chart */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                {categoryPieData.slice(0, 6).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-400 truncate">{item.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      €{item.value.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
