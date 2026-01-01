import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { toast } from 'react-hot-toast';
import {
  FaBars,
  FaBriefcase,
  FaBell,
  FaTachometerAlt,
  FaSignOutAlt,
  FaPlus,
  FaTimes,
  FaListAlt,
  FaWallet,
  FaUserCircle,
  FaCog,
  FaStar,
  FaHistory,
  FaEnvelope,
  FaQuestionCircle,
  FaInfoCircle,
  FaComments,
  FaUsers,
} from 'react-icons/fa';
import { IoIosArrowDropdown } from 'react-icons/io';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const { user } = useSelector((state) => state.auth);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
    setProfileDropdownOpen(false);
  };

  // Navigation items based on role, aligned with App.jsx routes
  const getDashboardItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'client':
        return [
          { text: 'Dashboard', icon: <FaTachometerAlt />, path: '/client/dashboard' },
          { text: 'My Projects', icon: <FaListAlt />, path: '/client/projects' },
          { text: 'Post Project', icon: <FaPlus />, path: '/client/post-project' },
          { text: 'Payments', icon: <FaWallet />, path: '/client/payments' },
        ];

      case 'freelancer':
        return [
          { text: 'Dashboard', icon: <FaTachometerAlt />, path: '/freelancer/dashboard' },
          { text: 'Browse Projects', icon: <FaBriefcase />, path: '/projects' },
          { text: 'My Projects', icon: <FaListAlt />, path: '/freelancer/projects' },
          { text: 'My Bids', icon: <FaListAlt />, path: '/freelancer/my-bids' },
          { text: 'Portfolio', icon: <FaBriefcase />, path: '/freelancer/portfolio' },
          { text: 'Earnings', icon: <FaWallet />, path: '/freelancer/earnings' },
        ];

      case 'admin':
        return [
          { text: 'Dashboard', icon: <FaTachometerAlt />, path: '/admin' },
          { text: 'User Management', icon: <FaUserCircle />, path: '/admin/users' },
          { text: 'Dispute Resolution', icon: <FaComments />, path: '/admin/disputes' },
          { text: 'Settings', icon: <FaCog />, path: '/admin/settings' },
        ];

      default:
        return [];
    }
  };

  const getProfileMenuItems = () => {
    if (!user) return [];

    return [
      { text: 'My Profile', icon: <FaUserCircle />, path: '/profile' },
      { text: 'Messages', icon: <FaComments />, path: '/chat' },
      { text: 'My Reviews', icon: <FaStar />, path: '/reviews' },
      // Future: { text: 'Transaction History', icon: <FaHistory />, path: '/transactions' },
    ];
  };

  // Wallet link from bottom bar — send people to real pages
  const getWalletPath = () => {
    if (!user) return '/settings';
    if (user.role === 'client') return '/client/payments';
    if (user.role === 'freelancer') return '/freelancer/earnings';
    if (user.role === 'admin') return '/admin/settings';
    return '/settings';
  };

  const menuItems = getDashboardItems();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 backdrop-blur-sm bg-white/95 border-b border-gray-200">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center text-blue-600 font-bold text-xl sm:text-2xl"
                onClick={() => {
                  setProfileDropdownOpen(false);
                }}
              >
                <FaBriefcase className="mr-2 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FreelancePro
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Only show if user is logged in */}
            {user && (
              <div className="hidden lg:flex items-center flex-1 justify-center mx-4">
                {menuItems.map((item) => (
                  <Link
                    key={`${item.text}-${item.path}`}
                    to={item.path}
                    className="flex items-center mx-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 text-sm font-medium"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.text}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications (only when logged in) */}


              {/* User Menu (Desktop) */}
              {user ? (
                <div className="hidden sm:block relative" ref={profileDropdownRef}>
                  <button
                    ref={profileButtonRef}
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:flex items-center">
                      <span className="text-sm font-medium">{user.name}</span>
                      <IoIosArrowDropdown
                        className={`ml-1 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''
                          }`}
                      />
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100 animate-fadeIn">
                      <div className="px-4 py-3 border-b">

                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Profile Menu Items */}
                      {getProfileMenuItems().map((item) => (
                        <Link
                          key={item.text}
                          to={item.path}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <span className="mr-3 text-gray-500">{item.icon}</span>
                          <span className="text-sm">{item.text}</span>
                        </Link>
                      ))}

                      <div className="border-t my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 text-sm"
                      >
                        <FaSignOutAlt className="mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Auth Buttons (Desktop) when not logged in
                <div className="hidden sm:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors duration-300"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium text-sm shadow-sm hover:shadow"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => {
                  handleDrawerToggle();
                  setProfileDropdownOpen(false);
                }}
                className="sm:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-300"
              >
                {mobileOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleDrawerToggle}
          ></div>

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-600">
                  <FaBriefcase className="inline mr-2" />
                  FreelancePro
                </h2>
                <button
                  onClick={handleDrawerToggle}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-white text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                        {user.role}
                      </span>
                      <span className="text-xs text-gray-500 truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="p-2 overflow-y-auto h-[calc(100vh-200px)]">
              {/* Dashboard Items for logged in users */}
              {user && menuItems.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Navigation
                  </div>
                  {menuItems.map((item) => (
                    <Link
                      key={`mobile-${item.text}`}
                      to={item.path}
                      onClick={handleDrawerToggle}
                      className="flex items-center p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg mb-1 transition-colors duration-300"
                    >
                      <span className="mr-3 text-gray-500">{item.icon}</span>
                      <span className="font-medium text-sm">{item.text}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Profile Menu Items for logged in users */}
              {user && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account
                  </div>
                  {getProfileMenuItems().map((item) => (
                    <Link
                      key={`mobile-${item.text}`}
                      to={item.path}
                      onClick={handleDrawerToggle}
                      className="flex items-center p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg mb-1 transition-colors duration-300"
                    >
                      {item.icon && <span className="mr-3 text-gray-500">{item.icon}</span>}
                      <span className="font-medium text-sm">{item.text}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Support section for all users */}
              <div className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Support
                </div>
                <Link
                  to="/contact"
                  onClick={handleDrawerToggle}
                  className="flex items-center p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg mb-1 transition-colors duration-300"
                >
                  <FaEnvelope className="mr-3 text-gray-500" />
                  <span className="font-medium text-sm">Contact</span>
                </Link>
                <Link
                  to="/support"
                  onClick={handleDrawerToggle}
                  className="flex items-center p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg mb-1 transition-colors duration-300"
                >
                  <FaQuestionCircle className="mr-3 text-gray-500" />
                  <span className="font-medium text-sm">Help Center</span>
                </Link>
                <Link
                  to="/about"
                  onClick={handleDrawerToggle}
                  className="flex items-center p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg mb-1 transition-colors duration-300"
                >
                  <FaInfoCircle className="mr-3 text-gray-500" />
                  <span className="font-medium text-sm">About Us</span>
                </Link>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              {user ? (
                <>
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Account Balance</p>
                    {/* Hook this to real balance later */}
                    <p className="text-lg font-bold text-gray-900">$1,250.00</p>
                    <Link
                      to={getWalletPath()}
                      onClick={handleDrawerToggle}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View wallet →
                    </Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-300 flex items-center justify-center text-sm font-medium"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={handleDrawerToggle}
                    className="block px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-center transition-colors duration-300 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleDrawerToggle}
                    className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 text-center transition-colors duration-300 text-sm font-medium shadow-sm hover:shadow"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer below fixed navbar */}
      <div className="h-14 sm:h-16"></div>
    </>
  );
};

export default Navbar;
