import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  FaPlusCircle,
  FaBriefcase,
  FaMoneyBillWave,
  FaCheckCircle,
  FaHourglassHalf,
  FaChartLine,
  FaUser,
  FaArrowRight,
  FaUsers,
  FaStar,
  FaCalendar,
  FaClock,
  FaFileInvoiceDollar,
  FaChartBar,
  FaHandshake,
  FaRocket,
  FaLightbulb,
  FaBell,
  FaSync,
} from 'react-icons/fa';

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
    totalSpent: 0,
    avgProjectValue: 0,
    savedAmount: 0,
    satisfactionRate: 92,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  // 🔹 For stats: convert project budget to a single number
  const getProjectNumericValue = (project) => {
    const budget = project.budget || {};

    // If there's an agreed final amount, use that
    if (budget.agreed) return budget.agreed;

    if (project.budgetType === 'fixed') {
      return budget.fixed || 0;
    }

    if (project.budgetType === 'hourly') {
      const min = budget.min || 0;
      const max = budget.max || 0;

      if (min && max) return (min + max) / 2; // simple average
      return min || max || 0;
    }

    return 0;
  };

  // 🔹 For UI labels
  const getBudgetLabel = (project) => {
    const budget = project.budget || {};

    if (project.budgetType === 'fixed') {
      const value = budget.fixed ?? budget.agreed ?? 0;
      return formatCurrency(value);
    }

    if (project.budgetType === 'hourly') {
      const min = budget.min;
      const max = budget.max;

      if (min && max) {
        return `${formatCurrency(min)} - ${formatCurrency(max)}/hr`;
      }
      if (min) {
        return `From ${formatCurrency(min)}/hr`;
      }
      if (max) {
        return `Up to ${formatCurrency(max)}/hr`;
      }
      return 'Hourly rate';
    }

    return 'N/A';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ✅ Pass timeRange as query param
      const res = await api.get('api/projects/client-projects', {
        params: { timeRange },
      });

      const projectsData = res.data || [];
      setProjects(projectsData.slice(0, 6));

      const totalProjects = projectsData.length;
      const activeProjects = projectsData.filter(
        (p) => p.status === 'in-progress'
      ).length;
      const completedProjects = projectsData.filter(
        (p) => p.status === 'completed'
      ).length;
      const pendingProjects = projectsData.filter(
        (p) => p.status === 'open' || p.status === 'pending'
      ).length;

      const completed = projectsData.filter((p) => p.status === 'completed');
      const totalSpent = completed.reduce(
        (sum, project) => sum + getProjectNumericValue(project),
        0
      );

      const avgProjectValue =
        completedProjects > 0 ? Math.round(totalSpent / completedProjects) : 0;
      const savedAmount = Math.round(totalSpent * 0.15);

      setStats((prev) => ({
        ...prev,
        totalProjects,
        activeProjects,
        completedProjects,
        pendingProjects,
        totalSpent,
        avgProjectValue,
        savedAmount,
      }));
    } catch (error) {
      console.error(error);
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon,
    title,
    value,
    color,
    change,
    description,
    loading,
  }) => {
    const colorClasses = {
      primary:
        'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white',
      success:
        'border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white',
      warning:
        'border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-white',
      info: 'border-l-4 border-cyan-500 bg-gradient-to-r from-cyan-50 to-white',
      secondary:
        'border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white',
      danger:
        'border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-white',
    };

    const iconColors = {
      primary: 'bg-blue-100 text-blue-600',
      success: 'bg-green-100 text-green-600',
      warning: 'bg-yellow-100 text-yellow-600',
      info: 'bg-cyan-100 text-cyan-600',
      secondary: 'bg-purple-100 text-purple-600',
      danger: 'bg-red-100 text-red-600',
    };

    return (
      <div
        className={`rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 ${colorClasses[color]} shadow-sm`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconColors[color]} shadow-sm`}>
            {React.cloneElement(icon, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
          </div>
          {change !== undefined && (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                change > 0
                  ? 'bg-green-100 text-green-800'
                  : change < 0
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change)}%
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
            {title}
          </h3>
          {loading ? (
            <div className="h-8 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {value}
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border border-blue-200',
      completed: 'bg-green-100 text-green-800 border border-green-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200',
      pending: 'bg-purple-100 text-purple-800 border border-purple-200',
      'on-hold': 'bg-gray-100 text-gray-800 border border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: <FaClock className="w-4 h-4" />,
      'in-progress': <FaChartLine className="w-4 h-4" />,
      completed: <FaCheckCircle className="w-4 h-4" />,
      pending: <FaHourglassHalf className="w-4 h-4" />,
    };
    return icons[status] || <FaBriefcase className="w-4 h-4" />;
  };

  const filteredProjects = projects.filter((project) => {
    if (activeTab === 'all') return true;
    return project.status === activeTab;
  });

  const calculateTimeRemaining = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3 shadow-sm">
                  <FaBriefcase className="text-white text-lg sm:text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    Client Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                    Welcome back! Here's your project overview
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none pr-8"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <FaCalendar className="text-gray-400" />
                </div>
              </div>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 font-medium text-sm flex items-center justify-center shadow-sm"
              >
                <FaSync className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading bar */}
        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" />
          </div>
        )}

        {/* Summary banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-lg sm:text-xl font-bold mb-2">
                Your FreelancePro Summary
              </h2>
              <p className="text-blue-100 text-sm sm:text-base">
                {timeRange === 'week'
                  ? 'Weekly performance'
                  : timeRange === 'month'
                  ? 'Monthly performance'
                  : timeRange === 'quarter'
                  ? 'Quarterly performance'
                  : 'Yearly performance'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">
                  {stats.completedProjects}
                </div>
                <div className="text-xs text-blue-200">Projects Done</div>
              </div>
              <div className="h-8 w-px bg-blue-400" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(stats.totalSpent)}
                </div>
                <div className="text-xs text-blue-200">Total Invested</div>
              </div>
              <div className="h-8 w-px bg-blue-400" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">
                  {stats.satisfactionRate}%
                </div>
                <div className="text-xs text-blue-200">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={<FaBriefcase />}
            title="Total Projects"
            value={stats.totalProjects}
            color="primary"
            change={12}
            description="Across all categories"
            loading={loading}
          />
          <StatCard
            icon={<FaChartLine />}
            title="Active Projects"
            value={stats.activeProjects}
            color="info"
            change={8}
            description="Currently in progress"
            loading={loading}
          />
          <StatCard
            icon={<FaFileInvoiceDollar />}
            title="Total Spent"
            value={formatCurrency(stats.totalSpent)}
            color="success"
            change={15}
            description="On completed work"
            loading={loading}
          />
          <StatCard
            icon={<FaHandshake />}
            title="Satisfaction"
            value={`${stats.satisfactionRate}%`}
            color="secondary"
            change={2}
            description="Based on reviews"
            loading={loading}
          />
        </div>

        {/* Additional stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Average Project Value
              </h3>
              <FaChartBar className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? (
                <span className="inline-block w-20 h-8 bg-gray-200 animate-pulse rounded" />
              ) : (
                formatCurrency(stats.avgProjectValue)
              )}
            </p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <FaArrowRight className="mr-1" />
              <span>Higher than average</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Estimated Savings
              </h3>
              <FaMoneyBillWave className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? (
                <span className="inline-block w-20 h-8 bg-gray-200 animate-pulse rounded" />
              ) : (
                formatCurrency(stats.savedAmount)
              )}
            </p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <FaArrowRight className="mr-1" />
              <span>vs traditional hiring</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Pending Actions
              </h3>
              <FaBell className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? (
                <span className="inline-block w-20 h-8 bg-gray-200 animate-pulse rounded" />
              ) : (
                stats.pendingProjects
              )}
            </p>
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <FaArrowRight className="mr-1" />
              <span>Projects need attention</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Projects
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Your latest project activities
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {['all', 'open', 'in-progress', 'completed'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                          activeTab === tab
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {tab === 'all'
                          ? 'All'
                          : tab === 'open'
                          ? 'Open'
                          : tab === 'in-progress'
                          ? 'Active'
                          : 'Completed'}
                      </button>
                    ))}
                  </div>
                  <Link
                    to="/client/projects"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View All <FaArrowRight className="ml-1" />
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <FaBriefcase className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-sm font-medium text-gray-900">
                      No projects found
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {activeTab === 'all'
                        ? 'You have no projects yet'
                        : `No ${activeTab} projects found`}
                    </p>
                    {activeTab === 'all' && (
                      <Link
                        to="/client/post-project"
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                      >
                        <FaPlusCircle className="mr-2" />
                        Create Your First Project
                      </Link>
                    )}
                  </div>
                ) : (
                  filteredProjects.map((project) => (
                    <Link
                      key={project._id}
                      to={`/project/${project._id}`}
                      className="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                              getStatusColor(project.status).split(' ')[0]
                            }`}
                          >
                            {getStatusIcon(project.status)}
                          </div>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate group-hover:text-blue-600">
                              {project.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  project.status
                                )}`}
                              >
                                {project.status.replace('-', ' ')}
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {getBudgetLabel(project)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                            <span className="flex items-center">
                              <FaUsers className="mr-1" />
                              {project.bids?.length || 0} bids
                            </span>
                            <span className="flex items-center">
                              <FaCalendar className="mr-1" />
                              {project.createdAt
                                ? new Date(
                                    project.createdAt
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </span>
                            {project.deadline && (
                              <span
                                className={`flex items-center ${
                                  calculateTimeRemaining(project.deadline) ===
                                  'Overdue'
                                    ? 'text-red-600 font-medium'
                                    : 'text-gray-600'
                                }`}
                              >
                                <FaClock className="mr-1" />
                                {calculateTimeRemaining(project.deadline)}
                              </span>
                            )}
                          </div>
                          {project.description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {/* (unchanged from your version, keeping as is) */}
          {/* ... existing sidebar + bottom banner code stays the same ... */}
        </div>

        {/* Bottom banner */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Need help with your projects?
              </h3>
              <p className="text-gray-600 text-sm">
                Our success team is here to help you find the right talent
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/support"
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-300 font-medium text-sm"
              >
                Contact Support
              </Link>
              <Link
                to="/client/post-project"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium text-sm shadow-sm hover:shadow flex items-center"
              >
                <FaPlusCircle className="mr-2" />
                Start New Project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
