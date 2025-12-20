// Enhanced Portfolio Component with React Icons
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaLink,
  FaImage,
  FaUpload,
  FaTimes,
  FaTag,
  FaExternalLinkAlt,
  FaEye,
  FaStar,
  FaGlobe,
  FaMobileAlt,
  FaPaintBrush,
  FaChartLine,
  FaBox,
  FaThLarge,
  FaList,
  FaSave,
  FaTimesCircle,
  FaCheck,
  FaArrowUp,
  FaSearch
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Portfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    image: null,
    skills: [],
    category: 'web',
    featured: false
  });
  const [skillInput, setSkillInput] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Projects', icon: <FaThLarge className="h-4 w-4" /> },
    { id: 'web', label: 'Web Development', icon: <FaGlobe className="h-4 w-4" /> },
    { id: 'mobile', label: 'Mobile Apps', icon: <FaMobileAlt className="h-4 w-4" /> },
    { id: 'design', label: 'UI/UX Design', icon: <FaPaintBrush className="h-4 w-4" /> },
    { id: 'marketing', label: 'Digital Marketing', icon: <FaChartLine className="h-4 w-4" /> },
    { id: 'other', label: 'Other', icon: <FaBox className="h-4 w-4" /> }
  ];

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      setPortfolioItems(response.data.portfolio || []);
    } catch (error) {
      toast.error('Error fetching portfolio');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = portfolioItems.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCloseDialog = () => {
  setDialogOpen(false);
  setEditItem(null);
  setFormData({
    title: '',
    description: '',
    url: '',
    image: null,
    skills: [],
    category: 'web',
    featured: false,
  });
  setPreviewImage(null);
  setSkillInput('');
};


  const handleSubmit = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error('Please enter a project title');
        return;
      }

      const portfolioData = {
        ...formData,
        image: formData.image instanceof File ? await convertToBase64(formData.image) : formData.image,
      };

      if (editItem) {
        await api.put(`api/users/portfolio/${editItem._id}`, portfolioData);
        toast.success('Portfolio item updated successfully');
      } else {
        await api.post('api/users/portfolio', portfolioData);
        toast.success('Portfolio item added successfully');
      }

      fetchPortfolio();
      handleCloseDialog();
    } catch (error) {
      toast.error('Error saving portfolio item');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                  <FaImage className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Portfolio
                </h1>
              </div>
              <p className="text-slate-600">Showcase your best work to attract clients</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FaThLarge className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FaList className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => setDialogOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2"
              >
                <FaPlus className="h-4 w-4" />
                Add Project
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects, skills, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilterCategory(category.id)}
                    className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                      filterCategory === category.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {category.icon}
                    <span className="font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Items */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-slate-200 rounded w-16"></div>
                  <div className="h-6 bg-slate-200 rounded w-20"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-8 bg-slate-200 rounded w-24"></div>
                  <div className="h-8 bg-slate-200 rounded w-8"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
              <FaImage className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No portfolio items found</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {searchQuery || filterCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Showcase your best work to attract more clients'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setDialogOpen(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2"
              >
                <FaPlus className="h-4 w-4" />
                Add Your First Project
              </button>
              {(searchQuery || filterCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('all');
                  }}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <FaTimes className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                      <FaImage className="h-16 w-16 text-slate-300" />
                    </div>
                  )}
                  {item.featured && (
                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                        <FaStar className="h-3 w-3" />
                        Featured
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 w-full">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditItem(item);
                            setFormData({
                              title: item.title || '',
                              description: item.description || '',
                              url: item.url || '',
                              image: item.image || null,
                              skills: item.skills || [],
                              category: item.category || 'web',
                              featured: item.featured || false
                            });
                            setPreviewImage(item.image || null);
                            setDialogOpen(true);
                          }}
                          className="flex-1 px-4 py-2 bg-white/90 backdrop-blur-sm text-slate-800 rounded-lg hover:bg-white transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                        >
                          <FaEdit className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this portfolio item?')) {
                              api.delete(`/users/portfolio/${item._id}`)
                                .then(() => {
                                  toast.success('Portfolio item deleted');
                                  fetchPortfolio();
                                })
                                .catch(() => toast.error('Error deleting portfolio item'));
                            }
                          }}
                          className="px-4 py-2 bg-rose-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-rose-600 transition-colors duration-200"
                        >
                          <FaTrash className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{item.title}</h3>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaExternalLinkAlt className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  {item.skills && item.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {item.skills.length > 3 && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                          +{item.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {categories.find(cat => cat.id === item.category)?.icon}
                      <span className="text-sm text-slate-500">
                        {categories.find(cat => cat.id === item.category)?.label}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setEditItem(item);
                        setFormData({
                          title: item.title || '',
                          description: item.description || '',
                          url: item.url || '',
                          image: item.image || null,
                          skills: item.skills || [],
                          category: item.category || 'web',
                          featured: item.featured || false
                        });
                        setPreviewImage(item.image || null);
                        setDialogOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image */}
                  <div className="lg:w-48 lg:h-48 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                        <FaImage className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-xl text-slate-800 mb-2">{item.title}</h3>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            {categories.find(cat => cat.id === item.category)?.icon}
                            <span className="text-sm text-slate-500">
                              {categories.find(cat => cat.id === item.category)?.label}
                            </span>
                          </div>
                          {item.featured && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-lg">
                              <FaStar className="h-3 w-3" />
                              <span className="text-sm font-medium">Featured</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditItem(item);
                            setFormData({
                              title: item.title || '',
                              description: item.description || '',
                              url: item.url || '',
                              image: item.image || null,
                              skills: item.skills || [],
                              category: item.category || 'web',
                              featured: item.featured || false
                            });
                            setPreviewImage(item.image || null);
                            setDialogOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors duration-200"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this portfolio item?')) {
                              api.delete(`/users/portfolio/${item._id}`)
                                .then(() => {
                                  toast.success('Portfolio item deleted');
                                  fetchPortfolio();
                                })
                                .catch(() => toast.error('Error deleting portfolio item'));
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors duration-200"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors duration-200"
                          >
                            <FaExternalLinkAlt className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-slate-600 mb-4">{item.description}</p>
                    
                    {item.skills && item.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditItem(item);
                          setFormData({
                            title: item.title || '',
                            description: item.description || '',
                            url: item.url || '',
                            image: item.image || null,
                            skills: item.skills || [],
                            category: item.category || 'web',
                            featured: item.featured || false
                          });
                          setPreviewImage(item.image || null);
                          setDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                      >
                        <FaEye className="h-4 w-4" />
                        View Details
                      </button>
                      {item.featured && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <FaArrowUp className="h-3 w-3" />
                          <span className="text-sm font-medium">Pinned to Top</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        {portfolioItems.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 text-center border border-slate-100">
              <div className="text-2xl font-bold text-blue-600 mb-1">{portfolioItems.length}</div>
              <div className="text-sm text-slate-600">Total Projects</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-slate-100">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {portfolioItems.filter(item => item.featured).length}
              </div>
              <div className="text-sm text-slate-600">Featured</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-slate-100">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {new Set(portfolioItems.flatMap(item => item.skills)).size}
              </div>
              <div className="text-sm text-slate-600">Unique Skills</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-slate-100">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {portfolioItems.filter(item => item.url).length}
              </div>
              <div className="text-sm text-slate-600">Live Projects</div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => handleCloseDialog()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {editItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
                    </h3>
                    <p className="text-slate-600 mt-1">
                      {editItem ? 'Update your project details' : 'Showcase your work to potential clients'}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseDialog}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                  >
                    <FaTimes className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter project title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        {categories.filter(cat => cat.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Describe your project, your role, and key achievements..."
                    />
                  </div>
                  
                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Project URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLink className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="pl-12 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                  
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Project Image
                    </label>
                    <label className="block cursor-pointer">
                      <div className={`border-2 border-dashed ${previewImage ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-blue-300'} rounded-xl p-6 text-center transition-all duration-200`}>
                        <div className="flex flex-col items-center">
                          <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                            <FaUpload className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className="font-medium text-slate-700">
                            {previewImage ? 'Image Selected' : 'Click to upload image'}
                          </span>
                          <span className="text-slate-500 text-sm mt-1">
                            PNG, JPG up to 5MB
                          </span>
                        </div>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('Image size should be less than 5MB');
                              return;
                            }
                            setFormData({ ...formData, image: file });
                            setPreviewImage(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    {previewImage && (
                      <div className="mt-4">
                        <p className="text-sm text-slate-600 mb-2">Preview:</p>
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              setFormData({ ...formData, image: null });
                              setPreviewImage(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600"
                          >
                            <FaTimes className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Skills & Technologies
                    </label>
                    <div className="flex gap-2 mb-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaTag className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                          placeholder="Add a skill (e.g., React, Node.js)"
                          className="pl-12 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
                            setFormData({
                              ...formData,
                              skills: [...formData.skills, skillInput.trim()],
                            });
                            setSkillInput('');
                          }
                        }}
                        className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center gap-2"
                      >
                        <FaPlus className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-lg"
                        >
                          <FaCheck className="h-3 w-3 text-emerald-500" />
                          {skill}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              skills: formData.skills.filter(s => s !== skill),
                            })}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaTimes className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Featured Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-800">Feature this project</p>
                      <p className="text-sm text-slate-600">
                        Featured projects appear first in your portfolio
                      </p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        formData.featured ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          formData.featured ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                  <button
                    onClick={handleCloseDialog}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium flex items-center gap-2"
                  >
                    <FaTimesCircle className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2"
                  >
                    <FaSave className="h-4 w-4" />
                    {editItem ? 'Update Project' : 'Add Project'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;