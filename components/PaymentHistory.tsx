import { Invoice } from '../types';
import { Card } from './ui/card';
import { CheckCircle2, FileText, TrendingDown } from 'lucide-react';

interface PaymentHistoryProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
}

export function PaymentHistory({ invoices, onViewInvoice }: PaymentHistoryProps) {
  // Collect all payments from all invoices
  const allPayments = invoices.flatMap(invoice =>
    invoice.payments.map(payment => ({
      ...payment,
      supplierName: invoice.supplierName,
      invoice: invoice,
    }))
  );

  // Sort by date (newest first)
  const sortedPayments = allPayments.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} SAR`;
  };

  // Calculate statistics
  const totalPaid = sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paymentCount = sortedPayments.length;
  const averagePayment = paymentCount > 0 ? totalPaid / paymentCount : 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="mt-2">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="mt-2">{paymentCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Payment</p>
              <p className="mt-2">{formatCurrency(averagePayment)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment History List */}
      <Card className="p-6">
        <h2 className="mb-4">All Payment Transactions</h2>
        
        {sortedPayments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No payment history yet</p>
            <p className="text-sm mt-2">Payments will appear here once recorded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onViewInvoice(payment.invoice)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p>{payment.supplierName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(payment.date)}
                    </p>
                    {payment.notes && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        "{payment.notes}"
                      </p>
                    )}
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800 underline mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewInvoice(payment.invoice);
                      }}
                    >
                      View invoice
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-600">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
