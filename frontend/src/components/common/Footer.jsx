import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram, 
  FaGithub,
  FaBriefcase,
  FaUser,
  FaSearch,
  FaEnvelope,
  FaQuestionCircle,
  FaFileContract,
  FaShieldAlt,
  FaAward,
  FaHandshake
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-purple-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <FaBriefcase className="text-2xl sm:text-3xl mr-2 text-blue-300" />
              <h3 className="text-xl sm:text-2xl font-bold">FreelancePro</h3>
            </div>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Connecting talented freelancers with businesses worldwide.
              Quality work, fair pay, and seamless collaboration.
            </p>
            <div className="flex space-x-3 mb-6">
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-800 flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-700 transition-colors duration-300">
                <FaFacebook className="text-lg" />
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-800 flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-700 transition-colors duration-300">
                <FaTwitter className="text-lg" />
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-800 flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-700 transition-colors duration-300">
                <FaLinkedin className="text-lg" />
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-800 flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-700 transition-colors duration-300">
                <FaInstagram className="text-lg" />
              </a>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-blue-800/50 px-3 py-2 rounded-lg">
                <FaShieldAlt className="text-green-400 mr-2" />
                <span className="text-xs font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center bg-blue-800/50 px-3 py-2 rounded-lg">
                <FaAward className="text-yellow-400 mr-2" />
                <span className="text-xs font-medium">Verified Freelancers</span>
              </div>
            </div>
          </div>

          {/* For Freelancers */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <FaUser className="mr-2 text-blue-300" />
              For Freelancers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/browse-projects"
                  className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center text-sm"
                >
                  <FaSearch className="mr-2 text-sm" />
                  Find Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center text-sm"
                >
                  <FaUser className="mr-2 text-sm" />
                  Create Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  How it Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <FaBriefcase className="mr-2 text-purple-300" />
              For Clients
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/post-project"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Post a Project
                </Link>
              </li>
              <li>
                <Link
                  to="/find-freelancers"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Find Freelancers
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <FaHandshake className="mr-2 text-green-300" />
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center text-sm"
                >
                  <FaQuestionCircle className="mr-2 text-sm" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center text-sm"
                >
                  <FaEnvelope className="mr-2 text-sm" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center text-sm"
                >
                  <FaFileContract className="mr-2 text-sm" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 sm:pt-8 border-t border-blue-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-center sm:text-left text-gray-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} FreelancePro. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-400">Available in</span>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-blue-800 text-xs rounded">English</span>
                <span className="px-2 py-1 bg-blue-800 text-xs rounded">Español</span>
                <span className="px-2 py-1 bg-blue-800 text-xs rounded">Français</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;