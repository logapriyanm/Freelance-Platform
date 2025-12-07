import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaBriefcase,
  FaMoneyBill,
  FaChartLine,
  FaCheckCircle,
  FaHourglassHalf,
  FaChartBar,
  FaHandshake,
  FaCalendarCheck,
} from 'react-icons/fa';
import { FaArrowTrendUp } from 'react-icons/fa6';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    activeProjects: 0,
    completedProjects: 0,
    activeFreelancers: 0,
    activeClients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const response = await api.get('api/admin/activities');
      setRecentActivities(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error fetching recent activities');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('api/admin/stats');
      setStats(response.data || {});
    } catch (error) {
      console.error(error);
      toast.error('Error fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color, change, period }) => {
    const colorClasses = {
      primary: 'bg-blue-50 border-l-4 border-blue-500',
      success: 'bg-green-50 border-l-4 border-green-500',
      warning: 'bg-yellow-50 border-l-4 border-yellow-500',
      info: 'bg-cyan-50 border-l-4 border-cyan-500',
      secondary: 'bg-purple-50 border-l-4 border-purple-500',
      danger: 'bg-red-50 border-l-4 border-red-500',
    };

    const iconColors = {
      primary: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      info: 'text-cyan-600',
      secondary: 'text-purple-600',
      danger: 'text-red-600',
    };

    return (
      <div
        className={`rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-300 ${colorClasses[color]}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className={`p-2 sm:p-3 rounded-lg ${iconColors[color]} bg-white shadow-sm`}
          >
            {React.cloneElement(icon, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
          </div>
          {typeof change === 'number' && (
            <span
              className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                change > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {change > 0 ? '+' : ''}
              {change}%
            </span>
          )}
        </div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 truncate">
          {title}
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          {loading ? (
            <span className="inline-block w-20 h-8 bg-gray-200 animate-pulse rounded" />
          ) : (
            value
          )}
        </p>
        {period && <p className="text-xs text-gray-500">{period}</p>}
      </div>
    );
  };

  const getActivityDotColor = (type) => {
    switch (type) {
      case 'user':
        return 'bg-blue-600';
      case 'project':
        return 'bg-green-600';
      case 'transaction':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getActivityTime = (createdAt) => {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    return date.toLocaleString();
  };

  const activitiesToRender =
    recentActivities && recentActivities.length > 0
      ? recentActivities
      : [
          {
            type: 'user',
            title: 'New user registered',
            description: 'John Doe joined as a freelancer',
            createdAt: new Date(),
          },
          {
            type: 'project',
            title: 'Project completed',
            description: 'E-commerce website project delivered',
            createdAt: new Date(),
          },
          {
            type: 'transaction',
            title: 'New dispute filed',
            description: 'Project #12345 has a dispute',
            createdAt: new Date(),
          },
        ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center">
                <FaChartBar className="mr-2 sm:mr-3 text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Monitor platform performance and activities
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={<FaUsers />}
            title="Total Users"
            value={stats.totalUsers?.toLocaleString() || 0}
            color="primary"
            change={12}
            period="vs last month"
          />
          <StatCard
            icon={<FaBriefcase />}
            title="Total Projects"
            value={stats.totalProjects?.toLocaleString() || 0}
            color="success"
            change={8}
            period="vs last month"
          />
          <StatCard
            icon={<FaMoneyBill />}
            title="Revenue"
            value={`$${(stats.totalRevenue || 0).toLocaleString()}`}
            color="warning"
            change={15}
            period="vs last month"
          />
          <StatCard
            icon={<FaChartLine />}
            title="Active Projects"
            value={stats.activeProjects?.toLocaleString() || 0}
            color="info"
            change={5}
            period="currently"
          />
          <StatCard
            icon={<FaHandshake />}
            title="Completed"
            value={stats.completedProjects?.toLocaleString() || 0}
            color="secondary"
            change={10}
            period="this month"
          />
          <StatCard
            icon={<FaHourglassHalf />}
            title="Pending"
            value={stats.pendingVerifications?.toLocaleString() || 0}
            color="danger"
            change={-3}
            period="needs action"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Active Freelancers
              </h3>
              <FaUsers className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.activeFreelancers || 0}
            </p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <FaArrowTrendUp className="mr-1" />
              <span>12% increase</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Active Clients
              </h3>
              <FaUsers className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.activeClients || 0}
            </p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <FaArrowTrendUp className="mr-1" />
              <span>8% increase</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Avg. Project Value
              </h3>
              <FaMoneyBill className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">$1,250</p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <FaArrowTrendUp className="mr-1" />
              <span>5% increase</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Satisfaction Rate
              </h3>
              <FaCheckCircle className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">94.5%</p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <FaArrowTrendUp className="mr-1" />
              <span>2% increase</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Recent Activities
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {activitiesToRender.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-start p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getActivityDotColor(
                          activity.type
                        )}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 ml-3">
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <FaCalendarCheck className="mr-1" />
                        <span>{getActivityTime(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Quick Actions
              </h2>

              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium text-sm sm:text-base flex items-center justify-center shadow-sm hover:shadow">
                  <FaUsers className="mr-2" />
                  Verify Users
                </button>

                <button className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium text-sm sm:text-base flex items-center justify-center shadow-sm hover:shadow">
                  <FaBriefcase className="mr-2" />
                  Review Projects
                </button>

                <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-medium text-sm sm:text-base flex items-center justify-center shadow-sm hover:shadow">
                  <FaChartBar className="mr-2" />
                  View Reports
                </button>

                <button className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium text-sm sm:text-base flex items-center justify-center shadow-sm hover:shadow">
                  <FaHourglassHalf className="mr-2" />
                  Handle Disputes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
