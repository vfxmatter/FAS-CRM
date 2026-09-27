import { useState, useMemo } from 'react';
import { DailyWork } from "@/types";
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
  TrendingUp, 
  PieChart, 
  Wallet,
  Undo2,
  AlertCircle,
  Filter
} from "lucide-react";
import { StatCard } from "../dashboard/StatCard";

interface DailyWorkListProps {
  entries: DailyWork[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<DailyWork>) => void;
  onUndo: () => void;
  canUndo: boolean;
}

type FilterMode = 'month' | 'season' | 'all';

export function DailyWorkList({ entries, onAdd, onDelete, onUpdate, onUndo, canUndo }: DailyWorkListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<DailyWork>>({});
  
  const [filterMode, setFilterMode] = useState<FilterMode>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedSeason, setSelectedSeason] = useState(() => {
    const now = new Date();
    return now.getMonth() >= 8 ? now.getFullYear().toString() : (now.getFullYear() - 1).toString();
  });
  const [searchQuery, setSearchQuery] = useState('');

  const startEditing = (entry: DailyWork) => {
    setEditingId(entry.id);
    setConfirmDeleteId(null);
    setEditData({
      date: entry.date,
      itemName: entry.itemName,
      price: entry.price,
      productCost: entry.productCost
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

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = entry.itemName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterMode === 'all') return true;

      const entryDate = new Date(entry.date);
      
      if (filterMode === 'month') {
        const entryMonth = entry.date.slice(0, 7);
        return entryMonth === selectedMonth;
      }

      if (filterMode === 'season') {
        const seasonStartYear = parseInt(selectedSeason);
        const entryYear = entryDate.getFullYear();
        const entryMonth = entryDate.getMonth(); // 0-11

        // Season starts Sept (8) of startYear and ends Aug (7) of startYear + 1
        if (entryMonth >= 8) {
          return entryYear === seasonStartYear;
        } else {
          return entryYear === seasonStartYear + 1;
        }
      }

      return true;
    });
  }, [entries, filterMode, selectedMonth, selectedSeason, searchQuery]);

  const stats = useMemo(() => {
    return filteredEntries.reduce((acc, entry) => {
      acc.totalNetProfit += entry.netProfit || 0;
      acc.totalSplit75 += entry.split75 || 0;
      acc.totalSplit25 += entry.split25 || 0;
      return acc;
    }, { totalNetProfit: 0, totalSplit75: 0, totalSplit25: 0 });
  }, [filteredEntries]);

  // Generate season options based on entries or just a few years
  const seasonOptions = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    years.add(currentYear - 1);
    
    entries.forEach(entry => {
      const d = new Date(entry.date);
      const s = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
      years.add(s);
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [entries]);

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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Daily Work</h2>
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            (Manage your daily based revenue and track profits.)
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
            <Plus className="w-4 h-4" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Minimalist Dashboard & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-2 px-5 rounded-xl border shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Net Profit</span>
            <span className="text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              ₹{stats.totalNetProfit.toLocaleString()}
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
              <TableHead>Item Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Product Cost</TableHead>
              <TableHead>Net Profit</TableHead>
              <TableHead>75% Split</TableHead>
              <TableHead>25% Split</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No entries found for the selected criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="group">
                  <TableCell className="text-sm">
                    {editingId === entry.id ? (
                      <Input 
                        type="date" 
                        value={editData.date} 
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        className="h-8 w-32 rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-[200px]">
                    {editingId === entry.id ? (
                      <Input 
                        value={editData.itemName} 
                        onChange={(e) => setEditData({ ...editData, itemName: e.target.value })}
                        maxLength={40}
                        className="h-8 min-w-[150px] rounded-lg"
                      />
                    ) : (
                      <div className="truncate" title={entry.itemName}>
                        {entry.itemName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {editingId === entry.id ? (
                      <Input 
                        type="number"
                        value={editData.price} 
                        onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                        className="h-8 w-24 rounded-lg"
                      />
                    ) : (
                      `₹${entry.price.toLocaleString()}`
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {editingId === entry.id ? (
                      <Input 
                        type="number"
                        value={editData.productCost} 
                        onChange={(e) => setEditData({ ...editData, productCost: Number(e.target.value) })}
                        className="h-8 w-24 rounded-lg"
                      />
                    ) : (
                      `₹${entry.productCost.toLocaleString()}`
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{entry.netProfit.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ₹{entry.split75?.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ₹{entry.split25?.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === entry.id ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => saveEditing(entry.id)}
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
                      ) : confirmDeleteId === entry.id ? (
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
                            onClick={() => handleDelete(entry.id)}
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
                            onClick={() => startEditing(entry)}
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setConfirmDeleteId(entry.id)}
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
