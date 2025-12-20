import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const Home = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);

  useEffect(() => {
    setFeaturedProjects([
      {
        id: 1,
        title: 'E-commerce Website Development',
        description: 'Need a full-stack developer to build an e-commerce platform with React and Node.js',
        budget: '$2000 - $5000',
        skills: ['React', 'Node.js', 'MongoDB', 'Express'],
        bids: 12,
        duration: '1-3 months',
        posted: '2 days ago',
      },
      {
        id: 2,
        title: 'Mobile App UI/UX Design',
        description: 'Looking for a talented UI/UX designer to create wireframes and prototypes',
        budget: '$1000 - $3000',
        skills: ['UI Design', 'UX Research', 'Figma', 'Prototyping'],
        bids: 8,
        duration: '1-2 months',
        posted: '1 day ago',
      },
      {
        id: 3,
        title: 'Data Analysis Dashboard',
        description: 'Build a real-time analytics dashboard with interactive charts and graphs',
        budget: '$3000 - $6000',
        skills: ['Python', 'Django', 'React', 'Chart.js', 'PostgreSQL'],
        bids: 15,
        duration: '2-4 months',
        posted: '3 days ago',
      },
    ]);

    setTopFreelancers([
      {
        id: 1,
        name: 'Alex Johnson',
        title: 'Full Stack Developer',
        rating: 4.9,
        completed: 47,
        skills: ['React', 'Node.js', 'Python', 'AWS'],
        hourlyRate: '$75/hr',
        avatar: 'AJ',
      },
      {
        id: 2,
        name: 'Sarah Miller',
        title: 'UI/UX Designer',
        rating: 4.8,
        completed: 32,
        skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
        hourlyRate: '$65/hr',
        avatar: 'SM',
      },
      {
        id: 3,
        name: 'Michael Chen',
        title: 'Data Scientist',
        rating: 4.7,
        completed: 28,
        skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
        hourlyRate: '$90/hr',
        avatar: 'MC',
      },
    ]);
  }, []);

  const features = [
    {
      icon: <WorkIcon className="text-3xl" />,
      title: 'Find Perfect Projects',
      description: 'Browse thousands of projects that match your skills and expertise.',
    },
    {
      icon: <PeopleIcon className="text-3xl" />,
      title: 'Connect with Talent',
      description: 'Hire from a global pool of verified freelancers and agencies.',
    },
    {
      icon: <TrendingUpIcon className="text-3xl" />,
      title: 'Grow Your Business',
      description: 'Scale your projects with flexible hiring and management tools.',
    },
    {
      icon: <SecurityIcon className="text-3xl" />,
      title: 'Secure Payments',
      description: 'Get paid safely with our escrow system and milestone payments.',
    },
  ];

  const stats = [
    { label: 'Projects Posted', value: '10,000+' },
    { label: 'Freelancers', value: '50,000+' },
    { label: 'Clients', value: '15,000+' },
    { label: 'Success Rate', value: '98%' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Find the Perfect Freelance Services for Your Business
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Connect with talented freelancers or find great projects. Everything you need to grow your career or business.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-semibold transition-colors duration-300"
                >
                  Join as Freelancer
                </Link>
                <Link
                  to="/post-project"
                  className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-purple-600 font-semibold transition-colors duration-300"
                >
                  Hire Talent
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">What are you looking for?</h2>
                <div className="flex border-b mb-6">
                  <button
                    onClick={() => setActiveTab(0)}
                    className={`flex-1 py-3 font-medium ${activeTab === 0 ? 'text-white border-b-2 border-white' : 'text-white/70'}`}
                  >
                    Find Projects
                  </button>
                  <button
                    onClick={() => setActiveTab(1)}
                    className={`flex-1 py-3 font-medium ${activeTab === 1 ? 'text-white border-b-2 border-white' : 'text-white/70'}`}
                  >
                    Find Freelancers
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={activeTab === 0 ? 'Search for projects...' : 'Search freelancers by skills...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900"
                    />
                  </div>
                  <button className="w-full bg-white text-purple-600 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center">
                    Search
                    <ArrowForwardIcon className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-lg text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Why Choose FreelancePro?</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Everything you need to succeed in the freelance world
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <div className="text-blue-600 mb-6 flex justify-center">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <h2 className="text-4xl font-bold">Featured Projects</h2>
          <Link
            to="/projects"
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center"
          >
            View All Projects
            <ArrowForwardIcon className="ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {project.budget}
                  </span>
                  <span className="text-sm text-gray-500">{project.posted}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span><strong>{project.bids}</strong> bids</span>
                  <span>Duration: <strong>{project.duration}</strong></span>
                </div>
              </div>
              <div className="px-6 pb-6">
                <Link
                  to={`/project/${project.id}`}
                  className="block w-full bg-blue-600 text-white py-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition-colors duration-300"
                >
                  View Project
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Freelancers */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <h2 className="text-4xl font-bold">Top Freelancers</h2>
            <Link
              to="/find-freelancers"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center"
            >
              View All Freelancers
              <ArrowForwardIcon className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topFreelancers.map((freelancer) => (
              <div key={freelancer.id} className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-6">
                  {freelancer.avatar}
                </div>
                <h3 className="text-2xl font-bold mb-2">{freelancer.name}</h3>
                <p className="text-gray-600 mb-4">{freelancer.title}</p>
                <div className="flex items-center justify-center mb-4">
                  <StarIcon className="text-yellow-500 mr-1" />
                  <span className="font-bold mr-1">{freelancer.rating}</span>
                  <span className="text-gray-600">({freelancer.completed} projects)</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {freelancer.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-6">{freelancer.hourlyRate}</div>
                <Link
                  to={`/freelancer/${freelancer.id}`}
                  className="block w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors duration-300"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            Join thousands of freelancers and clients who are already succeeding
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/register"
              className="px-10 py-4 bg-white text-pink-600 rounded-lg hover:bg-gray-100 font-semibold text-lg transition-colors duration-300"
            >
              Sign Up Free
            </Link>
            <Link
              to="/how-it-works"
              className="px-10 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-pink-600 font-semibold text-lg transition-colors duration-300"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;