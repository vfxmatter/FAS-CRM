import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { DailyWorkList } from '@/components/daily-work/DailyWorkList';
import { BookingList } from '@/components/bookings/BookingList';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { RentList } from '@/components/rent/RentList';
import { DailyWorkForm } from '@/components/daily-work/DailyWorkForm';
import { BookingForm } from '@/components/bookings/BookingForm';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { RentForm } from '@/components/rent/RentForm';
import { DailyWork, Booking, Expense, RentEntry } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { auth, db, handleFirestoreError, OperationType } from '@/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [dailyWork, setDailyWork] = useState<DailyWork[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rentEntries, setRentEntries] = useState<RentEntry[]>([]);
  const [deletedDailyWorkStack, setDeletedDailyWorkStack] = useState<DailyWork[]>([]);
  const [deletedExpensesStack, setDeletedExpensesStack] = useState<Expense[]>([]);
  const [deletedRentStack, setDeletedRentStack] = useState<RentEntry[]>([]);
  const [deletedBookingsStack, setDeletedBookingsStack] = useState<Booking[]>([]);

  // Form States
  const [isDailyWorkFormOpen, setIsDailyWorkFormOpen] = useState(false);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isRentFormOpen, setIsRentFormOpen] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Connection Test
  useEffect(() => {
    if (user) {
      const testConnection = async () => {
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error) {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration.");
          }
        }
      };
      testConnection();
    }
  }, [user]);

  // Real-time Listeners
  useEffect(() => {
    if (!user || !isAuthReady) return;

    const userPath = `users/${user.uid}`;

    const unsubDailyWork = onSnapshot(
      query(collection(db, `${userPath}/dailyWork`), orderBy('date', 'desc')),
      (snapshot) => {
        setDailyWork(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DailyWork)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/dailyWork`)
    );

    const unsubBookings = onSnapshot(
      query(collection(db, `${userPath}/bookings`), orderBy('bookingDate', 'desc')),
      (snapshot) => {
        setBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/bookings`)
    );

    const unsubExpenses = onSnapshot(
      query(collection(db, `${userPath}/expenses`), orderBy('date', 'desc')),
      (snapshot) => {
        setExpenses(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/expenses`)
    );

    const unsubRent = onSnapshot(
      query(collection(db, `${userPath}/rent`), orderBy('date', 'desc')),
      (snapshot) => {
        setRentEntries(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RentEntry)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/rent`)
    );

    return () => {
      unsubDailyWork();
      unsubBookings();
      unsubExpenses();
      unsubRent();
    };
  }, [user, isAuthReady]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  const handleAddDailyWork = async (data: Omit<DailyWork, 'id' | 'createdAt' | 'netProfit' | 'split75' | 'split25'>) => {
    if (!user) return;
    const path = `users/${user.uid}/dailyWork`;
    const netProfit = data.price - data.productCost;
    const split75 = netProfit * 0.75;
    const split25 = netProfit * 0.25;
    try {
      await addDoc(collection(db, path), {
        ...data,
        netProfit,
        split75,
        split25,
        createdAt: new Date().toISOString()
      });
      toast.success('Daily work entry added');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleUpdateDailyWork = async (id: string, data: Partial<DailyWork>) => {
    if (!user) return;
    const path = `users/${user.uid}/dailyWork/${id}`;
    
    // Recalculate derived fields if price or cost changed
    const updatedData = { ...data };
    if ('price' in data || 'productCost' in data) {
      const price = 'price' in data ? data.price! : dailyWork.find(e => e.id === id)?.price || 0;
      const productCost = 'productCost' in data ? data.productCost! : dailyWork.find(e => e.id === id)?.productCost || 0;
      const netProfit = price - productCost;
      updatedData.netProfit = netProfit;
      updatedData.split75 = netProfit * 0.75;
      updatedData.split25 = netProfit * 0.25;
    }

    try {
      await updateDoc(doc(db, path), updatedData);
      toast.success('Entry updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleAddBooking = async (data: Omit<Booking, 'id' | 'createdAt'>) => {
    if (!user) return;
    const path = `users/${user.uid}/bookings`;
    try {
      if (editingBooking) {
        await updateDoc(doc(db, `${path}/${editingBooking.id}`), data);
        toast.success('Booking updated successfully');
      } else {
        await addDoc(collection(db, path), {
          ...data,
          createdAt: new Date().toISOString()
        });
        toast.success('Booking added successfully');
      }
      setEditingBooking(null);
    } catch (err) {
      handleFirestoreError(err, editingBooking ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleAddExpense = async (data: Omit<Expense, 'id' | 'createdAt' | 'split75' | 'split25'>) => {
    if (!user) return;
    const path = `users/${user.uid}/expenses`;
    const split75 = data.cost * 0.75;
    const split25 = data.cost * 0.25;
    try {
      await addDoc(collection(db, path), {
        ...data,
        split75,
        split25,
        createdAt: new Date().toISOString()
      });
      toast.success('Expense added successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleAddRent = async (data: Omit<RentEntry, 'id' | 'createdAt' | 'total' | 'split75' | 'split25'>) => {
    if (!user) return;
    const path = `users/${user.uid}/rent`;
    const total = data.rentAmt + data.electricityAmt + data.wifi + data.waterBottle;
    const split75 = total * 0.75;
    const split25 = total * 0.25;
    try {
      await addDoc(collection(db, path), {
        ...data,
        total,
        split75,
        split25,
        createdAt: new Date().toISOString()
      });
      toast.success('Rent entry added successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleDeleteDailyWork = async (id: string) => {
    if (!user) return;
    const entryToDelete = dailyWork.find(e => e.id === id);
    if (entryToDelete) {
      setDeletedDailyWorkStack(prev => [entryToDelete, ...prev].slice(0, 100));
    }
    const path = `users/${user.uid}/dailyWork/${id}`;
    try {
      await deleteDoc(doc(db, path));
      toast.info('Entry deleted', {
        action: {
          label: 'Undo',
          onClick: () => handleUndoDailyWork()
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleUndoDailyWork = async () => {
    if (!user || deletedDailyWorkStack.length === 0) return;
    const lastDeleted = deletedDailyWorkStack[0];
    const path = `users/${user.uid}/dailyWork`;
    const { id, ...data } = lastDeleted;
    try {
      await addDoc(collection(db, path), data);
      setDeletedDailyWorkStack(prev => prev.slice(1));
      toast.success('Entry restored');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleUpdateExpense = async (id: string, data: Partial<Expense>) => {
    if (!user) return;
    const path = `users/${user.uid}/expenses/${id}`;
    
    const updatedData = { ...data };
    if ('cost' in data) {
      const cost = data.cost!;
      updatedData.split75 = cost * 0.75;
      updatedData.split25 = cost * 0.25;
    }

    try {
      await updateDoc(doc(db, path), updatedData);
      toast.success('Expense updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) return;
    const entryToDelete = expenses.find(e => e.id === id);
    if (entryToDelete) {
      setDeletedExpensesStack(prev => [entryToDelete, ...prev].slice(0, 100));
    }
    const path = `users/${user.uid}/expenses/${id}`;
    try {
      await deleteDoc(doc(db, path));
      toast.info('Expense deleted', {
        action: {
          label: 'Undo',
          onClick: () => handleUndoExpense()
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleUndoExpense = async () => {
    if (!user || deletedExpensesStack.length === 0) return;
    const lastDeleted = deletedExpensesStack[0];
    const path = `users/${user.uid}/expenses`;
    const { id, ...data } = lastDeleted;
    try {
      await addDoc(collection(db, path), data);
      setDeletedExpensesStack(prev => prev.slice(1));
      toast.success('Expense restored');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleUpdateRent = async (id: string, data: Partial<RentEntry>) => {
    if (!user) return;
    const path = `users/${user.uid}/rent/${id}`;
    
    const updatedData = { ...data };
    if ('rentAmt' in data || 'electricityAmt' in data || 'wifi' in data || 'waterBottle' in data) {
      const entry = rentEntries.find(e => e.id === id);
      const rentAmt = 'rentAmt' in data ? data.rentAmt! : entry?.rentAmt || 0;
      const electricityAmt = 'electricityAmt' in data ? data.electricityAmt! : entry?.electricityAmt || 0;
      const wifi = 'wifi' in data ? data.wifi! : entry?.wifi || 0;
      const waterBottle = 'waterBottle' in data ? data.waterBottle! : entry?.waterBottle || 0;
      
      const total = rentAmt + electricityAmt + wifi + waterBottle;
      updatedData.total = total;
      updatedData.split75 = total * 0.75;
      updatedData.split25 = total * 0.25;
    }

    try {
      await updateDoc(doc(db, path), updatedData);
      toast.success('Rent entry updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleDeleteRent = async (id: string) => {
    if (!user) return;
    const entryToDelete = rentEntries.find(e => e.id === id);
    if (entryToDelete) {
      setDeletedRentStack(prev => [entryToDelete, ...prev].slice(0, 100));
    }
    const path = `users/${user.uid}/rent/${id}`;
    try {
      await deleteDoc(doc(db, path));
      toast.info('Rent entry deleted', {
        action: {
          label: 'Undo',
          onClick: () => handleUndoRent()
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleUndoRent = async () => {
    if (!user || deletedRentStack.length === 0) return;
    const lastDeleted = deletedRentStack[0];
    const path = `users/${user.uid}/rent`;
    const { id, ...data } = lastDeleted;
    try {
      await addDoc(collection(db, path), data);
      setDeletedRentStack(prev => prev.slice(1));
      toast.success('Rent entry restored');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (activeTab === 'daily-work' && deletedDailyWorkStack.length > 0) {
          e.preventDefault();
          handleUndoDailyWork();
        } else if (activeTab === 'expenses' && deletedExpensesStack.length > 0) {
          e.preventDefault();
          handleUndoExpense();
        } else if (activeTab === 'rent' && deletedRentStack.length > 0) {
          e.preventDefault();
          handleUndoRent();
        } else if (activeTab === 'bookings' && deletedBookingsStack.length > 0) {
          e.preventDefault();
          handleUndoBooking();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, deletedDailyWorkStack, deletedExpensesStack, deletedRentStack, deletedBookingsStack, user]);

  const handleUpdateBooking = async (id: string, data: Partial<Booking>) => {
    if (!user) return;
    const path = `users/${user.uid}/bookings/${id}`;
    try {
      await updateDoc(doc(db, path), data);
      toast.success('Booking updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!user) return;
    const entryToDelete = bookings.find(e => e.id === id);
    if (entryToDelete) {
      setDeletedBookingsStack(prev => [entryToDelete, ...prev].slice(0, 100));
    }
    const path = `users/${user.uid}/bookings/${id}`;
    try {
      await deleteDoc(doc(db, path));
      toast.info('Booking deleted', {
        action: {
          label: 'Undo',
          onClick: () => handleUndoBooking()
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleUndoBooking = async () => {
    if (!user || deletedBookingsStack.length === 0) return;
    const lastDeleted = deletedBookingsStack[0];
    const path = `users/${user.uid}/bookings`;
    const { id, ...data } = lastDeleted;
    try {
      await addDoc(collection(db, path), data);
      setDeletedBookingsStack(prev => prev.slice(1));
      toast.success('Booking restored');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard dailyWork={dailyWork} bookings={bookings} expenses={expenses} rentEntries={rentEntries} />;
      case 'daily-work':
        return (
          <DailyWorkList 
            entries={dailyWork} 
            onAdd={() => setIsDailyWorkFormOpen(true)} 
            onDelete={handleDeleteDailyWork}
            onUpdate={handleUpdateDailyWork}
            onUndo={handleUndoDailyWork}
            canUndo={deletedDailyWorkStack.length > 0}
          />
        );
      case 'bookings':
        return (
          <BookingList 
            bookings={bookings} 
            onAdd={() => {
              setEditingBooking(null);
              setIsBookingFormOpen(true);
            }} 
            onEdit={(booking) => {
              setEditingBooking(booking);
              setIsBookingFormOpen(true);
            }}
            onDelete={handleDeleteBooking}
            onUpdate={handleUpdateBooking}
            onUndo={handleUndoBooking}
            canUndo={deletedBookingsStack.length > 0}
          />
        );
      case 'expenses':
        return (
          <ExpenseList 
            expenses={expenses} 
            onAdd={() => setIsExpenseFormOpen(true)} 
            onDelete={handleDeleteExpense}
            onUpdate={handleUpdateExpense}
            onUndo={handleUndoExpense}
            canUndo={deletedExpensesStack.length > 0}
          />
        );
      case 'rent':
        return (
          <RentList 
            entries={rentEntries} 
            onAdd={() => setIsRentFormOpen(true)} 
            onDelete={handleDeleteRent}
            onUpdate={handleUpdateRent}
            onUndo={handleUndoRent}
            canUndo={deletedRentStack.length > 0}
          />
        );
      default:
        return <Dashboard dailyWork={dailyWork} bookings={bookings} expenses={expenses} rentEntries={rentEntries} />;
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
              <div className="w-8 h-8 bg-primary-foreground rounded-md rotate-45" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">FeebleCRM</h1>
            <p className="text-muted-foreground">The minimalist CRM for event professionals.</p>
          </div>
          <Button onClick={handleLogin} size="lg" className="w-full rounded-2xl gap-3 h-14 text-lg">
            <LogIn className="w-6 h-6" />
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* Forms */}
      <DailyWorkForm 
        isOpen={isDailyWorkFormOpen} 
        onClose={() => setIsDailyWorkFormOpen(false)} 
        onSubmit={handleAddDailyWork} 
      />
      <BookingForm 
        isOpen={isBookingFormOpen} 
        onClose={() => {
          setIsBookingFormOpen(false);
          setEditingBooking(null);
        }} 
        onSubmit={handleAddBooking} 
        booking={editingBooking}
      />
      <ExpenseForm 
        isOpen={isExpenseFormOpen} 
        onClose={() => setIsExpenseFormOpen(false)} 
        onSubmit={handleAddExpense} 
      />
      <RentForm 
        isOpen={isRentFormOpen} 
        onClose={() => setIsRentFormOpen(false)} 
        onSubmit={handleAddRent} 
      />

      <Toaster position="bottom-right" richColors />
    </div>
  );
}



