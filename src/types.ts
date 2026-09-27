export interface DailyWork {
  id: string;
  date: string;
  itemName: string;
  price: number;
  productCost: number;
  netProfit: number;
  split75: number;
  split25: number;
  createdAt: string;
}

export interface StaffEntry {
  name: string;
  equipment: string;
}

export interface EventEntry {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  staff: StaffEntry[];
}

export interface BookingExpense {
  item: string;
  amount: number;
}

export interface Booking {
  id: string;
  bookingDate: string;
  clientName: string;
  contact: string;
  email?: string;
  location: string;
  budgetQuoted: number;
  advancePayment: number;
  expenses: BookingExpense[];
  events: EventEntry[];
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  expenseName: string;
  cost: number;
  split75: number;
  split25: number;
  createdAt: string;
}

export interface RentEntry {
  id: string;
  date: string;
  rentAmt: number;
  electricityAmt: number;
  wifi: number;
  waterBottle: number;
  total: number;
  split75: number;
  split25: number;
  createdAt: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type EventStatus = 'Booked' | 'Shot' | 'Post-Production' | 'Delivered';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';
export type EventType = 'Wedding' | 'Corporate' | 'Portrait' | 'Event' | 'Other';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  date: string;
  location: string;
  type: EventType;
  status: EventStatus;
  price: number;
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  eventId: string;
  clientId: string;
  clientName: string;
  eventTitle: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
}
