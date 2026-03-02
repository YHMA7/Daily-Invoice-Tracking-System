import { useState } from 'react';
import { Invoice, Payment } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { getPaymentProgress, isInvoiceOverdue } from '../utils/calculations';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onAddPayment: (invoiceId: string, payment: Payment) => void;
  onBack: () => void;
}

export function InvoiceDetails({ invoice, onAddPayment, onBack }: InvoiceDetailsProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > invoice.remainingBalance) {
      alert('Payment amount cannot exceed remaining balance');
      return;
    }

    const newPayment: Payment = {
      id: Date.now().toString(),
      invoiceId: invoice.id,
      amount,
      date: new Date(paymentDate),
      notes: notes || undefined,
    };

    onAddPayment(invoice.id, newPayment);

    // Reset form
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} SAR`;
  };

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.status === 'paid') {
      return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
    }
    if (isInvoiceOverdue(invoice)) {
      return <Badge className="bg-red-500 hover:bg-red-600">Overdue</Badge>;
    }
    return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>;
  };

  const getInstallmentBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge className="bg-green-500 hover:bg-green-600 text-xs">Paid</Badge>;
    }
    if (status === 'overdue') {
      return <Badge className="bg-red-500 hover:bg-red-600 text-xs">Overdue</Badge>;
    }
    return <Badge className="bg-gray-500 hover:bg-gray-600 text-xs">Pending</Badge>;
  };

  const progress = getPaymentProgress(invoice);
  const totalPaid = invoice.totalAmount - invoice.remainingBalance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1>Invoice Details</h1>
      </div>

      {/* Invoice Summary */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="mb-2">{invoice.supplierName}</h2>
            <p className="text-sm text-gray-600">Invoice ID: {invoice.id}</p>
          </div>
          {getStatusBadge(invoice)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p>{formatCurrency(invoice.totalAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Paid</p>
            <p className="text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p className="text-orange-600">{formatCurrency(invoice.remainingBalance)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Credit Period</p>
            <p>{invoice.creditPeriod} days</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span>Payment Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Start Date:</span>
            <span>{formatDate(invoice.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Due Date:</span>
            <span>{formatDate(invoice.dueDate)}</span>
          </div>
        </div>
      </Card>

      {/* Add Payment Form */}
      {invoice.status !== 'paid' && (
        <Card className="p-6">
          <h2 className="mb-4">Record Payment</h2>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentAmount">Payment Amount (SAR) *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max: {formatCurrency(invoice.remainingBalance)}
                </p>
              </div>

              <div>
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add payment notes"
              />
            </div>

            <Button type="submit" className="w-full">
              <DollarSign className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </form>
        </Card>
      )}

      {/* Payment History */}
      <Card className="p-6">
        <h2 className="mb-4">Payment History</h2>
        {invoice.payments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No payments recorded yet</p>
        ) : (
          <div className="space-y-3">
            {invoice.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p>{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-gray-600">{formatDate(payment.date)}</p>
                    {payment.notes && (
                      <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Daily Installments */}
      <Card className="p-6">
        <h2 className="mb-4">Daily Installments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoice.dailyInstallments.map((installment, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">{formatDate(installment.date)}</td>
                  <td className="py-3">{formatCurrency(installment.amountPerDay)}</td>
                  <td className="py-3">{getInstallmentBadge(installment.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
