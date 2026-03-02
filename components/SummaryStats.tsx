import { Invoice } from '../types';
import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface SummaryStatsProps {
  invoices: Invoice[];
}

export function SummaryStats({ invoices }: SummaryStatsProps) {
  // Calculate statistics
  const totalInvoices = invoices.length;
  const activeInvoices = invoices.filter(inv => inv.status === 'active').length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.remainingBalance), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.remainingBalance, 0);

  // Prepare data for charts
  const statusData = [
    { name: 'Active', value: activeInvoices, color: '#3b82f6' },
    { name: 'Paid', value: paidInvoices, color: '#22c55e' },
    { name: 'Overdue', value: overdueInvoices, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Supplier breakdown
  const supplierMap = new Map<string, number>();
  invoices.forEach(invoice => {
    const current = supplierMap.get(invoice.supplierName) || 0;
    supplierMap.set(invoice.supplierName, current + invoice.totalAmount);
  });

  const supplierData = Array.from(supplierMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} SAR`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Invoices</p>
          <p className="mt-2">{totalInvoices}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="mt-2">{formatCurrency(totalAmount)}</p>
          <p className="text-xs text-gray-500 mt-1">Sum of all invoices</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Paid</p>
          <p className="mt-2 text-green-600">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totalAmount > 0 ? `${((totalPaid / totalAmount) * 100).toFixed(1)}% of total` : '0%'}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className="mt-2 text-orange-600">{formatCurrency(totalOutstanding)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totalAmount > 0 ? `${((totalOutstanding / totalAmount) * 100).toFixed(1)}% remaining` : '0%'}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Status Distribution */}
        <Card className="p-6">
          <h2 className="mb-4">Invoice Status Distribution</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No invoice data available
            </div>
          )}
        </Card>

        {/* Top Suppliers by Amount */}
        <Card className="p-6">
          <h2 className="mb-4">Top Suppliers by Total Amount</h2>
          {supplierData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No supplier data available
            </div>
          )}
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card className="p-6">
        <h2 className="mb-4">Detailed Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">By Status</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Invoices:</span>
                <span className="text-sm">{activeInvoices}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Paid Invoices:</span>
                <span className="text-sm text-green-600">{paidInvoices}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Overdue Invoices:</span>
                <span className="text-sm text-red-600">{overdueInvoices}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Financial Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Invoiced:</span>
                <span className="text-sm">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Amount Paid:</span>
                <span className="text-sm text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Still Owed:</span>
                <span className="text-sm text-orange-600">{formatCurrency(totalOutstanding)}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Suppliers</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Suppliers:</span>
                <span className="text-sm">{supplierMap.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg per Supplier:</span>
                <span className="text-sm">
                  {supplierMap.size > 0 
                    ? formatCurrency(totalAmount / supplierMap.size)
                    : '0.00 SAR'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
