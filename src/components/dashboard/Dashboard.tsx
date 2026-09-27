import { FileText, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";
import { DailyWork, Booking, Expense, RentEntry } from "@/types";

interface DashboardProps {
  dailyWork: DailyWork[];
  bookings: Booking[];
  expenses: Expense[];
  rentEntries: RentEntry[];
}

export function Dashboard({ dailyWork, bookings, expenses, rentEntries }: DashboardProps) {
  const totalRevenue = dailyWork.reduce((sum, entry) => sum + entry.price, 0);
  const totalProfit = dailyWork.reduce((sum, entry) => sum + entry.netProfit, 0);
  const totalExpenses = expenses.reduce((sum, entry) => sum + entry.cost, 0) + 
                        rentEntries.reduce((sum, entry) => sum + entry.total, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your business performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          description="From daily work entries"
        />
        <StatCard 
          title="Net Profit" 
          value={`₹${totalProfit.toLocaleString()}`} 
          icon={TrendingUp} 
          description="After product costs"
        />
        <StatCard 
          title="Total Bookings" 
          value={bookings.length} 
          icon={Calendar} 
          description="Upcoming events"
        />
        <StatCard 
          title="Total Expenses" 
          value={`₹${totalExpenses.toLocaleString()}`} 
          icon={FileText} 
          description="Including rent & utilities"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <div className="bg-card rounded-2xl p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Daily Work</h3>
          <div className="space-y-4">
            {dailyWork.slice(0, 5).map(entry => (
              <div key={entry.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{entry.itemName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
                <p className="font-semibold text-emerald-600">₹{entry.price.toLocaleString()}</p>
              </div>
            ))}
            {dailyWork.length === 0 && <p className="text-sm text-muted-foreground">No recent entries.</p>}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Upcoming Bookings</h3>
          <div className="space-y-4">
            {bookings.slice(0, 5).map(booking => (
              <div key={booking.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{booking.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(booking.events || [])[0]?.name || 'No Event'} • {(booking.events || [])[0] ? new Date((booking.events || [])[0].date).toLocaleDateString() : 'No Date'}
                  </p>
                </div>
                <p className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">Booked</p>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-sm text-muted-foreground">No upcoming bookings.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
