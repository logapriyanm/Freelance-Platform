// frontend/src/components/shared/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { updateProfile, getProfile } from '../../redux/slices/authSlice';
import {
  FaEdit,
  FaPlus,
  FaTrash,
  FaUpload,
  FaBriefcase,
  FaGraduationCap,
  FaGlobe,
  FaSave,
  FaTimes,
  FaLink,
  FaTag,
  FaUser,
} from 'react-icons/fa';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('personal');
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    title: '',
    hourlyRate: '',
    skills: [],
    portfolio: [],
    experience: [],
    education: [],
    languages: [],
    location: '',
    phone: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    url: '',
  });
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });
  const [newEducation, setNewEducation] = useState({
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });
  const [newLanguage, setNewLanguage] = useState('');

  // Load current user profile if not present
  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  // When user in store changes, sync to local state
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        title: user.title || '',
        hourlyRate: user.hourlyRate || 0,
        skills: user.skills || [],
        portfolio: user.portfolio || [],
        experience: user.experience || [],
        education: user.education || [],
        languages: user.languages || [],
        location: user.location || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(profileData)).unwrap();
      toast.success('Profile updated successfully');
      setEditMode(false);
      dispatch(getProfile());
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    }
  };

  // === Skills ===
  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  // === Portfolio ===
  const handleAddPortfolioItem = () => {
    if (newPortfolioItem.title.trim()) {
      setProfileData({
        ...profileData,
        portfolio: [...profileData.portfolio, { ...newPortfolioItem }],
      });
      setNewPortfolioItem({ title: '', description: '', url: '' });
    }
  };

  const handleRemovePortfolioItem = (index) => {
    setProfileData({
      ...profileData,
      portfolio: profileData.portfolio.filter((_, i) => i !== index),
    });
  };

  // === Experience ===
  const handleAddExperience = () => {
    if (newExperience.title.trim() && newExperience.company.trim()) {
      setProfileData({
        ...profileData,
        experience: [...profileData.experience, { ...newExperience }],
      });
      setNewExperience({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      });
    }
  };

  const handleRemoveExperience = (index) => {
    setProfileData({
      ...profileData,
      experience: profileData.experience.filter((_, i) => i !== index),
    });
  };

  // === Education ===
  const handleAddEducation = () => {
    if (newEducation.school.trim() && newEducation.degree.trim()) {
      setProfileData({
        ...profileData,
        education: [...profileData.education, { ...newEducation }],
      });
      setNewEducation({
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      });
    }
  };

  const handleRemoveEducation = (index) => {
    setProfileData({
      ...profileData,
      education: profileData.education.filter((_, i) => i !== index),
    });
  };

  // === Languages ===
  const handleAddLanguage = () => {
    if (
      newLanguage.trim() &&
      !profileData.languages.includes(newLanguage.trim())
    ) {
      setProfileData({
        ...profileData,
        languages: [...profileData.languages, newLanguage.trim()],
      });
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (languageToRemove) => {
    setProfileData({
      ...profileData,
      languages: profileData.languages.filter(
        (lang) => lang !== languageToRemove
      ),
    });
  };

  // Loading state
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Please login to view your profile.
          </p>
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ========= Tab Renderers =========

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Picture */}
        <div className="lg:w-1/3">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl text-gray-400">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            {editMode && (
              <label className="cursor-pointer">
                <div className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2">
                  <FaUpload />
                  Upload Photo
                </div>
                {/* NOTE: currently only UI – to actually upload, wire this into a FormData-based updateProfile later */}
                <input type="file" className="hidden" accept="image/*" />
              </label>
            )}
          </div>
        </div>

        {/* Personal Info Form */}
        <div className="lg:w-2/3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) =>
                  setProfileData({ ...profileData, location: e.target.value })
                }
                disabled={!editMode}
                placeholder="City, Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                disabled={!editMode}
                placeholder="Phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Title
            </label>
            <input
              type="text"
              value={profileData.title}
              onChange={(e) =>
                setProfileData({ ...profileData, title: e.target.value })
              }
              disabled={!editMode}
              placeholder="e.g., Senior Web Developer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) =>
                setProfileData({ ...profileData, bio: e.target.value })
              }
              disabled={!editMode}
              rows="4"
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate ($)
            </label>
            <input
              type="number"
              value={profileData.hourlyRate}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  hourlyRate: e.target.value,
                })
              }
              disabled={!editMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Skills &amp; Expertise</h3>

      {editMode && (
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
          </div>
          <button
            onClick={handleAddSkill}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Add
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {profileData.skills.length > 0 ? (
          profileData.skills.map((skill, index) => (
            <div
              key={index}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {skill}
              {editMode && (
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No skills added yet.</p>
        )}
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>

      {editMode && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Add Portfolio Item</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={newPortfolioItem.title}
              onChange={(e) =>
                setNewPortfolioItem({
                  ...newPortfolioItem,
                  title: e.target.value,
                })
              }
              placeholder="Project Title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <textarea
              value={newPortfolioItem.description}
              onChange={(e) =>
                setNewPortfolioItem({
                  ...newPortfolioItem,
                  description: e.target.value,
                })
              }
              placeholder="Project Description"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="url"
              value={newPortfolioItem.url}
              onChange={(e) =>
                setNewPortfolioItem({
                  ...newPortfolioItem,
                  url: e.target.value,
                })
              }
              placeholder="Project URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddPortfolioItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <FaPlus />
              Add Item
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profileData.portfolio.length > 0 ? (
          profileData.portfolio.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                {editMode && (
                  <button
                    onClick={() => handleRemovePortfolioItem(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.description}
              </p>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <FaLink className="mr-1" />
                  View Project
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-2">
            No portfolio items added yet.
          </p>
        )}
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>

      {editMode && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Add Experience</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newExperience.title}
              onChange={(e) =>
                setNewExperience({ ...newExperience, title: e.target.value })
              }
              placeholder="Job Title"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={newExperience.company}
              onChange={(e) =>
                setNewExperience({ ...newExperience, company: e.target.value })
              }
              placeholder="Company"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={newExperience.location}
              onChange={(e) =>
                setNewExperience({
                  ...newExperience,
                  location: e.target.value,
                })
              }
              placeholder="Location"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={newExperience.startDate}
              onChange={(e) =>
                setNewExperience({
                  ...newExperience,
                  startDate: e.target.value,
                })
              }
              placeholder="Start Date (MM/YYYY)"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={newExperience.endDate}
              onChange={(e) =>
                setNewExperience({ ...newExperience, endDate: e.target.value })
              }
              placeholder="End Date (MM/YYYY)"
              disabled={newExperience.current}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={newExperience.current}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    current: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                I currently work here
              </label>
            </div>
          </div>
          <textarea
            value={newExperience.description}
            onChange={(e) =>
              setNewExperience({
                ...newExperience,
                description: e.target.value,
              })
            }
            placeholder="Description"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddExperience}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <FaBriefcase />
            Add Experience
          </button>
        </div>
      )}

      <div className="space-y-4">
        {profileData.experience.length > 0 ? (
          profileData.experience.map((exp, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{exp.title}</h4>
                  <p className="text-sm text-gray-600">
                    {exp.company} • {exp.location}
                  </p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  )}
                </div>
                {editMode && (
                  <button
                    onClick={() => handleRemoveExperience(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No experience added yet.</p>
        )}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Education</h3>

      {editMode && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Add Education</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newEducation.school}
              onChange={(e) =>
                setNewEducation({ ...newEducation, school: e.target.value })
              }
              placeholder="School/University"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={newEducation.degree}
              onChange={(e) =>
                setNewEducation({ ...newEducation, degree: e.target.value })
              }
              placeholder="Degree"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={newEducation.field}
              onChange={(e) =>
                setNewEducation({ ...newEducation, field: e.target.value })
              }
              placeholder="Field of Study"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={newEducation.startDate}
              onChange={(e) =>
                setNewEducation({
                  ...newEducation,
                  startDate: e.target.value,
                })
              }
              placeholder="Start Date (YYYY)"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={newEducation.endDate}
              onChange={(e) =>
                setNewEducation({ ...newEducation, endDate: e.target.value })
              }
              placeholder="End Date (YYYY)"
              disabled={newEducation.current}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={newEducation.current}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    current: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                Currently attending
              </label>
            </div>
          </div>
          <textarea
            value={newEducation.description}
            onChange={(e) =>
              setNewEducation({
                ...newEducation,
                description: e.target.value,
              })
            }
            placeholder="Description (Achievements, courses, etc.)"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddEducation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <FaGraduationCap />
            Add Education
          </button>
        </div>
      )}

      <div className="space-y-4">
        {profileData.education.length > 0 ? (
          profileData.education.map((edu, index) => (
            <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{edu.school}</h4>
                  <p className="text-sm text-gray-600">
                    {edu.degree} in {edu.field}
                  </p>
                  <p className="text-sm text-gray-500">
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </p>
                  {edu.description && (
                    <p className="text-gray-700 mt-2">{edu.description}</p>
                  )}
                </div>
                {editMode && (
                  <button
                    onClick={() => handleRemoveEducation(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No education added yet.</p>
        )}
      </div>
    </div>
  );

  const renderLanguages = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Languages</h3>

      {editMode && (
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add a language"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLanguage();
                }
              }}
            />
          </div>
          <button
            onClick={handleAddLanguage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <FaGlobe />
            Add
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {profileData.languages.length > 0 ? (
          profileData.languages.map((language, index) => (
            <div
              key={index}
              className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {language}
              {editMode && (
                <button
                  onClick={() => handleRemoveLanguage(language)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No languages added yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-4 sm:p-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Profile
              </h1>
              <p className="text-gray-600 mt-1">
                {user.role === 'freelancer'
                  ? 'Freelancer Profile'
                  : user.role === 'client'
                  ? 'Client Profile'
                  : 'Admin Profile'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditMode((prev) => !prev)}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                editMode
                  ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {editMode ? (
                <>
                  <FaTimes className="mr-2" />
                  Cancel Editing
                </>
              ) : (
                <>
                  <FaEdit className="mr-2" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b mb-6 overflow-x-auto">
            <div className="flex space-x-8">
              {[
                {
                  id: 'personal',
                  label: 'Personal Info',
                  icon: <FaUser className="mr-2" />,
                },
                {
                  id: 'skills',
                  label: 'Skills',
                  icon: <FaTag className="mr-2" />,
                },
                {
                  id: 'portfolio',
                  label: 'Portfolio',
                  icon: <FaLink className="mr-2" />,
                },
                {
                  id: 'experience',
                  label: 'Experience',
                  icon: <FaBriefcase className="mr-2" />,
                },
                {
                  id: 'education',
                  label: 'Education',
                  icon: <FaGraduationCap className="mr-2" />,
                },
                {
                  id: 'languages',
                  label: 'Languages',
                  icon: <FaGlobe className="mr-2" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-3 font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'personal' && renderPersonalInfo()}
            {activeTab === 'skills' && renderSkills()}
            {activeTab === 'portfolio' && renderPortfolio()}
            {activeTab === 'experience' && renderExperience()}
            {activeTab === 'education' && renderEducation()}
            {activeTab === 'languages' && renderLanguages()}
          </div>

          {/* Save Button */}
          {editMode && (
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    // reset form back to current user values
                    if (user) {
                      setProfileData({
                        name: user.name || '',
                        email: user.email || '',
                        bio: user.bio || '',
                        title: user.title || '',
                        hourlyRate: user.hourlyRate || 0,
                        skills: user.skills || [],
                        portfolio: user.portfolio || [],
                        experience: user.experience || [],
                        education: user.education || [],
                        languages: user.languages || [],
                        location: user.location || '',
                        phone: user.phone || '',
                      });
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <FaSave />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
