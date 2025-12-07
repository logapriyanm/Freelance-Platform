import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  FaStar,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBill,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaCheckCircle,
  FaUser,
} from 'react-icons/fa';

const FreelancerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${id}`);
        setFreelancer(res.data);
      } catch (error) {
        console.error('Error fetching freelancer details:', error);
        toast.error(error.message || 'Error fetching freelancer details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFreelancer();
    }
  }, [id]);

// inside FreelancerDetails.jsx

const handleContact = async () => {
  if (!currentUser) {
    toast.error('Please login to contact a freelancer');
    navigate('/login');
    return;
  }

  if (currentUser._id === freelancer?._id) {
    toast.error('You cannot start a conversation with yourself');
    return;
  }

  try {
    setContactLoading(true);
    // ✅ FIXED: add /api prefix
    const res = await api.post('/api/chat', {
      participantId: freelancer._id,
      projectId: null
    });

    if (res.data) {
      toast.success('Conversation started! Opening chat...');
      navigate('/chat');
    }
  } catch (error) {
    console.error('Error starting chat:', error);
    toast.error(error.message || 'Unable to start conversation');
  } finally {
    setContactLoading(false);
  }
};


  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading freelancer details...</p>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 font-medium mb-2">Freelancer not found</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Browse other freelancers
          </button>
        </div>
      </div>
    );
  }

  const {
    name,
    title,
    bio,
    skills = [],
    location,
    rating,
    totalReviews,
    hourlyRate,
    experience,
    languages = [],
    website,
    email,
    phone,
    yearsExperience,
    createdAt,
    portfolio = [],
  } = freelancer;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Profile */}
        <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                {name?.charAt(0)?.toUpperCase() || <FaUser />}
              </div>
              {freelancer.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs border-2 border-white">
                  <FaCheckCircle />
                </div>
              )}
            </div>

            <h1 className="text-xl font-semibold text-slate-900">{name}</h1>
            {title && <p className="text-sm text-slate-500 mt-1">{title}</p>}

            <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-500">
              {location && (
                <span className="inline-flex items-center gap-1">
                  <FaMapMarkerAlt className="text-red-400" />
                  {location}
                </span>
              )}
              {yearsExperience && (
                <span className="inline-flex items-center gap-1">
                  <FaCalendarAlt className="text-blue-400" />
                  {yearsExperience}+ yrs exp
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1 text-yellow-400">
                <FaStar />
                <span className="font-semibold text-sm text-slate-900">
                  {rating ? rating.toFixed(1) : 'New'}
                </span>
              </div>
              {typeof totalReviews === 'number' && (
                <span className="text-xs text-slate-500">
                  ({totalReviews} review{totalReviews === 1 ? '' : 's'})
                </span>
              )}
            </div>

            {/* Rate */}
            {hourlyRate && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                <FaMoneyBill className="text-blue-500" />
                ${hourlyRate}/hr
              </div>
            )}

            {/* Contact buttons */}
            <div className="mt-5 w-full space-y-2">
              <button
                onClick={handleContact}
                disabled={contactLoading}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                <FaEnvelope className="mr-2" />
                {contactLoading ? 'Starting chat...' : 'Contact Freelancer'}
              </button>

              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <FaGlobe className="mr-2" />
                  View Portfolio Website
                </a>
              )}
            </div>

            {/* Contact details (for client trust, but safe to show) */}
            <div className="mt-4 w-full text-left text-xs text-slate-500 space-y-1">
              {email && (
                <p className="flex items-center gap-2">
                  <FaEnvelope className="text-slate-400" />
                  <span className="truncate">{email}</span>
                </p>
              )}
              {phone && (
                <p className="flex items-center gap-2">
                  <FaPhone className="text-slate-400" />
                  <span className="truncate">{phone}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: About, skills, experience */}
        <div className="md:col-span-2 space-y-5">
          {/* About */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">About</h2>
            <p className="text-sm text-slate-600 whitespace-pre-line">
              {bio || 'This freelancer has not added a bio yet.'}
            </p>
          </div>

          {/* Skills & languages */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <FaBriefcase className="text-blue-500" />
                Skills
              </h3>
              {skills && skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No skills added yet.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Languages</h3>
              {languages && languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 text-[11px] font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No languages listed.</p>
              )}
            </div>
          </div>

          {/* Experience / projects */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FaCalendarAlt className="text-purple-500" />
              Experience
            </h3>
            {experience && experience.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-600">
                {experience.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                No detailed experience information has been added yet.
              </p>
            )}
          </div>

          {/* Portfolio preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Portfolio</h3>
            {portfolio && portfolio.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {portfolio.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-100 rounded-xl p-3 hover:border-blue-200 hover:shadow-sm transition"
                  >
                    <p className="text-xs font-semibold text-slate-900 mb-1">
                      {item.title || 'Project'}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-3">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No portfolio items added yet.</p>
            )}
          </div>

          {/* Meta info */}
          <div className="text-[11px] text-slate-400">
            Member since{' '}
            {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDetails;
