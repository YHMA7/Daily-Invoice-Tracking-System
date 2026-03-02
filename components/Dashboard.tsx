import { Invoice } from '../types';
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { getPaymentProgress, isInvoiceOverdue } from '../utils/calculations';

interface DashboardProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
}

export function Dashboard({ invoices, onViewInvoice }: DashboardProps) {
  // Calculate statistics
  const activeInvoices = invoices.filter(inv => inv.status === 'active');
  const overdueInvoices = invoices.filter(inv => isInvoiceOverdue(inv));
  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.remainingBalance, 0);

  // Calculate today's obligations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const todayCommitment = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, invoice) => {
      const todayInstallment = invoice.dailyInstallments.find(inst => {
        const instDate = new Date(inst.date);
        instDate.setHours(0, 0, 0, 0);
        return instDate.toISOString().split('T')[0] === todayStr && inst.status !== 'paid';
      });
      return sum + (todayInstallment?.amountPerDay || 0);
    }, 0);

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.status === 'paid') {
      return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
    }
    if (isInvoiceOverdue(invoice)) {
      return <Badge className="bg-red-500 hover:bg-red-600">Overdue</Badge>;
    }
    return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>;
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

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Obligation</p>
              <p className="mt-2">{formatCurrency(todayCommitment)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Invoices</p>
              <p className="mt-2">{activeInvoices.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue Invoices</p>
              <p className="mt-2">{overdueInvoices.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Outstanding</p>
              <p className="mt-2">{formatCurrency(totalOutstanding)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Active Invoices Table */}
      <Card className="p-6">
        <h2 className="mb-4">All Invoices</h2>
        
        {invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No invoices yet. Add your first invoice to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3">Supplier</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Remaining</th>
                  <th className="pb-3">Start Date</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const progress = getPaymentProgress(invoice);
                  return (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">{invoice.supplierName}</td>
                      <td className="py-4">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="py-4">{formatCurrency(invoice.remainingBalance)}</td>
                      <td className="py-4">{formatDate(invoice.startDate)}</td>
                      <td className="py-4">{formatDate(invoice.dueDate)}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-20" />
                          <span className="text-sm">{Math.round(progress)}%</span>
                        </div>
                      </td>
                      <td className="py-4">{getStatusBadge(invoice)}</td>
                      <td className="py-4">
                        <button
                          onClick={() => onViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
