import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  FaWallet,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaFileInvoiceDollar,
  FaSync,
  FaSearch,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';

const ClientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    inEscrow: 0,
    completedPayments: 0,
    lastPaymentDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPaymentsFromProjects();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const fetchPaymentsFromProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects/client-projects');
      const projects = res.data || [];

      // Derive "payments" from projects
      const derivedPayments = projects
        .filter((p) => p.status === 'completed' || p.status === 'in-progress')
        .map((project) => {
          const baseAmount =
            project.budget?.fixed ||
            project.budget?.agreed ||
            project.budget?.max ||
            project.budget?.min ||
            0;

          return {
            _id: project._id,
            projectId: project._id,
            projectTitle: project.title,
            amount: baseAmount,
            status: project.status === 'completed' ? 'paid' : 'in-escrow',
            method: 'Platform Escrow',
            type: 'Project Payment',
            date: project.updatedAt || project.createdAt || new Date().toISOString(),
          };
        });

      setPayments(derivedPayments);

      // Compute stats
      const totalSpent = derivedPayments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const inEscrow = derivedPayments
        .filter((p) => p.status === 'in-escrow')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const completedPayments = derivedPayments.filter(
        (p) => p.status === 'paid'
      ).length;

      const lastPayment = derivedPayments
        .filter((p) => p.status === 'paid')
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

      setStats({
        totalSpent,
        inEscrow,
        completedPayments,
        lastPaymentDate: lastPayment ? lastPayment.date : null,
      });
    } catch (err) {
      console.error(err);
      toast.error('Error fetching payment data');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchStatus =
      statusFilter === 'all' ? true : p.status === statusFilter;
    const matchSearch = p.projectTitle
      ?.toLowerCase()
      .includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const StatCard = ({ icon, label, value, subLabel, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
            {icon}
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {label}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {value}
            </div>
          </div>
        </div>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
              trend > 0
                ? 'bg-green-50 text-green-700'
                : trend < 0
                ? 'bg-red-50 text-red-700'
                : 'bg-gray-50 text-gray-700'
            }`}
          >
            {trend > 0 ? (
              <FaArrowUp className="mr-1" />
            ) : trend < 0 ? (
              <FaArrowDown className="mr-1" />
            ) : null}
            {trend}%
          </span>
        )}
      </div>
      {subLabel && (
        <div className="text-xs text-gray-500 mt-1">{subLabel}</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-sm">
              <FaWallet className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Payments
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Track your spending, escrow, and project payments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchPaymentsFromProjects}
              className="inline-flex items-center px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-colors duration-200"
            >
              <FaSync className="mr-2" />
              Refresh
            </button>
            <button className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
              <FaMoneyBillWave className="mr-2" />
              Add Funds (UI)
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={<FaMoneyBillWave className="text-blue-600" />}
            label="Total Spent"
            value={formatCurrency(stats.totalSpent)}
            subLabel="Across all completed projects"
            trend={12}
          />
          <StatCard
            icon={<FaClock className="text-yellow-500" />}
            label="In Escrow"
            value={formatCurrency(stats.inEscrow)}
            subLabel="Funds held for in-progress work"
            trend={0}
          />
          <StatCard
            icon={<FaCheckCircle className="text-green-600" />}
            label="Completed Payments"
            value={stats.completedPayments}
            subLabel="Projects fully paid"
            trend={5}
          />
          <StatCard
            icon={<FaFileInvoiceDollar className="text-purple-600" />}
            label="Last Payment"
            value={
              stats.lastPaymentDate
                ? new Date(stats.lastPaymentDate).toLocaleDateString()
                : 'N/A'
            }
            subLabel="Most recent completed project"
          />
        </div>

        {/* Filters + Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by project name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="in-escrow">In Escrow</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <FaWallet className="text-gray-400 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No payment records found
            </h3>
            <p className="text-gray-600 text-sm max-w-md mx-auto mb-4">
              Payments will appear here once your projects move to in-progress
              or completed status.
            </p>
            <Link
              to="/client/projects"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              View My Projects
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-4">Project</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Method</div>
              <div className="col-span-2 text-right">Date</div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredPayments.map((p) => (
                <div
                  key={p._id}
                  className="px-4 sm:px-6 py-4 text-sm flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="md:col-span-4">
                    <div className="font-medium text-gray-900">
                      {p.projectTitle}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {p.type}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex md:block justify-between md:text-right">
                    <span className="text-gray-500 md:hidden">Amount</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(p.amount)}
                    </span>
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2">
                    <span className="md:hidden text-gray-500">Status</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.status === 'paid'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                      }`}
                    >
                      {p.status === 'paid' ? (
                        <FaCheckCircle className="mr-1.5" />
                      ) : (
                        <FaClock className="mr-1.5" />
                      )}
                      {p.status === 'paid' ? 'Paid' : 'In Escrow'}
                    </span>
                  </div>

                  <div className="md:col-span-2 flex md:block justify-between">
                    <span className="text-gray-500 md:hidden">Method</span>
                    <span className="text-gray-700">{p.method}</span>
                  </div>

                  <div className="md:col-span-2 flex md:block justify-between md:text-right">
                    <span className="text-gray-500 md:hidden">Date</span>
                    <span className="text-gray-700">
                      {new Date(p.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom helper */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
            How payments work
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Payments are based on your project budgets. Completed projects are
            treated as paid, and in-progress projects are counted as funds in
            escrow. When you integrate a real payment gateway later (Stripe,
            Razorpay, etc.), you can wire it to this same page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientPayments;
