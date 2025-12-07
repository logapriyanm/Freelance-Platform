// Enhanced MyBids Component with React Icons
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  FaSearch,
  FaFilter,
  FaEllipsisV,
  FaEye,
  FaTimes,
  FaArrowRight,
  FaClock,
  FaDollarSign,
  FaUserTie,
  FaSync,
  FaCalendarAlt,
  FaTag,
  FaBriefcase,
  FaLayerGroup,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaUndo
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [menuOpen, setMenuOpen] = useState(null);
  const [selectedBid, setSelectedBid] = useState(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchBids();
  }, [filters, sortBy]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await api.get('api/bids/my-bids');
      let filteredBids = response.data;
      
      if (filters.status) {
        filteredBids = filteredBids.filter(bid => bid.status === filters.status);
      }
      
      if (filters.search) {
        filteredBids = filteredBids.filter(bid =>
          bid.project?.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
          bid.project?.client?.name?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      filteredBids = sortBids(filteredBids, sortBy);
      setBids(filteredBids);
    } catch (error) {
      toast.error('Error fetching bids');
    } finally {
      setLoading(false);
    }
  };

  const sortBids = (bids, sortType) => {
    switch (sortType) {
      case 'newest':
        return [...bids].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      case 'oldest':
        return [...bids].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
      case 'amount-high':
        return [...bids].sort((a, b) => b.bidAmount - a.bidAmount);
      case 'amount-low':
        return [...bids].sort((a, b) => a.bidAmount - b.bidAmount);
      default:
        return bids;
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': {
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: <FaHourglassHalf className="h-3 w-3" />,
        label: 'Pending'
      },
      'accepted': {
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: <FaCheckCircle className="h-3 w-3" />,
        label: 'Accepted'
      },
      'rejected': {
        color: 'bg-rose-50 text-rose-800 border-rose-200',
        icon: <FaTimesCircle className="h-3 w-3" />,
        label: 'Rejected'
      },
      'withdrawn': {
        color: 'bg-slate-50 text-slate-800 border-slate-200',
        icon: <FaUndo className="h-3 w-3" />,
        label: 'Withdrawn'
      },
    };
    return configs[status] || configs.pending;
  };

  const getProjectStatusConfig = (status) => {
    const configs = {
      'open': {
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: <FaBriefcase className="h-3 w-3" />
      },
      'in-progress': {
        color: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: <FaSync className="h-3 w-3" />
      },
      'completed': {
        color: 'bg-violet-50 text-violet-800 border-violet-200',
        icon: <FaCheckCircle className="h-3 w-3" />
      },
      'cancelled': {
        color: 'bg-slate-50 text-slate-800 border-slate-200',
        icon: <FaTimesCircle className="h-3 w-3" />
      },
    };
    return configs[status] || { color: 'bg-slate-50 text-slate-800 border-slate-200', icon: <FaBriefcase className="h-3 w-3" /> };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                  <FaLayerGroup className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Bids
                </h1>
              </div>
              <p className="text-slate-600">Track and manage all your submitted bids</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 hidden lg:block">
                {bids.length} {bids.length === 1 ? 'bid' : 'bids'}
              </span>
              <button
                onClick={fetchBids}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <FaSync className="h-3 w-3" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects or clients..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FaFilter className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount-high">High to Low</option>
                  <option value="amount-low">Low to High</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FaArrowRight className="h-4 w-4 text-slate-400 rotate-90" />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <button
                onClick={fetchBids}
                className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
              >
                <FaFilter className="h-4 w-4" />
                <span className="hidden lg:inline">Apply</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bids Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-6"></div>
                <div className="h-8 bg-slate-200 rounded w-full mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-slate-200 rounded w-20"></div>
                  <div className="h-6 bg-slate-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : bids.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
              <FaDollarSign className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No bids found</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {filters.status || filters.search 
                ? 'Try adjusting your filters to see more results'
                : 'Start by bidding on projects that match your skills'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/projects"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2"
              >
                <FaSearch className="h-4 w-4" />
                Browse Projects
              </Link>
              {(filters.status || filters.search) && (
                <button
                  onClick={() => setFilters({ status: '', search: '' })}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <FaTimes className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {bids.map((bid) => {
              const statusConfig = getStatusConfig(bid.status);
              const projectStatusConfig = getProjectStatusConfig(bid.project?.status);
              
              return (
                <motion.div
                  key={bid._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                          {bid.project?.title || 'Project not found'}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig.color} text-sm font-medium`}>
                            {statusConfig.icon}
                            <span>{statusConfig.label}</span>
                          </div>
                          {projectStatusConfig && (
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${projectStatusConfig.color} text-sm font-medium`}>
                              {projectStatusConfig.icon}
                              <span>{bid.project?.status || 'N/A'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === bid._id ? null : bid._id);
                            setSelectedBid(bids.find(b => b._id === bid._id));
                          }}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                        >
                          <FaEllipsisV className="h-5 w-5 text-slate-400" />
                        </button>
                        
                        <AnimatePresence>
                          {menuOpen === bid._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-10 overflow-hidden"
                            >
                              <Link
                                to={`/projects/${bid.project?._id}`}
                                className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                                onClick={() => setMenuOpen(null)}
                              >
                                <FaEye className="mr-3 text-slate-400 h-4 w-4" />
                                <span className="font-medium">View Project</span>
                              </Link>
                              {bid.status === 'pending' && (
                                <button
                                  onClick={() => {
                                    setWithdrawDialogOpen(true);
                                    setMenuOpen(null);
                                  }}
                                  className="flex items-center w-full px-4 py-3 text-rose-600 hover:bg-rose-50 transition-colors duration-200"
                                >
                                  <FaTimes className="mr-3 h-4 w-4" />
                                  <span className="font-medium">Withdraw Bid</span>
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <FaUserTie className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {bid.project?.client?.name || 'Client not available'}
                        </p>
                        <p className="text-sm text-slate-500">Client</p>
                      </div>
                    </div>

                    {/* Bid Details */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <FaDollarSign className="h-3 w-3" />
                            Bid Amount
                          </p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(bid.bidAmount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500 flex items-center gap-1 justify-end">
                            <FaCalendarAlt className="h-3 w-3" />
                            Submitted
                          </p>
                          <div className="flex items-center gap-2 justify-end">
                            <FaClock className="h-4 w-4 text-slate-400" />
                            <p className="font-medium text-slate-800">
                              {formatDate(bid.submittedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills/Tags */}
                    {bid.skills && bid.skills.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                          <FaTag className="h-3 w-3" />
                          Skills Demonstrated
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {bid.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-lg text-sm">
                              {skill}
                            </span>
                          ))}
                          {bid.skills.length > 3 && (
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm">
                              +{bid.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Withdraw Dialog */}
      <AnimatePresence>
        {withdrawDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setWithdrawDialogOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-full flex items-center justify-center">
                  <FaTimes className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Withdraw Bid</h3>
                <p className="text-slate-600">
                  Are you sure you want to withdraw your bid on 
                  <span className="font-semibold text-slate-800"> "{selectedBid?.project?.title}"</span>?
                </p>
                <p className="text-rose-600 text-sm mt-2 font-medium">
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <FaDollarSign className="h-3 w-3" />
                      Your Bid
                    </p>
                    <p className="text-xl font-bold text-slate-800">
                      {selectedBid && formatCurrency(selectedBid.bidAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 flex items-center gap-1 justify-end">
                      <FaCalendarAlt className="h-3 w-3" />
                      Submitted
                    </p>
                    <p className="font-medium text-slate-800">
                      {selectedBid && formatDate(selectedBid.submittedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setWithdrawDialogOpen(false)}
                  className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <FaTimes className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.put(`/bids/${selectedBid._id}/withdraw`);
                      toast.success('Bid withdrawn successfully');
                      fetchBids();
                      setWithdrawDialogOpen(false);
                    } catch (error) {
                      toast.error('Error withdrawing bid');
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
                >
                  <FaTimes className="h-4 w-4" />
                  Confirm Withdraw
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBids;