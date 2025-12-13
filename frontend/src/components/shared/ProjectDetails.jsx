import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import {
  FaMoneyBillWave,
  FaClock,
  FaTag,
  FaUser,
  FaBriefcase,
  FaCheckCircle,
  FaComment,
  FaArrowLeft,
  FaDollarSign,
  FaCalendar
} from 'react-icons/fa';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectDialogOpen, setSelectDialogOpen] = useState(false);
  const [bidData, setBidData] = useState({
    proposal: '',
    bidAmount: '',
    estimatedTime: { value: '', unit: 'days' },
  });
  const [selectedBid, setSelectedBid] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectRes, bidsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/bids/project/${id}`),
      ]);

      setProject(projectRes.data);
      setBids(bidsRes.data);
    } catch (error) {
      toast.error('Error fetching project details');
      navigate(user?.role === 'client' ? '/client/projects' : '/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async () => {
    try {
      await api.post('/bids', {
        projectId: id,
        ...bidData,
        bidAmount: Number(bidData.bidAmount),
      });
      toast.success('Bid submitted successfully');
      setBidDialogOpen(false);
      fetchProjectDetails();
      setBidData({
        proposal: '',
        bidAmount: '',
        estimatedTime: { value: '', unit: 'days' },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting bid');
    }
  };

  const handleSelectFreelancer = async () => {
    try {
      if (!selectedBid?._id) {
        toast.error('No bid selected');
        return;
      }

      await api.put(`/bids/${selectedBid._id}/accept`);
      toast.success('Freelancer selected successfully');
      setSelectDialogOpen(false);
      fetchProjectDetails();
    } catch (error) {
      console.error('handleSelectFreelancer error:', error);
      toast.error(error.response?.data?.message || 'Error selecting freelancer');
    }
  };

  const canBid = user?.role === 'freelancer' && project?.status === 'open';
  const isClient = user?.role === 'client' && project?.client?._id === user?._id;

  const getBudgetHeaderLabel = () => {
    if (!project) return '';
    const budget = project.budget || {};

    if (project.budgetType === 'fixed') {
      const value = budget.fixed ?? budget.agreed ?? 0;
      return `$${value}`;
    }

    if (project.budgetType === 'hourly') {
      const { min, max } = budget;
      if (min && max) return `$${min} - $${max}/hr`;
      if (min) return `From $${min}/hr`;
      if (max) return `Up to $${max}/hr`;
      return 'Hourly rate';
    }

    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() =>
            navigate(user?.role === 'client' ? '/client/projects' : '/projects')
          }
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 sm:mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Projects
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Project Header */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    <FaUser className="mr-1" />
                    {project.client?.name}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <FaTag className="mr-1" />
                    {project.category.replace('-', ' ')}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      project.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : project.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold text-blue-600">
                  {getBudgetHeaderLabel()}
                </div>
                <div className="text-sm text-gray-600 flex items-center justify-end">
                  <FaClock className="mr-1" />
                  {project.duration}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Project Details
              </button>
              <button
                onClick={() => setActiveTab('bids')}
                className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === 'bids'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Bids ({bids.length})
              </button>
              {(isClient || project.selectedFreelancer) && (
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap ${
                    activeTab === 'chat'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Chat
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      Description
                    </h2>
                    <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                      {project.description}
                    </div>
                  </div>

                  {project.skills?.length > 0 && (
                    <div className="mt-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        Required Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Project Details
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">
                            Budget Type
                          </div>
                          <div className="font-medium capitalize">
                            {project.budgetType}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-medium">{project.duration}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaBriefcase className="text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Bids</div>
                          <div className="font-medium">{bids.length}</div>
                        </div>
                      </div>
                      {project.deadline && (
                        <div className="flex items-center">
                          <FaCalendar className="text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Deadline
                            </div>
                            <div className="font-medium">
                              {new Date(
                                project.deadline
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">
                            Client Rating
                          </div>
                          <div className="font-medium">
                            {project.client?.rating || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {canBid && (
                      <button
                        onClick={() => setBidDialogOpen(true)}
                        className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                      >
                        Submit Bid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bids Tab */}
            {activeTab === 'bids' && (
              <div>
                {bids.length === 0 ? (
                  <div className="text-center py-12">
                    <FaBriefcase className="text-gray-400 text-4xl mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No bids yet
                    </h3>
                    <p className="text-gray-600">
                      Be the first to bid on this project!
                    </p>
                    {canBid && (
                      <button
                        onClick={() => setBidDialogOpen(true)}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Submit First Bid
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <div key={bid._id} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              {bid.freelancer?.avatar ? (
                                <img
                                  src={bid.freelancer.avatar}
                                  alt={bid.freelancer.name}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <FaUser className="text-blue-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {bid.freelancer?.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-sm text-gray-600">
                                  Rating:{' '}
                                  {bid.freelancer?.rating || 'N/A'}
                                </span>
                                <span className="text-sm font-medium text-green-600">
                                  ${bid.bidAmount}
                                </span>
                                {bid.estimatedTime && (
                                  <span className="text-sm text-gray-600">
                                    {bid.estimatedTime.value}{' '}
                                    {bid.estimatedTime.unit}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isClient && project.status === 'open' && (
                            <button
                              onClick={() => {
                                setSelectedBid(bid);
                                setSelectDialogOpen(true);
                              }}
                              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            >
                              Select
                            </button>
                          )}
                        </div>
                        <div className="mt-4 text-gray-600 whitespace-pre-line">
                          {bid.proposal}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="text-center py-12">
                <FaComment className="text-gray-400 text-4xl mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chat Feature Coming Soon!
                </h3>
                <p className="text-gray-600">
                  We're working on bringing you a seamless chat experience.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bid Dialog */}
      {bidDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Submit Your Bid
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Proposal
                </label>
                <textarea
                  value={bidData.proposal}
                  onChange={(e) =>
                    setBidData({ ...bidData, proposal: e.target.value })
                  }
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bid Amount ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={bidData.bidAmount}
                    onChange={(e) =>
                      setBidData({ ...bidData, bidAmount: e.target.value })
                    }
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Time
                  </label>
                  <input
                    type="number"
                    value={bidData.estimatedTime.value}
                    onChange={(e) =>
                      setBidData({
                        ...bidData,
                        estimatedTime: {
                          ...bidData.estimatedTime,
                          value: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={bidData.estimatedTime.unit}
                    onChange={(e) =>
                      setBidData({
                        ...bidData,
                        estimatedTime: {
                          ...bidData.estimatedTime,
                          unit: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setBidDialogOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitBid}
                disabled={!bidData.proposal || !bidData.bidAmount}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select Freelancer Dialog */}
      {selectDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Freelancer
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to select{' '}
              {selectedBid?.freelancer?.name} for this project?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectDialogOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSelectFreelancer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
