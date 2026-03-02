import { useState, useEffect } from 'react';
import { Invoice, Supplier, Payment } from './types';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { AddInvoiceForm } from './components/AddInvoiceForm';
import { InvoiceDetails } from './components/InvoiceDetails';
import { DailyCommitments } from './components/DailyCommitments';
import { PaymentHistory } from './components/PaymentHistory';
import { SummaryStats } from './components/SummaryStats';
import { NotificationBanner } from './components/NotificationBanner';
import { recalculateInstallments, updateInvoiceStatus } from './utils/calculations';

export default function App() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Initialize with sample data
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sampleSuppliers: Supplier[] = [
      {
        id: '1',
        name: 'ABC Supplies Co.',
        contactPerson: 'John Smith',
        email: 'john@abcsupplies.com',
        phone: '+966 12 345 6789',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Tech Solutions Ltd.',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@techsolutions.com',
        phone: '+966 11 987 6543',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '3',
        name: 'Global Imports',
        contactPerson: 'Ahmed Al-Rashid',
        email: 'ahmed@globalimports.sa',
        phone: '+966 13 456 7890',
        createdAt: new Date('2024-02-01'),
      },
    ];

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const sampleInvoices: Invoice[] = [
      {
        id: '1001',
        supplierId: '1',
        supplierName: 'ABC Supplies Co.',
        totalAmount: 10000,
        creditPeriod: 10,
        startDate: tomorrow,
        dueDate: new Date(tomorrow.getTime() + 9 * 24 * 60 * 60 * 1000),
        remainingBalance: 10000,
        status: 'active',
        dailyInstallments: [],
        payments: [],
        createdAt: new Date(),
      },
      {
        id: '1002',
        supplierId: '2',
        supplierName: 'Tech Solutions Ltd.',
        totalAmount: 15000,
        creditPeriod: 15,
        startDate: lastWeek,
        dueDate: new Date(lastWeek.getTime() + 14 * 24 * 60 * 60 * 1000),
        remainingBalance: 9000,
        status: 'active',
        dailyInstallments: [],
        payments: [
          {
            id: 'p1',
            invoiceId: '1002',
            amount: 6000,
            date: new Date(lastWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
            notes: 'Initial payment',
          },
        ],
        createdAt: new Date(lastWeek),
      },
    ];

    // Calculate daily installments for sample invoices
    sampleInvoices.forEach(invoice => {
      const dailyAmount = invoice.totalAmount / invoice.creditPeriod;
      const installments = [];
      
      for (let i = 0; i < invoice.creditPeriod; i++) {
        const installmentDate = new Date(invoice.startDate);
        installmentDate.setDate(invoice.startDate.getDate() + i);
        installmentDate.setHours(0, 0, 0, 0);

        let status: 'pending' | 'paid' | 'overdue' = 'pending';
        if (installmentDate < today) {
          status = invoice.payments.length > 0 ? 'paid' : 'overdue';
        }

        installments.push({
          date: installmentDate,
          amountPerDay: dailyAmount,
          status,
          invoiceId: invoice.id,
        });
      }
      
      invoice.dailyInstallments = installments;
    });

    // Recalculate invoice 1002 after payment
    if (sampleInvoices[1].payments.length > 0) {
      const payment = sampleInvoices[1].payments[0];
      sampleInvoices[1].dailyInstallments = recalculateInstallments(
        sampleInvoices[1],
        payment.amount,
        payment.date
      );
    }

    setSuppliers(sampleSuppliers);
    setInvoices(sampleInvoices);
  }, []);

  const handleAddSupplier = (supplier: Supplier) => {
    setSuppliers([...suppliers, supplier]);
  };

  const handleAddInvoice = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
    setCurrentView('dashboard');
  };

  const handleAddPayment = (invoiceId: string, payment: Payment) => {
    setInvoices(prevInvoices =>
      prevInvoices.map(invoice => {
        if (invoice.id === invoiceId) {
          const updatedInvoice = {
            ...invoice,
            payments: [...invoice.payments, payment],
            remainingBalance: invoice.remainingBalance - payment.amount,
          };

          // Recalculate daily installments
          updatedInvoice.dailyInstallments = recalculateInstallments(
            updatedInvoice,
            payment.amount,
            payment.date
          );

          // Update status (auto-close if fully paid)
          return updateInvoiceStatus(updatedInvoice);
        }
        return invoice;
      })
    );

    // Update selected invoice if viewing details
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      const updatedInvoice = invoices.find(inv => inv.id === invoiceId);
      if (updatedInvoice) {
        const withPayment = {
          ...updatedInvoice,
          payments: [...updatedInvoice.payments, payment],
          remainingBalance: updatedInvoice.remainingBalance - payment.amount,
        };
        withPayment.dailyInstallments = recalculateInstallments(
          withPayment,
          payment.amount,
          payment.date
        );
        setSelectedInvoice(updateInvoiceStatus(withPayment));
      }
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCurrentView('invoice-details');
  };

  const handleBackFromDetails = () => {
    setSelectedInvoice(null);
    setCurrentView('dashboard');
  };

  // Update invoice statuses periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setInvoices(prevInvoices =>
        prevInvoices.map(invoice => {
          // Update installment statuses
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const updatedInstallments = invoice.dailyInstallments.map(inst => {
            const instDate = new Date(inst.date);
            instDate.setHours(0, 0, 0, 0);

            if (inst.status === 'pending' && instDate < today) {
              return { ...inst, status: 'overdue' as const };
            }
            return inst;
          });

          const updatedInvoice = {
            ...invoice,
            dailyInstallments: updatedInstallments,
          };

          return updateInvoiceStatus(updatedInvoice);
        })
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Banner */}
        {currentView !== 'invoice-details' && (
          <div className="mb-6">
            <NotificationBanner 
              invoices={invoices} 
              onViewInvoice={handleViewInvoice}
            />
          </div>
        )}

        {/* Main Content */}
        {currentView === 'dashboard' && (
          <Dashboard 
            invoices={invoices} 
            onViewInvoice={handleViewInvoice}
          />
        )}

        {currentView === 'add-invoice' && (
          <AddInvoiceForm
            suppliers={suppliers}
            onAddInvoice={handleAddInvoice}
            onAddSupplier={handleAddSupplier}
          />
        )}

        {currentView === 'invoice-details' && selectedInvoice && (
          <InvoiceDetails
            invoice={selectedInvoice}
            onAddPayment={handleAddPayment}
            onBack={handleBackFromDetails}
          />
        )}

        {currentView === 'daily-commitments' && (
          <DailyCommitments invoices={invoices} />
        )}

        {currentView === 'payment-history' && (
          <PaymentHistory 
            invoices={invoices}
            onViewInvoice={handleViewInvoice}
          />
        )}

        {currentView === 'reports' && (
          <SummaryStats invoices={invoices} />
        )}
      </div>
    </div>
  );
}
