import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  FaSearch,
  FaFilter,
  FaEllipsisV,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaArrowRight
} from 'react-icons/fa';

const FreelancerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [menuOpen, setMenuOpen] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      // only send non-empty filters
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      // const queryString = params.toString();
      const url = 
        
         `/freelancer/projects`;

      const response = await api.get(url);
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error?.response?.data || error.message);
      toast.error(error?.response?.data?.message || 'Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (projectId) => {
    setMenuOpen(menuOpen === projectId ? null : projectId);
    setSelectedProject(projects.find(p => p._id === projectId));
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`api/projects/${selectedProject._id}`);
      toast.success('Project deleted successfully');
      fetchProjects();
      setMenuOpen(null);
    } catch (error) {
      console.error('Error deleting project:', error?.response?.data || error.message);
      toast.error(error?.response?.data?.message || 'Error deleting project');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatBudget = (budget) => {
    if (!budget) return 'N/A';
    if (budget.fixed) {
      return `$${budget.fixed}`;
    }
    if (budget.min != null && budget.max != null) {
      return `$${budget.min} - $${budget.max}`;
    }
    return 'N/A';
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Projects</h1>
        <Link
          to="/post-project"
          className="inline-flex items-center px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
        >
          <FaPlus className="mr-2" />
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Projects"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchProjects}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <FaFilter className="mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && (
          <div className="py-6 text-center text-gray-500 text-sm">
            Loading projects...
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Title
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Bids
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Created
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.title}</div>
                    <div className="sm:hidden text-sm text-gray-500 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {project.category?.replace('-', ' ') || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatBudget(project.budget)}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                    <div className="text-sm text-gray-900">
                      {project.bids?.length || 0}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                    <div className="text-sm text-gray-900">
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString()
                        : '—'}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 relative">
                    <button
                      onClick={() => handleMenuClick(project._id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <FaEllipsisV className="h-5 w-5 text-gray-400" />
                    </button>

                    {menuOpen === project._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border">
                        <Link
                          to={`/projects/${project._id}`}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setMenuOpen(null)}
                        >
                          <FaEye className="mr-3 text-gray-400" />
                          View Details
                        </Link>
                        <button
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setMenuOpen(null)}
                        >
                          <FaEdit className="mr-3 text-gray-400" />
                          Edit Project
                        </button>
                        <button
                          onClick={handleDeleteProject}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <FaTrash className="mr-3" />
                          Delete Project
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerProjects;
