import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaFilter,
  FaCode,
  FaPaintBrush,
  FaMobile,
  FaDatabase,
  FaStar,
  FaClock,
  FaDollarSign,
  FaHeart,
  FaEye,
  FaTimes,
  FaRocket,
  FaUsers,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import {
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiPython,
  SiFlutter,
} from 'react-icons/si';
import api from '../../services/api';

const BrowseProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedProjects, setAppliedProjects] = useState(new Set());

  const [filters, setFilters] = useState({
    sortBy: 'recent',
  });

  /* -------------------- HELPERS -------------------- */

  const formatBudget = (budget) => {
    if (!budget) return 'N/A';

    if (typeof budget === 'number') return `$${budget}`;

    if (typeof budget === 'object') {
      if (budget.fixed) return `$${budget.fixed}`;
      if (budget.min && budget.max)
        return `$${budget.min} - $${budget.max}`;
    }

    return 'N/A';
  };

  const formatDate = (date) => {
    if (!date) return 'Recently';
    return new Date(date).toLocaleDateString();
  };

  /* -------------------- DATA FETCH -------------------- */

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const params = {
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      };

      const res = await api.get('/projects', { params });

      setProjects(res.data.projects || []);
      setFilteredProjects(res.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, selectedCategory]);

  /* -------------------- SORT -------------------- */

  useEffect(() => {
    let result = [...projects];

    if (filters.sortBy === 'recent') {
      result.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    setFilteredProjects(result);
  }, [filters, projects]);

  const handleApply = async (projectId) => {
    try {
      setApplyingId(projectId);

      await api.post('/bids', {
        projectId,
        proposal: 'I am interested in this project',
        bidAmount: 0,
        estimatedTime: '1 week',
      });

      setAppliedProjects((prev) => new Set(prev).add(projectId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplyingId(null);
    }
  };


  const fetchAppliedStatus = async (projects) => {
    try {
      const appliedSet = new Set();

      await Promise.all(
        projects.map(async (p) => {
          const res = await api.get(`/bids/applied/${p._id}`);
          if (res.data.applied) appliedSet.add(p._id);
        })
      );

      setAppliedProjects(appliedSet);
    } catch (err) {
      console.error('Failed to check applied status');
    }
  };

  useEffect(() => {
    if (projects.length) fetchAppliedStatus(projects);
  }, [projects]);



  /* -------------------- UI DATA -------------------- */

  const categories = [
    { id: 'all', name: 'All Projects', icon: <FaRocket /> },
    { id: 'web-development', name: 'Web Development', icon: <FaCode /> },
    { id: 'mobile-app', name: 'Mobile Apps', icon: <FaMobile /> },
    { id: 'graphic-design', name: 'UI/UX Design', icon: <FaPaintBrush /> },
    { id: 'data-science', name: 'Data Science', icon: <FaDatabase /> },
    { id: 'ai-ml', name: 'AI / ML', icon: <FaRocket /> },
  ];



  const techIcons = {
    React: <SiReact className="text-blue-400" />,
    'Node.js': <SiNodedotjs className="text-green-500" />,
    JavaScript: <SiJavascript className="text-yellow-400" />,
    Python: <SiPython className="text-blue-500" />,
    Flutter: <SiFlutter className="text-blue-300" />,
  };

  /* -------------------- RENDER -------------------- */

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <h1 className="text-4xl font-bold text-center">
          Browse Projects
        </h1>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
          <input
            className="flex-1 border px-4 py-2 rounded"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({ sortBy: e.target.value })
            }
            className="border px-4 py-2 rounded"
          >
            <option value="recent">Most Recent</option>
          </select>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 rounded shadow ${selectedCategory === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-white'
                }`}
            >
              <div className="flex items-center gap-2">
                {cat.icon}
                <span>{cat.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Projects */}
        {loading ? (
          <p className="text-center">Loading projects...</p>
        ) : filteredProjects.length === 0 ? (
          <p className="text-center text-gray-500">
            No projects found
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="font-bold text-lg mb-2">
                  {project.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3">
                  {project.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(project.skills || []).slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                    >
                      {techIcons[skill] || <FaCode />}
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Details */}
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <FaDollarSign className="text-green-500" />
                    {formatBudget(project.budget)}
                  </div>

                  <div className="flex items-center gap-2">
                    <FaClock className="text-orange-500" />
                    {project.duration || 'N/A'}
                  </div>

                  <div className="flex items-center gap-2">
                    <FaUsers className="text-blue-500" />
                    {project.bids?.length || 0} bids
                  </div>

                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt />
                    {project.client?.name || 'Client'}
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500 flex justify-between">
                  <span>
                    Posted {formatDate(project.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaEye /> {project.views || 0}
                  </span>
                </div>

                <div className="mt-4 flex justify-between">
                  <button className="px-4 py-2 bg-gray-200 rounded">
                    View
                  </button>
                  <button
                    disabled={appliedProjects.has(project._id) || applyingId === project._id}
                    onClick={() => handleApply(project._id)}
                    className={`px-4 py-2 rounded font-medium transition
    ${appliedProjects.has(project._id)
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : applyingId === project._id
                          ? 'bg-gray-400 text-white cursor-wait'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }
  `}
                  >
                    {appliedProjects.has(project._id)
                      ? 'Applied'
                      : applyingId === project._id
                        ? 'Applying...'
                        : 'Apply'}
                  </button>


                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseProjects;
