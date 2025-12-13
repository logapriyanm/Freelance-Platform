import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import {
  FaBriefcase,
  FaMoneyBillWave,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaArrowRight,
  FaSearch,
  FaStar,
  FaTrophy,
  FaChartBar,
  FaCalendar,
  FaBell,
  FaRocket
} from 'react-icons/fa';

const FreelancerDashboard = () => {
  const [stats, setStats] = useState({
    totalBids: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalEarnings: 0,
    successRate: 0,
    responseTime: 0,
  });
  const [recentBids, setRecentBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedProjects, setSuggestedProjects] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bidsRes] = await Promise.all([
        api.get('/freelancer/my-bids'),
      ]);

      const bids = bidsRes.data;
      setRecentBids(bids.slice(0, 5));

      const totalBids = bids.length;
      const activeProjects = bids.filter(b => b.project?.status === 'in-progress').length;
      const completedProjects = bids.filter(b => b.project?.status === 'completed').length;
      const totalEarnings = bids
        .filter(b => b.status === 'accepted' && b.project?.status === 'completed')
        .reduce((sum, bid) => sum + bid.bidAmount, 0);
      
      const successRate = totalBids > 0 ? Math.round((completedProjects / totalBids) * 100) : 0;
      const responseTime = 24; // Mock data

      setStats({
        totalBids,
        activeProjects,
        completedProjects,
        totalEarnings,
        successRate,
        responseTime,
      });

      // Mock suggested projects
      setSuggestedProjects([
        {
          id: 1,
          title: 'React Native Mobile App',
          budget: '$3000',
          skills: ['React Native', 'Firebase', 'UI/UX'],
          posted: '2 hours ago',
          match: 95,
        },
        {
          id: 2,
          title: 'E-commerce Backend API',
          budget: '$2500',
          skills: ['Node.js', 'MongoDB', 'Express'],
          posted: '5 hours ago',
          match: 88,
        },
      ]);
    } catch (error) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color, change, description }) => {
    const colorClasses = {
      primary: 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white',
      success: 'border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white',
      warning: 'border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-white',
      info: 'border-l-4 border-cyan-500 bg-gradient-to-r from-cyan-50 to-white',
      secondary: 'border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white',
    };

    const iconColors = {
      primary: 'bg-blue-100 text-blue-600',
      success: 'bg-green-100 text-green-600',
      warning: 'bg-yellow-100 text-yellow-600',
      info: 'bg-cyan-100 text-cyan-600',
      secondary: 'bg-purple-100 text-purple-600',
    };

    return (
      <div className={`rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 ${colorClasses[color]} shadow-sm`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconColors[color]} shadow-sm`}>
            {React.cloneElement(icon, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
          </div>
          {change !== undefined && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              change > 0 
                ? 'bg-green-100 text-green-800' 
                : change < 0
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change)}%
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">{title}</h3>
          {loading ? (
            <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    );
  };

  const getBidStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'accepted': 'bg-green-100 text-green-800 border border-green-200',
      'rejected': 'bg-red-100 text-red-800 border border-red-200',
      'withdrawn': 'bg-gray-100 text-gray-800 border border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mr-3 shadow-sm">
                  <FaBriefcase className="text-white text-lg sm:text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    Welcome back, {user?.name}!
                  </h1>
                  <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                    Your freelance success dashboard
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/projects"
                className="inline-flex items-center px-4 sm:px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 font-medium text-sm shadow-sm hover:shadow"
              >
                <FaSearch className="mr-2" />
                Find Projects
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center px-4 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-300 font-medium text-sm"
              >
                <FaUser className="mr-2" />
                Update Portfolio
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Your Performance Summary</h2>
              <p className="text-green-100 text-sm sm:text-base">
                Keep up the great work! Your profile looks strong
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">{stats.successRate}%</div>
                <div className="text-xs text-green-200">Success Rate</div>
              </div>
              <div className="h-8 w-px bg-green-400"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
                <div className="text-xs text-green-200">Total Earnings</div>
              </div>
              <div className="h-8 w-px bg-green-400"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">{stats.responseTime}h</div>
                <div className="text-xs text-green-200">Avg. Response</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={<FaBriefcase />}
            title="Total Bids"
            value={stats.totalBids}
            color="primary"
            change={15}
            description="Active proposals"
            loading={loading}
          />
          <StatCard
            icon={<FaChartLine />}
            title="Active Projects"
            value={stats.activeProjects}
            color="success"
            change={8}
            description="Currently working"
            loading={loading}
          />
          <StatCard
            icon={<FaMoneyBillWave />}
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            color="warning"
            change={25}
            description="From completed work"
            loading={loading}
          />
          <StatCard
            icon={<FaTrophy />}
            title="Success Rate"
            value={`${stats.successRate}%`}
            color="secondary"
            change={5}
            description="Bid acceptance"
            loading={loading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Bids */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Recent Bids</h2>
                  <p className="text-gray-600 text-sm mt-1">Your latest project proposals</p>
                </div>
                <Link
                  to="/my-bids"
                  className="inline-flex items-center text-green-600 hover:text-green-800 font-medium text-sm"
                >
                  View All <FaArrowRight className="ml-1" />
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentBids.length === 0 ? (
                  <div className="text-center py-8">
                    <FaBriefcase className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-sm font-medium text-gray-900">No bids yet</h3>
                    <p className="text-gray-500 text-sm mt-1">Start bidding on projects to see them here</p>
                    <Link
                      to="/projects"
                      className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 text-sm"
                    >
                      <FaSearch className="mr-2" />
                      Find Projects
                    </Link>
                  </div>
                ) : (
                  recentBids.map((bid) => (
                    <Link
                      key={bid._id}
                      to={`/project/${bid.project?._id}`}
                      className="block p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate group-hover:text-green-600">
                              {bid.project?.title || 'Project not found'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBidStatusColor(bid.status)}`}>
                              {bid.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-600">
                            <span className="flex items-center">
                              <FaUser className="mr-1" />
                              {bid.project?.client?.name || 'N/A'}
                            </span>
                            <span className="flex items-center">
                              <FaCalendar className="mr-1" />
                              {new Date(bid.submittedAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center font-bold text-green-600">
                              <FaMoneyBillWave className="mr-1" />
                              {formatCurrency(bid.bidAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {bid.project?.status ? bid.project.status.replace('-', ' ') : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Project Status</div>
                          </div>
                          <FaArrowRight className="ml-2 text-gray-400 group-hover:text-green-600" />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Suggested Projects */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Suggested Projects</h2>
                <FaRocket className="text-orange-500" />
              </div>
              
              <div className="space-y-3">
                {suggestedProjects.map((project) => (
                  <div key={project.id} className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{project.title}</h4>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                        {project.match}% match
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{project.budget} • {project.posted}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white text-gray-700 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <button className="w-full text-center text-sm text-orange-600 hover:text-orange-800 font-medium">
                      Apply Now →
                    </button>
                  </div>
                ))}
              </div>
              
              <Link
                to="/projects"
                className="block w-full text-center mt-4 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-300 text-sm font-medium"
              >
                View More Suggestions
              </Link>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Profile Strength</h2>
                <FaChartBar className="text-blue-500" />
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="font-bold text-gray-900">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Portfolio added</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Skills verified</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="text-yellow-500 mr-2" />
                  <span className="text-gray-500">Add work experience</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="text-yellow-500 mr-2" />
                  <span className="text-gray-500">Upload certifications</span>
                </div>
              </div>
              
              <Link
                to="/profile"
                className="block w-full text-center mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-medium"
              >
                Complete Profile
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.activeProjects}</div>
                  <div className="text-xs text-gray-600">Active Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.completedProjects}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.responseTime}h</div>
                  <div className="text-xs text-gray-600">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">4.9</div>
                  <div className="text-xs text-gray-600">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4 sm:p-6 border border-green-100">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to boost your earnings?</h3>
              <p className="text-gray-600 text-sm">Upgrade to Freelancer Pro for premium features</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-300 font-medium text-sm">
                Learn More
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 font-medium text-sm shadow-sm hover:shadow">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;