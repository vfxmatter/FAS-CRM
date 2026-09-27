import * as React from 'react';
import { useState } from 'react';
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
import { RentEntry } from '@/types';

interface RentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<RentEntry, 'id' | 'createdAt' | 'total' | 'split75' | 'split25'>) => void;
}

export function RentForm({ isOpen, onClose, onSubmit }: RentFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    rentAmt: '',
    electricityAmt: '',
    wifi: '',
    waterBottle: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date: formData.date,
      rentAmt: Number(formData.rentAmt),
      electricityAmt: Number(formData.electricityAmt),
      wifi: Number(formData.wifi),
      waterBottle: Number(formData.waterBottle)
    });
    setFormData({
      date: new Date().toISOString().split('T')[0],
      rentAmt: '',
      electricityAmt: '',
      wifi: '',
      waterBottle: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Rent & Utility Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input 
              id="date" 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentAmt">Rent Amount</Label>
              <Input 
                id="rentAmt" 
                type="number" 
                placeholder="0"
                value={formData.rentAmt}
                onChange={(e) => setFormData({ ...formData, rentAmt: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="electricityAmt">Electricity</Label>
              <Input 
                id="electricityAmt" 
                type="number" 
                placeholder="0"
                value={formData.electricityAmt}
                onChange={(e) => setFormData({ ...formData, electricityAmt: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wifi">Wifi</Label>
              <Input 
                id="wifi" 
                type="number" 
                placeholder="0"
                value={formData.wifi}
                onChange={(e) => setFormData({ ...formData, wifi: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waterBottle">Water Bottle</Label>
              <Input 
                id="waterBottle" 
                type="number" 
                placeholder="0"
                value={formData.waterBottle}
                onChange={(e) => setFormData({ ...formData, waterBottle: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl">
              Save Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
