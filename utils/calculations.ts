import { Invoice, DailyInstallment, Payment } from '../types';

/**
 * Calculate daily installments for an invoice
 */
export function calculateDailyInstallments(
  invoiceId: string,
  totalAmount: number,
  creditPeriod: number,
  startDate: Date
): DailyInstallment[] {
  const dailyAmount = totalAmount / creditPeriod;
  const installments: DailyInstallment[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < creditPeriod; i++) {
    const installmentDate = new Date(startDate);
    installmentDate.setDate(startDate.getDate() + i);
    installmentDate.setHours(0, 0, 0, 0);

    let status: 'pending' | 'paid' | 'overdue' = 'pending';
    if (installmentDate < today) {
      status = 'overdue';
    }

    installments.push({
      date: installmentDate,
      amountPerDay: dailyAmount,
      status,
      invoiceId,
    });
  }

  return installments;
}

/**
 * Recalculate daily installments after a payment
 */
export function recalculateInstallments(
  invoice: Invoice,
  paymentAmount: number,
  paymentDate: Date
): DailyInstallment[] {
  const newRemainingBalance = invoice.remainingBalance - paymentAmount;
  
  if (newRemainingBalance <= 0) {
    // Invoice is fully paid, mark all installments as paid
    return invoice.dailyInstallments.map(inst => ({
      ...inst,
      status: 'paid' as const,
    }));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const paymentDateNormalized = new Date(paymentDate);
  paymentDateNormalized.setHours(0, 0, 0, 0);

  // Find remaining unpaid days (from payment date onwards)
  const remainingInstallments = invoice.dailyInstallments.filter(inst => {
    const instDate = new Date(inst.date);
    instDate.setHours(0, 0, 0, 0);
    return instDate >= paymentDateNormalized && inst.status !== 'paid';
  });

  const remainingDays = remainingInstallments.length;
  
  if (remainingDays === 0) {
    return invoice.dailyInstallments;
  }

  // Calculate new daily amount for remaining days
  const newDailyAmount = newRemainingBalance / remainingDays;

  // Update installments
  return invoice.dailyInstallments.map(inst => {
    const instDate = new Date(inst.date);
    instDate.setHours(0, 0, 0, 0);
    
    // If this is a remaining day, update the amount
    if (instDate >= paymentDateNormalized && inst.status !== 'paid') {
      let status: 'pending' | 'paid' | 'overdue' = 'pending';
      if (instDate < today) {
        status = 'overdue';
      }
      
      return {
        ...inst,
        amountPerDay: newDailyAmount,
        status,
      };
    }
    
    // Past days before payment - mark as paid if they were pending
    if (instDate < paymentDateNormalized && inst.status !== 'paid') {
      return {
        ...inst,
        status: 'paid' as const,
      };
    }
    
    return inst;
  });
}

/**
 * Calculate total daily commitments across all invoices
 */
export function calculateDailyCommitments(invoices: Invoice[]): Map<string, number> {
  const commitmentMap = new Map<string, number>();

  invoices
    .filter(inv => inv.status !== 'paid')
    .forEach(invoice => {
      invoice.dailyInstallments.forEach(installment => {
        if (installment.status !== 'paid') {
          const dateKey = installment.date.toISOString().split('T')[0];
          const currentAmount = commitmentMap.get(dateKey) || 0;
          commitmentMap.set(dateKey, currentAmount + installment.amountPerDay);
        }
      });
    });

  return commitmentMap;
}

/**
 * Check if an invoice is overdue
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  return invoice.status === 'active' && dueDate < today && invoice.remainingBalance > 0;
}

/**
 * Update invoice status based on remaining balance and due date
 */
export function updateInvoiceStatus(invoice: Invoice): Invoice {
  if (invoice.remainingBalance <= 0) {
    return { ...invoice, status: 'paid' };
  }
  
  if (isInvoiceOverdue(invoice)) {
    return { ...invoice, status: 'overdue' };
  }
  
  return { ...invoice, status: 'active' };
}

/**
 * Get total amount paid for an invoice
 */
export function getTotalPaid(invoice: Invoice): number {
  return invoice.totalAmount - invoice.remainingBalance;
}

/**
 * Get payment progress percentage
 */
export function getPaymentProgress(invoice: Invoice): number {
  if (invoice.totalAmount === 0) return 0;
  return ((invoice.totalAmount - invoice.remainingBalance) / invoice.totalAmount) * 100;
}
