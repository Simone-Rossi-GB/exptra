import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export function ExpenseForm({ onAddExpense }) {
  const [formData, setFormData] = useState({
    descrizione: "",
    importo: "",
    categoria: "groceries",
    data: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.descrizione || !formData.importo) {
      return;
    }

    onAddExpense({
      ...formData,
      importo: parseFloat(formData.importo),
      id: Date.now().toString()
    });

    setFormData({
      descrizione: "",
      importo: "",
      categoria: "groceries",
      data: new Date().toISOString().split('T')[0]
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Aggiungi Spesa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Descrizione
              </label>
              <Input
                name="descrizione"
                value={formData.descrizione}
                onChange={handleChange}
                placeholder="Es: Spesa al supermercato"
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Importo (€)
              </label>
              <Input
                type="number"
                name="importo"
                value={formData.importo}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Categoria
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="groceries">Spesa</option>
                <option value="food">Cibo</option>
                <option value="transport">Trasporti</option>
                <option value="home">Casa</option>
                <option value="entertainment">Intrattenimento</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Data
              </label>
              <Input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Spesa
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
