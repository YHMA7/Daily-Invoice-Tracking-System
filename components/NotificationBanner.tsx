import { Invoice } from '../types';
import { Alert } from './ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { isInvoiceOverdue } from '../utils/calculations';
import { useState } from 'react';

interface NotificationBannerProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
}

export function NotificationBanner({ invoices, onViewInvoice }: NotificationBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const overdueInvoices = invoices.filter(
    inv => isInvoiceOverdue(inv) && !dismissed.has(inv.id)
  );

  if (overdueInvoices.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} SAR`;
  };

  const handleDismiss = (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(prev => new Set([...prev, invoiceId]));
  };

  return (
    <div className="space-y-3">
      {overdueInvoices.map(invoice => (
        <Alert key={invoice.id} className="bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-900">
                Overdue Invoice: <span>{invoice.supplierName}</span>
              </p>
              <p className="text-sm text-red-700 mt-1">
                Remaining balance: {formatCurrency(invoice.remainingBalance)} - 
                Due date was {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
              <button
                onClick={() => onViewInvoice(invoice)}
                className="text-sm text-red-600 hover:text-red-800 underline mt-2"
              >
                View and make payment
              </button>
            </div>
            <button
              onClick={(e) => handleDismiss(invoice.id, e)}
              className="text-red-600 hover:text-red-800"
              aria-label="Dismiss notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </Alert>
      ))}
    </div>
  );
}
