import React, { useState, useEffect } from 'react';
import {
  FaGavel,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBill,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFilter,
  FaCalendar,
  FaUserCheck,
  FaComment,
  FaEye,
  FaFileAlt,
  FaClock,
  FaHistory,
  FaBan,
  FaTrash
} from 'react-icons/fa';
import { IoIosArrowDropdown } from "react-icons/io";
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useSelector } from 'react-redux';

const DisputeResolution = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState({
    decision: '',
    refundPercentage: 50,
    notes: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [viewingDetails, setViewingDetails] = useState(false);
  const [disputeHistory, setDisputeHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const userInfo = useSelector((state) => state.auth?.userInfo);


  useEffect(() => {
    // only admins should hit the admin API
    if (userInfo?.role === 'admin') {
      fetchDisputes();
    } else {
      setLoading(false); // stop loader
    }
  }, [userInfo]); // re-run when user info is ready

 const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/disputes');

      if (response.data) {
        const formattedDisputes = response.data.map((dispute) => ({
          ...dispute,
          id: dispute._id || dispute.id,
          title: dispute.project?.title || dispute.title || 'Untitled Project',
          amount: dispute.amount || dispute.project?.budget || 0,
          client: dispute.client || { name: 'Unknown Client', email: 'N/A' },
          freelancer: dispute.freelancer || { name: 'Unknown Freelancer', email: 'N/A' },
          severity: dispute.severity || 'medium',
          status: dispute.status || 'pending',
          createdAt: dispute.createdAt || new Date(),
          disputeReason: dispute.disputeReason || dispute.reason || 'No reason provided',
          urgency: dispute.urgency || 'normal',
          messages: dispute.messages || [],
        }));

        setDisputes(formattedDisputes);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);

      // 👇 Special handling for 403 (not authorized)
      if (error.response?.status === 403) {
        toast.error('You are not authorized to view disputes (Admin only).');
        setDisputes([]); // don't use mock data for real unauthorized case
      } else {
        // other errors = dev fallback
        setDisputes(getMockDisputes());
        toast.error('Error fetching disputes. Using mock data.');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleOpenDialog = (dispute) => {
    setSelectedDispute(dispute);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDispute(null);
    setResolution({
      decision: '',
      refundPercentage: 50,
      notes: '',
    });
    setViewingDetails(false);
  };

  const handleViewDetails = async (dispute) => {
    setSelectedDispute(dispute);
    setViewingDetails(true);
    await fetchDisputeHistory(dispute.id);
  };

  const fetchDisputeHistory = async (disputeId) => {
    try {
      setHistoryLoading(true);
      const response = await api.get(`api/admin/disputes/${disputeId}/history`);
      if (response.data) {
        setDisputeHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching dispute history:', error);
      setDisputeHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!resolution.decision) {
      toast.error('Please select a resolution decision');
      return;
    }

    try {
      const response = await api.put(`api/admin/disputes/${selectedDispute.id}/resolve`, resolution);
      if (response.data.success || response.data.message) {
        toast.success('Dispute resolved successfully');
        fetchDisputes();
        handleCloseDialog();
      } else {
        toast.error('Failed to resolve dispute');
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Error resolving dispute');
    }
  };

  const handleEscalateDispute = async (disputeId) => {
    try {
      const response = await api.put(`api/admin/disputes/${disputeId}/escalate`);
      if (response.data.success) {
        toast.success('Dispute escalated');
        fetchDisputes();
      }
    } catch (error) {
      toast.error('Error escalating dispute');
    }
  };

  const handleArchiveDispute = async (disputeId) => {
    if (!window.confirm('Are you sure you want to archive this dispute?')) return;
    
    try {
      const response = await api.put(`api/admin/disputes/${disputeId}/archive`);
      if (response.data.success) {
        toast.success('Dispute archived');
        fetchDisputes();
      }
    } catch (error) {
      toast.error('Error archiving dispute');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      high: 'bg-red-100 text-red-800 border border-red-200',
      critical: 'bg-purple-100 text-purple-800 border border-purple-200',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border border-green-200',
      escalated: 'bg-red-100 text-red-800 border border-red-200',
      'in-review': 'bg-blue-100 text-blue-800 border border-blue-200',
      archived: 'bg-gray-100 text-gray-800 border border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock className="w-3 h-3" />,
      resolved: <FaCheckCircle className="w-3 h-3" />,
      escalated: <FaExclamationTriangle className="w-3 h-3" />,
      'in-review': <FaEye className="w-3 h-3" />,
      archived: <FaHistory className="w-3 h-3" />,
    };
    return icons[status] || <FaClock className="w-3 h-3" />;
  };

  const getTimeSince = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

 const filteredDisputes = disputes.filter((dispute) => {
  const term = (searchTerm || '').toLowerCase();

  const title = (dispute.title || dispute.project?.title || '').toLowerCase();
  const clientName = (dispute.client?.name || '').toLowerCase();
  const freelancerName = (dispute.freelancer?.name || '').toLowerCase();
  const reason = (dispute.disputeReason || '').toLowerCase();

  const matchesSearch =
    !term ||
    title.includes(term) ||
    clientName.includes(term) ||
    freelancerName.includes(term) ||
    reason.includes(term);

  const matchesStatus =
    statusFilter === 'all' || dispute.status === statusFilter;

  const matchesSeverity =
    severityFilter === 'all' || dispute.severity === severityFilter;

  return matchesSearch && matchesStatus && matchesSeverity;
});


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisputes = filteredDisputes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);

  const stats = {
    total: filteredDisputes.length,
    pending: filteredDisputes.filter(d => d.status === 'pending').length,
    inReview: filteredDisputes.filter(d => d.status === 'in-review').length,
    highPriority: filteredDisputes.filter(d => d.severity === 'high' || d.severity === 'critical').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center">
                <FaGavel className="mr-2 sm:mr-3 text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
                Dispute Resolution
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Manage and resolve platform disputes efficiently
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDisputes}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center text-sm sm:text-base shadow-sm hover:shadow"
              >
                <FaUserCheck className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Disputes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaGavel className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaClock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">In Review</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inReview}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaEye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">High Priority</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.highPriority}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FaExclamationTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search disputes by project, client, freelancer, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                  <option value="archived">Archived</option>
                </select>
                <IoIosArrowDropdown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base appearance-none bg-white"
                >
                  <option value="all">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <IoIosArrowDropdown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSeverityFilter('all');
                }}
                className="flex items-center justify-center px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
              >
                <FaFilter className="mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Disputes Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading disputes...</p>
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No disputes found</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search or filter' : 'No disputes have been filed yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentDisputes.map((dispute) => (
                      <tr key={dispute.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {dispute.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <div className="flex items-center">
                                <span className="font-medium">Client:</span>
                                <span className="ml-1">{dispute.client?.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium">Freelancer:</span>
                                <span className="ml-1">{dispute.freelancer?.name}</span>
                              </div>
                              <div className="mt-1 text-gray-400 truncate max-w-xs">
                                {dispute.disputeReason}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FaMoneyBill className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-bold text-gray-900">
                              ${dispute.amount?.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center justify-center w-24 ${getSeverityColor(dispute.severity)}`}>
                              {dispute.severity.charAt(0).toUpperCase() + dispute.severity.slice(1)}
                            </span>
                            {dispute.urgency === 'high' && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 text-center flex items-center justify-center">
                                <FaExclamationTriangle className="w-3 h-3 mr-1" />
                                Urgent
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="mr-2">{getStatusIcon(dispute.status)}</span>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(dispute.status)}`}>
                              {dispute.status.replace('-', ' ').charAt(0).toUpperCase() + dispute.status.replace('-', ' ').slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(dispute.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <FaCalendar className="mr-1 w-3 h-3" />
                            {getTimeSince(dispute.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(dispute)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-300 flex items-center"
                            >
                              <FaEye className="mr-2" />
                              View
                            </button>
                            
                            {dispute.status === 'pending' && (
                              <button
                                onClick={() => handleOpenDialog(dispute)}
                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-300 flex items-center"
                              >
                                <FaGavel className="mr-2" />
                                Resolve
                              </button>
                            )}
                            
                            {dispute.status === 'pending' && (
                              <button
                                onClick={() => handleEscalateDispute(dispute.id)}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-300 flex items-center"
                              >
                                <FaBan className="mr-2" />
                                Escalate
                              </button>
                            )}
                            
                            {dispute.status === 'resolved' && (
                              <button
                                onClick={() => handleArchiveDispute(dispute.id)}
                                className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-300 flex items-center"
                              >
                                <FaHistory className="mr-2" />
                                Archive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {currentDisputes.map((dispute) => (
                  <div key={dispute.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {dispute.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          <FaMoneyBill className="inline w-3 h-3 mr-1" />
                          ${dispute.amount?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(dispute.severity)}`}>
                          {dispute.severity}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dispute.status)}`}>
                          {dispute.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-600">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Client:</span>
                        <span>{dispute.client?.name}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Freelancer:</span>
                        <span>{dispute.freelancer?.name}</span>
                      </div>
                      <div className="mt-2 text-gray-500 italic">
                        "{dispute.disputeReason}"
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-500 flex items-center">
                        <FaCalendar className="mr-1" />
                        {getTimeSince(dispute.createdAt)}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(dispute)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs font-medium transition-colors duration-300 flex items-center"
                        >
                          <FaEye className="mr-1" />
                          View
                        </button>
                        
                        {dispute.status === 'pending' && (
                          <button
                            onClick={() => handleOpenDialog(dispute)}
                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs font-medium transition-colors duration-300 flex items-center"
                          >
                            <FaGavel className="mr-1" />
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-700">
                        Show
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="mx-2 border border-gray-300 rounded-md text-sm px-2 py-1"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                        per page
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(indexOfLastItem, filteredDisputes.length)}</span> of{' '}
                        <span className="font-medium">{filteredDisputes.length}</span> results
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <FaChevronLeft className="h-4 w-4" />
                        </button>
                        
                        <div className="hidden sm:flex space-x-1">
                          {[...Array(totalPages)].map((_, idx) => {
                            const pageNum = idx + 1;
                            if (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    currentPage === pageNum
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                            return null;
                          })}
                        </div>
                        
                        <div className="sm:hidden text-sm font-medium">
                          Page {currentPage} of {totalPages}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <FaChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Resolution Dialog */}
      {openDialog && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 flex items-center">
                  <FaGavel className="mr-2" />
                  Resolve Dispute
                </h3>
                <button
                  onClick={handleCloseDialog}
                  className="text-gray-400 hover:text-gray-500 p-1 transition-colors duration-200"
                >
                  <FaTimesCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dispute Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Project Title</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedDispute.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-bold text-blue-600">${selectedDispute.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Client</p>
                      <p className="text-sm font-medium text-gray-900">{selectedDispute.client?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Freelancer</p>
                      <p className="text-sm font-medium text-gray-900">{selectedDispute.freelancer?.name}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Dispute Reason</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedDispute.disputeReason}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Resolution Decision *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setResolution({ ...resolution, decision: 'refund' })}
                      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                        resolution.decision === 'refund'
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FaMoneyBill className="h-5 w-5 mb-2" />
                      <span className="text-xs font-medium">Partial Refund</span>
                      <span className="text-xs text-gray-500 mt-1">Split payment</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolution({ ...resolution, decision: 'release' })}
                      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                        resolution.decision === 'release'
                          ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FaCheckCircle className="h-5 w-5 mb-2" />
                      <span className="text-xs font-medium">Release Payment</span>
                      <span className="text-xs text-gray-500 mt-1">Full payment to freelancer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolution({ ...resolution, decision: 'cancel' })}
                      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                        resolution.decision === 'cancel'
                          ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FaTimesCircle className="h-5 w-5 mb-2" />
                      <span className="text-xs font-medium">Cancel Project</span>
                      <span className="text-xs text-gray-500 mt-1">Full refund to client</span>
                    </button>
                  </div>
                </div>

                {resolution.decision === 'refund' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Refund Percentage: {resolution.refundPercentage}%
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={resolution.refundPercentage}
                        onChange={(e) =>
                          setResolution({ ...resolution, refundPercentage: parseInt(e.target.value) })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0% (To Freelancer)</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100% (To Client)</span>
                      </div>
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Client will receive: <span className="font-bold">${Math.round(selectedDispute.amount * (resolution.refundPercentage / 100))}</span>
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Freelancer will receive: <span className="font-bold">${Math.round(selectedDispute.amount * ((100 - resolution.refundPercentage) / 100))}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Notes *
                  </label>
                  <textarea
                    rows="4"
                    value={resolution.notes}
                    onChange={(e) =>
                      setResolution({ ...resolution, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Provide detailed explanation of your decision. This will be visible to both parties..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required. These notes will be sent to both client and freelancer.
                  </p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResolveDispute}
                  disabled={!resolution.decision || !resolution.notes.trim()}
                  className={`w-full sm:w-auto px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ${
                    !resolution.decision || !resolution.notes.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow'
                  }`}
                >
                  Submit Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Dialog */}
      {viewingDetails && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 flex items-center">
                  <FaFileAlt className="mr-2" />
                  Dispute Details
                </h3>
                <button
                  onClick={handleCloseDialog}
                  className="text-gray-400 hover:text-gray-500 p-1 transition-colors duration-200"
                >
                  <FaTimesCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Project</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{selectedDispute.title}</p>
                    <p className="text-xs text-blue-600 mt-2">ID: {selectedDispute.id}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Amount</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">${selectedDispute.amount?.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-2">Project Budget</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium">Status</p>
                    <div className="flex items-center mt-1">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDispute.status)}`}>
                        {selectedDispute.status}
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 mt-2">Filed {getTimeSince(selectedDispute.createdAt)}</p>
                  </div>
                </div>

                {/* Parties Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <FaUserCheck className="mr-2" />
                      Client Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900">{selectedDispute.client?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{selectedDispute.client?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <FaUserCheck className="mr-2" />
                      Freelancer Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900">{selectedDispute.freelancer?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{selectedDispute.freelancer?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dispute Details */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-yellow-600" />
                    Dispute Reason
                  </h4>
                  <p className="text-sm text-gray-700">{selectedDispute.disputeReason}</p>
                  
                  <div className="mt-4">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Priority Level</h5>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedDispute.severity)}`}>
                        {selectedDispute.severity} Priority
                      </span>
                      {selectedDispute.urgency === 'high' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          <FaExclamationTriangle className="inline mr-1" />
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages/Communication */}
                {selectedDispute.messages && selectedDispute.messages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <FaComment className="mr-2" />
                      Communication History
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedDispute.messages.map((msg, index) => (
                        <div key={index} className={`p-3 rounded-lg ${msg.sender === 'client' ? 'bg-blue-50' : 'bg-green-50'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${msg.sender === 'client' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {msg.sender === 'client' ? 'Client' : 'Freelancer'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {getTimeSince(msg.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution History */}
                {disputeHistory.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <FaHistory className="mr-2" />
                      Resolution History
                    </h4>
                    <div className="space-y-3">
                      {disputeHistory.map((history, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-700">
                              {history.action}
                            </span>
                            <span className="text-xs text-gray-500">
                              {getTimeSince(history.timestamp)}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-xs text-gray-600 mt-2">{history.notes}</p>
                          )}
                          {history.resolvedBy && (
                            <p className="text-xs text-gray-500 mt-1">
                              Resolved by: {history.resolvedBy}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputeResolution;