import React, { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaChartLine,
  FaCreditCard,
  FaPaypal,
  // FaBank,
  FaCalendar,
  FaDownload,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from 'react-icons/fa';
import { IoIosArrowDropdown } from "react-icons/io";
import { BsBank } from "react-icons/bs";
import api from '../../services/api';


const Earnings = () => {
  const [timeFilter, setTimeFilter] = useState('month');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingBalance: 0,
    availableBalance: 0,
    thisMonth: 0,
    lastMonth: 0,
  });

  useEffect(() => {
    fetchEarningsData();
  }, [timeFilter]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);

      const res = await api.get('/freelancer/earnings', {
        params: { filter: timeFilter }
      });

      setStats(res.data?.stats || {
        totalEarnings: 0,
        pendingBalance: 0,
        availableBalance: 0,
        thisMonth: 0,
        lastMonth: 0,
      });


      const formattedTransactions = res.data.transactions.map((t) => ({
        id: t._id,
        project: t.project?.title || 'Project',
        client: t.client?.name || 'Client',
        amount: t.netAmount,
        status: t.status,
        date: t.createdAt,
        type: 'earning'
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Failed to fetch earnings', error);
    } finally {
      setLoading(false);
    }
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800 border border-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'withdrawn': 'bg-blue-100 text-blue-800 border border-blue-200',
      'cancelled': 'bg-red-100 text-red-800 border border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'completed': <FaCheckCircle className="text-green-500" />,
      'pending': <FaClock className="text-yellow-500" />,
      'withdrawn': <FaDownload className="text-blue-500" />,
      'cancelled': <FaTimesCircle className="text-red-500" />,
    };
    return icons[status] || <FaClock className="text-gray-500" />;
  };

  const timeFilters = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];

  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', icon: <FaPaypal />, fee: '2.9%', min: '$1' },
    { id: 'bank', name: 'Bank Transfer', icon: <BsBank />, fee: '$25', min: '$50' },
    { id: 'card', name: 'Credit Card', icon: <FaCreditCard />, fee: '3.5%', min: '$10' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mr-3 shadow-sm">
                <FaMoneyBillWave className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Earnings & Withdrawals
                </h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                  Track your income and manage payments
                </p>
              </div>
            </div>
            <button className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 font-medium text-sm shadow-sm hover:shadow">
              <FaDownload className="mr-2" />
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Time Filter */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2">
            {timeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTimeFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${timeFilter === filter.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Earnings */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-blue-800 uppercase tracking-wider">Total Earnings</h3>
              <FaMoneyBillWave className="text-blue-600 text-xl" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {loading ? '...' : formatCurrency(stats.totalEarnings)}
            </p>
            <div className="flex items-center text-sm text-green-600">
              <FaArrowUp className="mr-1" />
              <span>18% increase from last period</span>
            </div>
          </div>

          {/* Available Balance */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-green-800 uppercase tracking-wider">Available Now</h3>
              <FaCreditCard className="text-green-600 text-xl" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {loading ? '...' : formatCurrency(stats.availableBalance)}
            </p>
            <p className="text-sm text-green-700">Ready for withdrawal</p>
          </div>

          {/* Pending Balance */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 sm:p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-yellow-800 uppercase tracking-wider">Pending</h3>
              <FaClock className="text-yellow-600 text-xl" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {loading ? '...' : formatCurrency(stats.pendingBalance)}
            </p>
            <p className="text-sm text-yellow-700">Will clear in 5 days</p>
          </div>

          {/* This Month */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-purple-800 uppercase tracking-wider">This Month</h3>
              <FaCalendar className="text-purple-600 text-xl" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {loading ? '...' : formatCurrency(stats.thisMonth)}
            </p>
            <div className="flex items-center text-sm text-green-600">
              <FaArrowUp className="mr-1" />
              <span>
                {stats.lastMonth > 0
                  ? Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100)
                  : 0}
                % vs last month
              </span>

            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                  <p className="text-gray-600 text-sm mt-1">Your recent earnings and withdrawals</p>
                </div>
                <div className="relative">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white pr-8">
                    <option>All Transactions</option>
                    <option>Earnings Only</option>
                    <option>Withdrawals Only</option>
                  </select>
                  <IoIosArrowDropdown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                            {transaction.project}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <div className="text-sm text-gray-900">{transaction.client}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`text-sm font-bold ${transaction.type === 'earning' ? 'text-green-600' : 'text-blue-600'
                            }`}>
                            {transaction.type === 'earning' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {getStatusIcon(transaction.status)}
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {transactions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-sm font-medium text-gray-900">No transactions yet</h3>
                  <p className="text-gray-500 text-sm mt-1">Start earning to see transactions here</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="text-blue-600 mr-3 text-xl">{method.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{method.name}</h4>
                        <p className="text-xs text-gray-600">Fee: {method.fee} • Min: {method.min}</p>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Withdrawal */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Withdrawal</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    defaultValue={stats.availableBalance}
                    className="pl-8 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Available: <span className="font-bold">{formatCurrency(stats.availableBalance)}</span>
                </p>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-sm hover:shadow">
                Withdraw Now
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Funds arrive in 1-3 business days
              </p>
            </div>

            {/* Earnings Chart */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Overview</h2>
              <div className="h-48 flex items-end justify-between">
                {[40, 65, 80, 45, 70, 90, 75].map((height, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-6 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Weekly earnings trend</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(2800)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Info */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-yellow-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tax Documents</h3>
              <p className="text-gray-600 text-sm">Download your 1099 tax forms and earnings reports</p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <button className="px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors duration-300 font-medium text-sm">
                View Reports
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 font-medium text-sm shadow-sm hover:shadow">
                Download Tax Forms
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;