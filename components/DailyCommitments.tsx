import { Invoice, DailyCommitment } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface DailyCommitmentsProps {
  invoices: Invoice[];
}

export function DailyCommitments({ invoices }: DailyCommitmentsProps) {
  // Calculate daily commitments
  const commitmentMap = new Map<string, DailyCommitment>();

  invoices
    .filter(inv => inv.status !== 'paid')
    .forEach(invoice => {
      invoice.dailyInstallments.forEach(installment => {
        if (installment.status !== 'paid') {
          const dateKey = new Date(installment.date).toISOString().split('T')[0];
          
          if (!commitmentMap.has(dateKey)) {
            commitmentMap.set(dateKey, {
              date: new Date(installment.date),
              totalAmount: 0,
              invoices: [],
            });
          }

          const commitment = commitmentMap.get(dateKey)!;
          commitment.totalAmount += installment.amountPerDay;
          commitment.invoices.push({
            invoiceId: invoice.id,
            supplierName: invoice.supplierName,
            amount: installment.amountPerDay,
          });
        }
      });
    });

  // Convert to array and sort by date
  const commitments = Array.from(commitmentMap.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Get next 30 days of commitments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  const upcomingCommitments = commitments.filter(c => {
    const date = new Date(c.date);
    return date >= today && date <= thirtyDaysLater;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} SAR`;
  };

  const isToday = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const isPast = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  // Calculate summary statistics
  const todayCommitment = upcomingCommitments.find(c => isToday(c.date));
  const totalUpcoming = upcomingCommitments.reduce((sum, c) => sum + c.totalAmount, 0);
  const averageDaily = upcomingCommitments.length > 0 
    ? totalUpcoming / upcomingCommitments.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Obligation</p>
              <p className="mt-2">
                {todayCommitment ? formatCurrency(todayCommitment.totalAmount) : '0.00 SAR'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Next 30 Days Total</p>
              <p className="mt-2">{formatCurrency(totalUpcoming)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Daily</p>
              <p className="mt-2">{formatCurrency(averageDaily)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Daily Commitments List */}
      <Card className="p-6">
        <h2 className="mb-4">Daily Obligations (Next 30 Days)</h2>
        
        {upcomingCommitments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No upcoming commitments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingCommitments.map((commitment, index) => {
              const isTodayCommitment = isToday(commitment.date);
              const isPastCommitment = isPast(commitment.date);

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isTodayCommitment
                      ? 'bg-blue-50 border-blue-300'
                      : isPastCommitment
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p>
                          {formatDate(commitment.date)}
                        </p>
                        {isTodayCommitment && (
                          <Badge className="bg-blue-500 hover:bg-blue-600">Today</Badge>
                        )}
                        {isPastCommitment && (
                          <Badge className="bg-red-500 hover:bg-red-600">Overdue</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-green-600">
                      {formatCurrency(commitment.totalAmount)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {commitment.invoices.map((invoice, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm pl-4 py-1"
                      >
                        <span className="text-gray-600">{invoice.supplierName}</span>
                        <span className="text-gray-700">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
