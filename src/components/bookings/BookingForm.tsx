import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Booking, EventEntry, StaffEntry, BookingExpense } from '@/types';
import { Plus, Trash2, User, Camera, Clock, MapPin, Mail, Phone, Calendar, IndianRupee, Receipt, Pencil } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Booking, 'id' | 'createdAt'>) => void;
  booking?: Booking | null;
}

const initialStaff: StaffEntry = { name: '', equipment: '' };
const initialEvent: EventEntry = { 
  name: '', 
  date: new Date().toISOString().split('T')[0], 
  startTime: '10:00', 
  endTime: '18:00', 
  staff: [{ ...initialStaff }] 
};
const initialExpense: BookingExpense = { item: '', amount: 0 };

export function BookingForm({ isOpen, onClose, onSubmit, booking }: BookingFormProps) {
  const [formData, setFormData] = useState({
    bookingDate: new Date().toISOString().split('T')[0],
    clientName: '',
    contact: '',
    email: '',
    location: '',
    budgetQuoted: 0,
    advancePayment: 0,
    expenses: [{ ...initialExpense }],
    events: [{ ...initialEvent }]
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        bookingDate: booking.bookingDate,
        clientName: booking.clientName,
        contact: booking.contact,
        email: booking.email || '',
        location: booking.location,
        budgetQuoted: booking.budgetQuoted,
        advancePayment: booking.advancePayment,
        expenses: (booking.expenses || []).length > 0 ? booking.expenses : [{ ...initialExpense }],
        events: (booking.events || []).length > 0 ? booking.events : [{ ...initialEvent, staff: [{ ...initialStaff }] }]
      });
    } else {
      setFormData({
        bookingDate: new Date().toISOString().split('T')[0],
        clientName: '',
        contact: '',
        email: '',
        location: '',
        budgetQuoted: 0,
        advancePayment: 0,
        expenses: [{ ...initialExpense }],
        events: [{ ...initialEvent, staff: [{ ...initialStaff }] }]
      });
    }
  }, [booking, isOpen]);

  const addEvent = () => {
    setFormData(prev => ({
      ...prev,
      events: [...prev.events, { ...initialEvent, staff: [{ ...initialStaff }] }]
    }));
  };

  const removeEvent = (index: number) => {
    if (formData.events.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index)
    }));
  };

  const addStaff = (eventIndex: number) => {
    const newEvents = [...formData.events];
    newEvents[eventIndex].staff.push({ ...initialStaff });
    setFormData(prev => ({ ...prev, events: newEvents }));
  };

  const removeStaff = (eventIndex: number, staffIndex: number) => {
    const newEvents = [...formData.events];
    if (newEvents[eventIndex].staff.length <= 1) return;
    newEvents[eventIndex].staff = newEvents[eventIndex].staff.filter((_, i) => i !== staffIndex);
    setFormData(prev => ({ ...prev, events: newEvents }));
  };

  const addExpense = () => {
    setFormData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { ...initialExpense }]
    }));
  };

  const removeExpense = (index: number) => {
    if (formData.expenses.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index)
    }));
  };

  const handleEventChange = (index: number, field: keyof EventEntry, value: any) => {
    const newEvents = [...formData.events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setFormData(prev => ({ ...prev, events: newEvents }));
  };

  const handleStaffChange = (eventIndex: number, staffIndex: number, field: keyof StaffEntry, value: string) => {
    const newEvents = [...formData.events];
    newEvents[eventIndex].staff[staffIndex] = { ...newEvents[eventIndex].staff[staffIndex], [field]: value };
    setFormData(prev => ({ ...prev, events: newEvents }));
  };

  const handleExpenseChange = (index: number, field: keyof BookingExpense, value: string | number) => {
    const newExpenses = [...formData.expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setFormData(prev => ({ ...prev, expenses: newExpenses }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData
    });
    setFormData({
      bookingDate: new Date().toISOString().split('T')[0],
      clientName: '',
      contact: '',
      email: '',
      location: '',
      budgetQuoted: 0,
      advancePayment: 0,
      expenses: [{ ...initialExpense }],
      events: [{ ...initialEvent, staff: [{ ...initialStaff }] }]
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {booking ? <Pencil className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
            {booking ? 'Edit Booking' : 'New Booking'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Client Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <User className="w-4 h-4" /> Client Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingDate">Booking Date</Label>
                <Input 
                  id="bookingDate" 
                  type="date" 
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input 
                  id="clientName" 
                  placeholder="Full Name"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  required
                  maxLength={40}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input 
                  id="contact" 
                  placeholder="Phone"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="location" 
                  placeholder="Event Venue / Address"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="rounded-xl pl-10"
                />
              </div>
            </div>

            {/* Financials */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="budgetQuoted">Budget Quoted (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="budgetQuoted" 
                    type="number"
                    placeholder="Total Amount"
                    value={formData.budgetQuoted || ''}
                    onChange={(e) => setFormData({ ...formData, budgetQuoted: Number(e.target.value) })}
                    required
                    className="rounded-xl pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="advancePayment">Advance Payment (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="advancePayment" 
                    type="number"
                    placeholder="Received Amount"
                    value={formData.advancePayment || ''}
                    onChange={(e) => setFormData({ ...formData, advancePayment: Number(e.target.value) })}
                    required
                    className="rounded-xl pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Expenses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Receipt className="w-4 h-4" /> Booking Expenses
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addExpense} className="rounded-xl h-8 text-xs gap-1">
                <Plus className="w-3 h-3" /> Add Expense
              </Button>
            </div>
            <div className="space-y-3">
              {formData.expenses.map((expense, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <div className="flex-1">
                    <Input 
                      placeholder="Expense Item (e.g. Album, Travel)"
                      value={expense.item}
                      onChange={(e) => handleExpenseChange(idx, 'item', e.target.value)}
                      required
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                  <div className="w-32 relative">
                    <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input 
                      type="number"
                      placeholder="Amount"
                      value={expense.amount || ''}
                      onChange={(e) => handleExpenseChange(idx, 'amount', Number(e.target.value))}
                      required
                      className="rounded-xl h-9 pl-8 text-sm"
                    />
                  </div>
                  {formData.expenses.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeExpense(idx)}
                      className="h-9 w-9 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Event Details */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Event Details
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addEvent} className="rounded-xl h-8 text-xs gap-1">
                <Plus className="w-3 h-3" /> Add Event
              </Button>
            </div>

            {formData.events.map((event, eventIndex) => (
              <div key={eventIndex} className="p-4 bg-muted/30 rounded-2xl border space-y-4 relative group">
                {formData.events.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeEvent(eventIndex)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm text-rose-500 hover:text-rose-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Event Name</Label>
                    <Input 
                      placeholder="e.g. Wedding, Reception"
                      value={event.name}
                      onChange={(e) => handleEventChange(eventIndex, 'name', e.target.value)}
                      required
                      maxLength={40}
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Event Date</Label>
                    <Input 
                      type="date"
                      value={event.date}
                      onChange={(e) => handleEventChange(eventIndex, 'date', e.target.value)}
                      required
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Start Time</Label>
                    <Input 
                      type="time"
                      value={event.startTime}
                      onChange={(e) => handleEventChange(eventIndex, 'startTime', e.target.value)}
                      required
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">End Time</Label>
                    <Input 
                      type="time"
                      value={event.endTime}
                      onChange={(e) => handleEventChange(eventIndex, 'endTime', e.target.value)}
                      required
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Staff Details */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Staff & Equipment</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => addStaff(eventIndex)} className="h-6 text-[10px] gap-1 hover:bg-primary/10 hover:text-primary">
                      <Plus className="w-3 h-3" /> Add Photo/Vid Guy
                    </Button>
                  </div>
                  
                  {event.staff.map((staff, staffIndex) => (
                    <div key={staffIndex} className="flex items-center gap-2 group/staff">
                      <div className="relative flex-1">
                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input 
                          placeholder="Staff Name"
                          value={staff.name}
                          onChange={(e) => handleStaffChange(eventIndex, staffIndex, 'name', e.target.value)}
                          required
                          className="rounded-xl h-8 pl-8 text-xs"
                        />
                      </div>
                      <div className="relative flex-1">
                        <Camera className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input 
                          placeholder="Equipment"
                          value={staff.equipment}
                          onChange={(e) => handleStaffChange(eventIndex, staffIndex, 'equipment', e.target.value)}
                          required
                          className="rounded-xl h-8 pl-8 text-xs"
                        />
                      </div>
                      {event.staff.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeStaff(eventIndex, staffIndex)}
                          className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl">
              {booking ? 'Update Booking' : 'Save Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
