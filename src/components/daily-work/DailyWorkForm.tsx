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
import { DailyWork } from '@/types';

interface DailyWorkFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<DailyWork, 'id' | 'createdAt' | 'netProfit' | 'split75' | 'split25'>) => void;
}

export function DailyWorkForm({ isOpen, onClose, onSubmit }: DailyWorkFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    itemName: '',
    price: '',
    productCost: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date: formData.date,
      itemName: formData.itemName,
      price: Number(formData.price),
      productCost: Number(formData.productCost)
    });
    setFormData({
      date: new Date().toISOString().split('T')[0],
      itemName: '',
      price: '',
      productCost: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Daily Work Entry</DialogTitle>
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
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input 
              id="itemName" 
              placeholder="e.g. Wedding Shoot, Album Print"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              required
              maxLength={40}
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (Revenue)</Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productCost">Product Cost</Label>
              <Input 
                id="productCost" 
                type="number" 
                placeholder="0"
                value={formData.productCost}
                onChange={(e) => setFormData({ ...formData, productCost: e.target.value })}
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
