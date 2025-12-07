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
  FaMapMarkerAlt
} from 'react-icons/fa';
import { SiJavascript, SiReact, SiNodedotjs, SiPython, SiFlutter } from 'react-icons/si';

const BrowseProjects = () => {
  // State for projects data
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    budget: 'all',
    duration: 'all',
    skillLevel: 'all',
    sortBy: 'recent'
  });

  // Sample project data
  const sampleProjects = [
    {
      id: 1,
      title: 'E-commerce Website with React & Node.js',
      description: 'Build a modern e-commerce platform with real-time inventory management, payment gateway integration, and admin dashboard.',
      category: 'web',
      budget: '$5,000 - $10,000',
      duration: '3-4 weeks',
      postedDate: '2 days ago',
      bids: 24,
      skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      clientRating: 4.8,
      location: 'Remote',
      featured: true,
      saved: false,
      views: 125
    },
    {
      id: 2,
      title: 'Mobile App for Food Delivery Service',
      description: 'Create a responsive mobile application for food delivery with real-time tracking and payment integration.',
      category: 'mobile',
      budget: '$8,000 - $15,000',
      duration: '6-8 weeks',
      postedDate: '1 week ago',
      bids: 18,
      skills: ['React Native', 'Firebase', 'Google Maps API'],
      clientRating: 4.5,
      location: 'New York, USA',
      featured: true,
      saved: true,
      views: 89
    },
    {
      id: 3,
      title: 'Data Analytics Dashboard',
      description: 'Design and develop an interactive dashboard for business analytics with data visualization.',
      category: 'data',
      budget: '$3,000 - $6,000',
      duration: '2-3 weeks',
      postedDate: '3 days ago',
      bids: 32,
      skills: ['Python', 'Django', 'D3.js', 'PostgreSQL'],
      clientRating: 4.9,
      location: 'Remote',
      featured: false,
      saved: false,
      views: 156
    },
    {
      id: 4,
      title: 'UI/UX Design for SaaS Platform',
      description: 'Complete UI/UX design for a SaaS application including wireframes, prototypes, and design system.',
      category: 'design',
      budget: '$2,500 - $5,000',
      duration: '2 weeks',
      postedDate: '5 days ago',
      bids: 15,
      skills: ['Figma', 'Adobe XD', 'UI/UX Design'],
      clientRating: 4.7,
      location: 'London, UK',
      featured: false,
      saved: true,
      views: 67
    },
    {
      id: 5,
      title: 'AI Chatbot Development',
      description: 'Build an intelligent chatbot for customer support using natural language processing.',
      category: 'ai',
      budget: '$10,000 - $20,000',
      duration: '8-12 weeks',
      postedDate: '1 day ago',
      bids: 8,
      skills: ['Python', 'TensorFlow', 'NLP', 'FastAPI'],
      clientRating: 4.6,
      location: 'Remote',
      featured: true,
      saved: false,
      views: 92
    },
    {
      id: 6,
      title: 'WordPress E-learning Platform',
      description: 'Develop a comprehensive e-learning platform with course management and payment system.',
      category: 'web',
      budget: '$4,000 - $8,000',
      duration: '4-6 weeks',
      postedDate: '4 days ago',
      bids: 21,
      skills: ['WordPress', 'PHP', 'LMS', 'WooCommerce'],
      clientRating: 4.4,
      location: 'Remote',
      featured: false,
      saved: false,
      views: 78
    }
  ];

  // Categories
  const categories = [
    { id: 'all', name: 'All Projects', icon: <FaRocket />, color: 'bg-purple-500' },
    { id: 'web', name: 'Web Development', icon: <FaCode />, color: 'bg-blue-500' },
    { id: 'mobile', name: 'Mobile Apps', icon: <FaMobile />, color: 'bg-green-500' },
    { id: 'design', name: 'UI/UX Design', icon: <FaPaintBrush />, color: 'bg-pink-500' },
    { id: 'data', name: 'Data Science', icon: <FaDatabase />, color: 'bg-orange-500' },
    { id: 'ai', name: 'AI/ML', icon: <FaRocket />, color: 'bg-red-500' }
  ];

  // Tech stack icons mapping
  const techIcons = {
    'React': <SiReact className="text-blue-400" />,
    'Node.js': <SiNodedotjs className="text-green-500" />,
    'JavaScript': <SiJavascript className="text-yellow-400" />,
    'Python': <SiPython className="text-blue-500" />,
    'React Native': <SiReact className="text-blue-400" />,
    'Flutter': <SiFlutter className="text-blue-300" />
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setProjects(sampleProjects);
      setFilteredProjects(sampleProjects);
      setLoading(false);
    }, 1000);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...projects];

    // Search filter
    if (searchQuery) {
      result = result.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(project => project.category === selectedCategory);
    }

    // Budget filter
    if (filters.budget !== 'all') {
      // Add budget filter logic
    }

    // Duration filter
    if (filters.duration !== 'all') {
      // Add duration filter logic
    }

    // Skill level filter
    if (filters.skillLevel !== 'all') {
      // Add skill level filter logic
    }

    // Sorting
    if (filters.sortBy === 'recent') {
      result.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    } else if (filters.sortBy === 'budget') {
      result.sort((a, b) => parseFloat(b.budget.replace(/[^0-9]/g, '')) - parseFloat(a.budget.replace(/[^0-9]/g, '')));
    } else if (filters.sortBy === 'bids') {
      result.sort((a, b) => b.bids - a.bids);
    }

    setFilteredProjects(result);
  }, [searchQuery, selectedCategory, filters, projects]);

  const handleSaveProject = (projectId) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? { ...project, saved: !project.saved }
          : project
      )
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setFilters({
      budget: 'all',
      duration: 'all',
      skillLevel: 'all',
      sortBy: 'recent'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Find Your Next Project</h1>
          <p className="text-lg text-blue-100">Discover amazing projects from clients around the world</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 w-full">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, skills, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 font-medium"
            >
              <FaFilter />
              Filters
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
              >
                <option value="recent">Most Recent</option>
                <option value="budget">Highest Budget</option>
                <option value="bids">Most Bids</option>
              </select>
              <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                <select
                  value={filters.budget}
                  onChange={(e) => handleFilterChange('budget', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Budgets</option>
                  <option value="under5k">Under $5,000</option>
                  <option value="5k-10k">$5,000 - $10,000</option>
                  <option value="over10k">Over $10,000</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Any Duration</option>
                  <option value="short">Less than 1 month</option>
                  <option value="medium">1-3 months</option>
                  <option value="long">More than 3 months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                <select
                  value={filters.skillLevel}
                  onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <FaTimes />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-white shadow-lg transform scale-105'
                    : 'bg-white/50 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className={`p-3 rounded-lg ${category.color} text-white mb-3`}>
                  {category.icon}
                </div>
                <span className="font-medium text-gray-700 text-sm text-center">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory === 'all' ? 'All Projects' : categories.find(c => c.id === selectedCategory)?.name}
              <span className="text-gray-500 text-lg font-normal ml-2">
                ({filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-6"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    project.featured ? 'border-l-4 border-blue-500' : ''
                  }`}
                >
                  {/* Project Header */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                          project.featured
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {project.featured ? '⭐ Featured' : 'Open'}
                        </span>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                          {project.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleSaveProject(project.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <FaHeart className={project.saved ? 'text-red-500 fill-current' : ''} />
                      </button>
                    </div>

                    {/* Project Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Skills/Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                          {techIcons[skill] || <FaCode className="text-gray-500" />}
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                          +{project.skills.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Project Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <FaDollarSign className="text-green-500" />
                            {project.budget}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="text-orange-500" />
                            {project.duration}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <FaUsers className="text-blue-500" />
                          {project.bids} bids
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-500" />
                          <span>{project.clientRating}</span>
                          <span className="text-gray-400">({project.bids})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          <span>{project.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Posted Date and Views */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                      <span>Posted {project.postedDate}</span>
                      <div className="flex items-center gap-1">
                        <FaEye />
                        {project.views} views
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-gray-50 px-6 py-4 flex justify-between">
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium text-sm">
                      Submit Proposal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">5,000+</div>
              <div className="text-gray-300">Active Projects</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">$2.5M+</div>
              <div className="text-gray-300">Paid to Freelancers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">10,000+</div>
              <div className="text-gray-300">Registered Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">4.9/5</div>
              <div className="text-gray-300">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseProjects;