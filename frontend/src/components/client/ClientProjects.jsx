import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  FaPlus,
  FaCalendar,
  FaMoneyBill,
  FaUsers,
  FaClock,
  FaBriefcase,
} from 'react-icons/fa';

const ClientProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
     const response = await api.get('/api/projects/client/my-projects');
      setProjects(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

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

  const getStatusBadgeClass = (status) => {
    const map = {
      open: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border border-blue-200',
      completed: 'bg-green-100 text-green-800 border border-green-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200',
      pending: 'bg-purple-100 text-purple-800 border border-purple-200',
    };
    return map[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Posted Projects
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage all projects you have posted on FreelancePro
            </p>
          </div>
          <Link
            to="/client/post-project"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm sm:text-base"
          >
            <FaPlus className="mr-2" />
            Post New Project
          </Link>
        </div>

        {loading ? (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
            <FaBriefcase className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">
              You haven&apos;t posted any projects yet
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Ready to get work done? Post your first project and start
              receiving proposals from freelancers.
            </p>
            <Link
              to="/client/post-project"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <FaPlus className="mr-2" />
              Post a Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/project/${project._id}`}
                className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {project.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        project.status
                      )}`}
                    >
                      {project.status?.replace('-', ' ') || 'unknown'}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {getBudgetLabel(project)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center">
                    <FaCalendar className="mr-1" />
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                  {project.deadline && (
                    <span className="inline-flex items-center">
                      <FaClock className="mr-1" />
                      Deadline:{' '}
                      {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  )}
                  <span className="inline-flex items-center">
                    <FaMoneyBill className="mr-1" />
                    Budget type:{' '}
                    {project.budgetType
                      ? project.budgetType.toUpperCase()
                      : 'N/A'}
                  </span>
                  <span className="inline-flex items-center">
                    <FaUsers className="mr-1" />
                    {project.bids?.length || 0} bids
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProjects;
