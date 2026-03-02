export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: Date;
  notes?: string;
}

export interface DailyInstallment {
  date: Date;
  amountPerDay: number;
  status: 'pending' | 'paid' | 'overdue';
  invoiceId: string;
}

export interface Invoice {
  id: string;
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  creditPeriod: number; // in days
  startDate: Date;
  dueDate: Date;
  remainingBalance: number;
  status: 'active' | 'paid' | 'overdue';
  dailyInstallments: DailyInstallment[];
  payments: Payment[];
  createdAt: Date;
}

export interface DailyCommitment {
  date: Date;
  totalAmount: number;
  invoices: Array<{
    invoiceId: string;
    supplierName: string;
    amount: number;
  }>;
}
