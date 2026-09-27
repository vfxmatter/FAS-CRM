import { useState, useMemo } from 'react';
import { Booking, EventEntry, BookingExpense } from "@/types";
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
  User, 
  Phone, 
  Camera,
  Check,
  X,
  Search,
  Undo2,
  CalendarDays,
  MapPin,
  Mail,
  Clock,
  Eye,
  Pencil,
  IndianRupee,
  Receipt,
  ArrowUpRight,
  Wallet,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingListProps {
  bookings: Booking[];
  onAdd: () => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Booking>) => void;
  onUndo: () => void;
  canUndo: boolean;
}

type FilterMode = 'month' | 'season' | 'all';

export function BookingList({ bookings, onAdd, onEdit, onDelete, onUpdate, onUndo, canUndo }: BookingListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  
  const [filterMode, setFilterMode] = useState<FilterMode>('month');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedSeason, setSelectedSeason] = useState(() => {
    const now = new Date();
    return now.getMonth() >= 8 ? now.getFullYear().toString() : (now.getFullYear() - 1).toString();
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (id: string) => {
    onDelete(id);
    setConfirmDeleteId(null);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (booking.events || []).some(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      if (filterMode === 'all') return true;

      const bookingDate = new Date(booking.bookingDate);
      
      if (filterMode === 'month') {
        const [year, month] = selectedMonth.split('-').map(Number);
        return bookingDate.getFullYear() === year && (bookingDate.getMonth() + 1) === month;
      }

      if (filterMode === 'season') {
        const seasonStartYear = parseInt(selectedSeason);
        const entryYear = bookingDate.getFullYear();
        const entryMonth = bookingDate.getMonth();

        if (entryMonth >= 8) {
          return entryYear === seasonStartYear;
        } else {
          return entryYear === seasonStartYear + 1;
        }
      }

      return true;
    });
  }, [bookings, filterMode, selectedMonth, selectedSeason, searchQuery]);

  const stats = useMemo(() => {
    const totalBudget = filteredBookings.reduce((sum, b) => sum + (b.budgetQuoted || 0), 0);
    const totalReceived = filteredBookings.reduce((sum, b) => sum + (b.advancePayment || 0), 0);
    const totalRemaining = totalBudget - totalReceived;

    return {
      total: filteredBookings.length,
      totalBudget,
      totalReceived,
      totalRemaining,
      upcoming: filteredBookings.filter(b => (b.events || []).some(e => new Date(e.date) >= new Date())).length
    };
  }, [filteredBookings]);

  const seasonOptions = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    years.add(currentYear - 1);
    
    bookings.forEach(b => {
      const d = new Date(b.bookingDate);
      const s = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
      years.add(s);
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [bookings]);

  const getFilterDescription = () => {
    if (filterMode === 'all') return "Since Inception";
    if (filterMode === 'month') {
      const [year, month] = selectedMonth.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    }
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">New Bookings</h2>
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            (Manage your upcoming event bookings and equipment.)
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
            <Plus className="w-4 h-4" /> Add Booking
          </Button>
        </div>
      </div>

      {/* Minimalist Dashboard & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-2 px-5 rounded-xl border shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Total Budget</span>
            <span className="text-lg font-black tracking-tight text-blue-600 dark:text-blue-400">
              ₹{stats.totalBudget.toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Received</span>
            <span className="text-base font-bold text-emerald-600">
              ₹{stats.totalReceived.toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Remaining</span>
            <span className="text-base font-bold text-rose-600">
              ₹{stats.totalRemaining.toLocaleString()}
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
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input 
              placeholder="Search client..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-40 pl-8 text-[10px] rounded-lg bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
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
              <Input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-7 w-28 border-none bg-background text-[10px] focus-visible:ring-0 rounded-md"
              />
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

      {/* Horizontal Card List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="py-12 text-center bg-card rounded-2xl border border-dashed">
            <p className="text-muted-foreground">No bookings found for the selected criteria.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="group overflow-hidden rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left Section: Client & Basic Info */}
                  <div className="flex-1 p-5 border-b md:border-b-0 md:border-r bg-muted/10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-foreground truncate max-w-[200px]" title={booking.clientName}>
                            {booking.clientName}
                          </h3>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider">
                          {(booking.events || []).length} {(booking.events || []).length === 1 ? 'Event' : 'Events'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarIcon className="w-3 h-3" />
                        Booked: {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setViewBooking(booking)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEdit(booking)}
                        className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit Booking"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                        {confirmDeleteId === booking.id ? (
                          <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setConfirmDeleteId(null)}
                              className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(booking.id)}
                              className="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setConfirmDeleteId(booking.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-primary" />
                        <span className="truncate">{booking.contact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                        <span className="truncate">{booking.location}</span>
                      </div>
                      {booking.email && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground col-span-2">
                          <Mail className="w-3.5 h-3.5 shrink-0 text-primary" />
                          <span className="truncate">{booking.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Section: Financial Summary */}
                  <div className="w-full md:w-64 p-5 border-b md:border-b-0 md:border-r flex flex-col justify-center bg-background">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                          <Wallet className="w-3 h-3" /> Total Budget
                        </span>
                        <span className="text-sm font-bold text-foreground">₹{(booking.budgetQuoted || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                          <CreditCard className="w-3 h-3" /> Received
                        </span>
                        <span className="text-sm font-bold text-emerald-600">₹{(booking.advancePayment || 0).toLocaleString()}</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Remaining
                        </span>
                        <span className="text-sm font-black text-rose-600">
                          ₹{((booking.budgetQuoted || 0) - (booking.advancePayment || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Next Event Preview */}
                  <div className="flex-1 p-5 flex flex-col justify-center bg-muted/5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-primary">Next Event</span>
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-medium">
                          {(booking.events || [])[0] ? new Date(booking.events[0].date).toLocaleDateString() : 'N/A'}
                        </Badge>
                      </div>
                      <div className="font-bold text-sm text-foreground truncate">
                        {(booking.events || [])[0]?.name || 'No events scheduled'}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(booking.events || [])[0]?.startTime || '--'} - {(booking.events || [])[0]?.endTime || '--'}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {((booking.events || [])[0]?.staff || []).length} Staff
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Details Modal */}
      <Dialog open={!!viewBooking} onOpenChange={(open) => !open && setViewBooking(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" /> Booking Details
            </DialogTitle>
          </DialogHeader>
          
          {viewBooking && (
            <div className="space-y-6 py-4">
              {/* Client Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-2xl border">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Client Name</p>
                  <p className="font-bold text-foreground">{viewBooking.clientName}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Booking Date</p>
                  <p className="font-medium text-foreground">{new Date(viewBooking.bookingDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Contact</p>
                  <p className="text-sm text-foreground">{viewBooking.contact}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Location</p>
                  <p className="text-sm text-foreground">{viewBooking.location}</p>
                </div>
              </div>

              {/* Financials & Expenses */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Financials & Expenses
                </h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
                    <p className="text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">Budget</p>
                    <p className="text-sm font-bold">₹{(viewBooking.budgetQuoted || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    <p className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Received</p>
                    <p className="text-sm font-bold">₹{(viewBooking.advancePayment || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900">
                    <p className="text-[9px] font-bold uppercase text-rose-600 dark:text-rose-400">Remaining</p>
                    <p className="text-sm font-bold">₹{((viewBooking.budgetQuoted || 0) - (viewBooking.advancePayment || 0)).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground px-1">Expense Breakdown</p>
                  <div className="bg-card rounded-xl border overflow-hidden">
                    {(viewBooking.expenses || []).length > 0 ? (
                      <div className="divide-y">
                        {(viewBooking.expenses || []).map((exp, i) => (
                          <div key={i} className="flex items-center justify-between p-3 text-sm">
                            <span className="text-foreground font-medium">{exp.item}</span>
                            <span className="font-bold text-rose-600">₹{(exp.amount || 0).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between p-3 bg-muted/30 font-bold">
                          <span>Total Estimated Expenses</span>
                          <span className="text-rose-600">
                            ₹{(viewBooking.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="p-4 text-center text-xs text-muted-foreground">No expenses recorded for this booking.</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Event Timeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Event Timeline
                </h4>
                <div className="space-y-4">
                  {(viewBooking.events || []).map((event, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-primary/20 pb-4 last:pb-0">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-foreground">{event.name}</h5>
                          <Badge variant="secondary" className="text-[10px]">
                            {new Date(event.date).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {event.startTime} - {event.endTime}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {(event.staff || []).map((s, si) => (
                            <div key={si} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-[10px]">
                              <span className="font-medium flex items-center gap-1">
                                <User className="w-3 h-3 text-primary" /> {s.name}
                              </span>
                              <span className="text-muted-foreground italic flex items-center gap-1">
                                <Camera className="w-3 h-3" /> {s.equipment}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
