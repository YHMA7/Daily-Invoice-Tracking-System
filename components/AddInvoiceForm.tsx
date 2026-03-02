import { useState } from 'react';
import { Supplier, Invoice } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PlusCircle, Building2 } from 'lucide-react';
import { calculateDailyInstallments } from '../utils/calculations';

interface AddInvoiceFormProps {
  suppliers: Supplier[];
  onAddInvoice: (invoice: Invoice) => void;
  onAddSupplier: (supplier: Supplier) => void;
}

export function AddInvoiceForm({ suppliers, onAddInvoice, onAddSupplier }: AddInvoiceFormProps) {
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  
  // Supplier form
  const [supplierName, setSupplierName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Invoice form
  const [totalAmount, setTotalAmount] = useState('');
  const [creditPeriod, setCreditPeriod] = useState('');
  const [startDate, setStartDate] = useState('');

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierName.trim()) {
      alert('Please enter supplier name');
      return;
    }

    const newSupplier: Supplier = {
      id: Date.now().toString(),
      name: supplierName,
      contactPerson: contactPerson || undefined,
      email: email || undefined,
      phone: phone || undefined,
      createdAt: new Date(),
    };

    onAddSupplier(newSupplier);
    setSelectedSupplier(newSupplier.id);
    
    // Reset supplier form
    setSupplierName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setShowSupplierForm(false);
  };

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplier) {
      alert('Please select a supplier');
      return;
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      alert('Please enter a valid total amount');
      return;
    }

    if (!creditPeriod || parseInt(creditPeriod) <= 0) {
      alert('Please enter a valid credit period');
      return;
    }

    if (!startDate) {
      alert('Please select a start date');
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplier);
    if (!supplier) return;

    const amount = parseFloat(totalAmount);
    const period = parseInt(creditPeriod);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const due = new Date(start);
    due.setDate(start.getDate() + period - 1);

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      totalAmount: amount,
      creditPeriod: period,
      startDate: start,
      dueDate: due,
      remainingBalance: amount,
      status: 'active',
      dailyInstallments: calculateDailyInstallments(Date.now().toString(), amount, period, start),
      payments: [],
      createdAt: new Date(),
    };

    onAddInvoice(newInvoice);

    // Reset invoice form
    setTotalAmount('');
    setCreditPeriod('');
    setStartDate('');
    setSelectedSupplier('');
  };

  return (
    <div className="space-y-6">
      {/* Supplier Selection/Creation */}
      <Card className="p-6">
        <h2 className="mb-4">Select or Add Supplier</h2>
        
        {!showSupplierForm ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="supplier">Select Supplier</Label>
              <select
                id="supplier"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a supplier --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              onClick={() => setShowSupplierForm(true)}
              className="w-full"
              variant="outline"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Add New Supplier
            </Button>
          </div>
        ) : (
          <form onSubmit={handleAddSupplier} className="space-y-4">
            <div>
              <Label htmlFor="supplierName">Supplier Name *</Label>
              <Input
                id="supplierName"
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Enter supplier name"
                required
              />
            </div>

            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Enter contact person name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSupplierForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Invoice Form */}
      <Card className="p-6">
        <h2 className="mb-4">Create New Invoice</h2>
        
        <form onSubmit={handleAddInvoice} className="space-y-4">
          <div>
            <Label htmlFor="totalAmount">Total Amount (SAR) *</Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Enter total amount"
              required
            />
          </div>

          <div>
            <Label htmlFor="creditPeriod">Credit Period (Days) *</Label>
            <Input
              id="creditPeriod"
              type="number"
              value={creditPeriod}
              onChange={(e) => setCreditPeriod(e.target.value)}
              placeholder="Enter number of days"
              required
            />
          </div>

          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {totalAmount && creditPeriod && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">
                Daily Installment: <span>{(parseFloat(totalAmount) / parseInt(creditPeriod)).toFixed(2)} SAR</span>
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!selectedSupplier}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </form>
      </Card>
    </div>
  );
}
