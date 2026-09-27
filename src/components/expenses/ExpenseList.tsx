import { useState, useMemo } from 'react';
import { Expense } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Check, 
  X, 
  Edit2, 
  Search, 
  Receipt,
  Undo2,
  Filter
} from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Expense>) => void;
  onUndo: () => void;
  canUndo: boolean;
}

type FilterMode = 'month' | 'season' | 'all';

export function ExpenseList({ expenses, onAdd, onDelete, onUpdate, onUndo, canUndo }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Expense>>({});
  
  const [filterMode, setFilterMode] = useState<FilterMode>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedSeason, setSelectedSeason] = useState(() => {
    const now = new Date();
    return now.getMonth() >= 8 ? now.getFullYear().toString() : (now.getFullYear() - 1).toString();
  });
  const [searchQuery, setSearchQuery] = useState('');

  const startEditing = (expense: Expense) => {
    setEditingId(expense.id);
    setConfirmDeleteId(null);
    setEditData({
      date: expense.date,
      expenseName: expense.expenseName,
      cost: expense.cost
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEditing = (id: string) => {
    onUpdate(id, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setConfirmDeleteId(null);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.expenseName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterMode === 'all') return true;

      const entryDate = new Date(expense.date);
      
      if (filterMode === 'month') {
        const entryMonth = expense.date.slice(0, 7);
        return entryMonth === selectedMonth;
      }

      if (filterMode === 'season') {
        const seasonStartYear = parseInt(selectedSeason);
        const entryYear = entryDate.getFullYear();
        const entryMonth = entryDate.getMonth();

        if (entryMonth >= 8) {
          return entryYear === seasonStartYear;
        } else {
          return entryYear === seasonStartYear + 1;
        }
      }

      return true;
    });
  }, [expenses, filterMode, selectedMonth, selectedSeason, searchQuery]);

  const stats = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      acc.totalCost += expense.cost || 0;
      acc.totalSplit75 += expense.split75 || 0;
      acc.totalSplit25 += expense.split25 || 0;
      return acc;
    }, { totalCost: 0, totalSplit75: 0, totalSplit25: 0 });
  }, [filteredExpenses]);

  const seasonOptions = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    years.add(currentYear - 1);
    
    expenses.forEach(expense => {
      const d = new Date(expense.date);
      const s = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
      years.add(s);
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [expenses]);

  const getFilterDescription = () => {
    if (filterMode === 'all') return "Since Inception";
    if (filterMode === 'month') return `For ${new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    if (filterMode === 'season') {
      const year = parseInt(selectedSeason);
      return `Season ${year}-${(year + 1).toString().slice(-2)}`;
    }
    return "";
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Expenses</h2>
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            (Track your business expenses and calculated splits.)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canUndo && (
            <Button 
              onClick={onUndo} 
              variant="outline" 
              size="icon" 
              className="rounded-xl h-9 w-9 bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
              title="Undo last delete (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
          )}
          <Button onClick={onAdd} size="sm" className="rounded-xl gap-2 h-9">
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Minimalist Dashboard & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-2 px-5 rounded-xl border shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Total Expenses</span>
            <span className="text-lg font-black tracking-tight text-rose-600 dark:text-rose-400">
              ₹{stats.totalCost.toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">75% Split</span>
            <span className="text-base font-bold text-foreground">
              ₹{stats.totalSplit75.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">25% Split</span>
            <span className="text-base font-bold text-foreground">
              ₹{stats.totalSplit25.toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-px bg-border hidden lg:block" />
          <div className="hidden lg:flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Filter</span>
            <span className="text-[10px] font-medium text-muted-foreground italic">
              {getFilterDescription()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 w-28 rounded-lg bg-muted/50 border-none text-[10px] focus-visible:ring-1"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
              <SelectTrigger className="h-7 w-24 border-none bg-transparent text-[10px] focus:ring-0">
                <SelectValue placeholder="Filter Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month" className="text-xs">Month-wise</SelectItem>
                <SelectItem value="season" className="text-xs">Season-wise</SelectItem>
                <SelectItem value="all" className="text-xs">Inception</SelectItem>
              </SelectContent>
            </Select>

            {filterMode === 'month' && (
              <div className="relative">
                <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                <Input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-7 pl-7 w-28 rounded-md bg-background border-none text-[10px] focus-visible:ring-1 cursor-pointer"
                />
              </div>
            )}

            {filterMode === 'season' && (
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="h-7 w-24 border-none bg-background text-[10px] focus:ring-0 rounded-md">
                  <SelectValue placeholder="Select Season" />
                </SelectTrigger>
                <SelectContent>
                  {seasonOptions.map(year => (
                    <SelectItem key={year} value={year.toString()} className="text-xs">
                      {year}-{ (year + 1).toString().slice(-2) }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Expense Name</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>75% Split</TableHead>
              <TableHead>25% Split</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No expenses found for the selected criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id} className="group">
                  <TableCell className="text-sm">
                    {editingId === expense.id ? (
                      <Input 
                        type="date" 
                        value={editData.date} 
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        className="h-8 w-32 rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-[200px]">
                    {editingId === expense.id ? (
                      <Input 
                        value={editData.expenseName} 
                        onChange={(e) => setEditData({ ...editData, expenseName: e.target.value })}
                        maxLength={40}
                        className="h-8 min-w-[150px] rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center gap-2 truncate" title={expense.expenseName}>
                        <Receipt className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{expense.expenseName}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {editingId === expense.id ? (
                      <Input 
                        type="number"
                        value={editData.cost} 
                        onChange={(e) => setEditData({ ...editData, cost: Number(e.target.value) })}
                        className="h-8 w-24 rounded-lg"
                      />
                    ) : (
                      `₹${expense.cost.toLocaleString()}`
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ₹{expense.split75.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ₹{expense.split25.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === expense.id ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => saveEditing(expense.id)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={cancelEditing}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : confirmDeleteId === expense.id ? (
                        <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
                          <span className="text-[10px] font-bold text-rose-600 uppercase mr-1">Delete?</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(expense.id)}
                            className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => startEditing(expense)}
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setConfirmDeleteId(expense.id)}
                            className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
