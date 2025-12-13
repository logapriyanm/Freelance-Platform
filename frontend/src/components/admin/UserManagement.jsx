import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaFilter,
  FaEllipsisV,
  FaCheckCircle,
  FaBan,
  FaEye,
  FaUserCircle,
  FaUserCheck,
  FaUserTimes,
  FaChevronLeft,
  FaChevronRight,
  FaUserShield,
  FaUserTie,
  FaUser,
  FaUserClock,
  FaTrash
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFilters] = useState({
    role: '',
    verified: '',
    search: '',
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, itemsPerPage, filters]);

 const fetchUsers = async () => {
  try {
    setLoading(true);
    // Use the correct API endpoint structure
    const response = await api.get('/admin/users', {
      params: {
        role: filters.role,
        verified: filters.verified,
        search: filters.search,
        page,
        limit: itemsPerPage
      }
    });
    
    // Adjust based on your API response structure
    if (response.data) {
      setUsers(response.data.users || response.data);
      setTotalUsers(response.data.total || response.data.length || 0);
    }
  } catch (error) {
    toast.error('Error fetching users');
  } finally {
    setLoading(false);
  }
};

  const handleMenuClick = (e, user) => {
    const rect = e.target.getBoundingClientRect();
    setMenuPosition({
      x: rect.left - 150,
      y: rect.top + 30
    });
    setSelectedUser(user);
    setShowMenu(true);
  };

  const handleMenuClose = () => {
    setShowMenu(false);
    setSelectedUser(null);
  };

  const handleVerifyUser = async () => {
  try {
    const response = await api.put(`api/admin/users/${selectedUser._id}/verify`);
    if (response.data) {
      toast.success('User verified successfully');
      fetchUsers();
      setShowVerifyModal(false);
    }
  } catch (error) {
    toast.error('Error verifying user');
  } finally {
    handleMenuClose();
  }
};

  const handleSuspendUser = async () => {
    try {
      await api.put(`api/admin/users/${selectedUser._id}/suspend`, {
        reason: 'Violation of terms',
      });
      toast.success('User suspended successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Error suspending user');
    } finally {
      handleMenuClose();
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`api/admin/users/${selectedUser._id}`);
      toast.success('User deleted successfully');
      fetchUsers();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Error deleting user');
    } finally {
      handleMenuClose();
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPage(1);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border border-red-200',
      client: 'bg-blue-100 text-blue-800 border border-blue-200',
      freelancer: 'bg-green-100 text-green-800 border border-green-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <FaUserShield className="w-4 h-4" />,
      client: <FaUserTie className="w-4 h-4" />,
      freelancer: <FaUser className="w-4 h-4" />,
    };
    return icons[role] || <FaUserCircle className="w-4 h-4" />;
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 flex items-center">
                <FaUserShield className="mr-2 sm:mr-3 text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
                User Management
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Manage platform users and permissions
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="">All Roles</option>
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
                <option value="admin">Admin</option>
              </select>
              
              <select
                name="verified"
                value={filters.verified}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="">All Status</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
              
              <button
                onClick={fetchUsers}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm sm:text-base"
              >
                <FaFilter className="mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <FaUserCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search ? 'Try adjusting your search or filter' : 'No users in the system yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full" />
                                ) : (
                                  <span className="text-gray-600 font-medium">
                                    {user.name?.charAt(0)?.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                {user.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {user._id?.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 truncate max-w-[200px]">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-500">
                              {getRoleIcon(user.role)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.isVerified 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                              {user.isVerified ? (
                                <span className="flex items-center">
                                  <FaUserCheck className="mr-1" /> Verified
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <FaUserClock className="mr-1" /> Pending
                                </span>
                              )}
                            </span>
                            {user.isSuspended && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
                                <span className="flex items-center">
                                  <FaBan className="mr-1" /> Suspended
                                </span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={(e) => handleMenuClick(e, user)}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              <FaEllipsisV className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {users.map((user) => (
                  <div key={user._id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full" />
                            ) : (
                              <span className="text-gray-600 font-medium text-lg">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleMenuClick(e, user)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <FaEllipsisV className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role}</span>
                        </span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isVerified ? (
                            <>
                              <FaUserCheck className="mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <FaUserClock className="mr-1" />
                              Pending
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                        {user.isSuspended && (
                          <span className="text-red-600 font-medium">
                            <FaBan className="inline mr-1" />
                            Suspended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-700">
                      Show
                      <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="mx-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      per page
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="text-sm text-gray-700">
                      Page <span className="font-medium">{page}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2.5 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2.5 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleMenuClose}
          />
          <div 
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
              maxWidth: 'calc(100vw - 2rem)'
            }}
          >
            <button
              onClick={() => {
                setShowVerifyModal(true);
                setShowMenu(false);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <FaCheckCircle className="mr-3 text-green-500 w-4 h-4" />
              Verify User
            </button>
            <button
              onClick={handleSuspendUser}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <FaBan className="mr-3 text-yellow-500 w-4 h-4" />
              {selectedUser?.isSuspended ? 'Unsuspend User' : 'Suspend User'}
            </button>
            <button
              onClick={() => {
                setSelectedUser(selectedUser);
                setShowMenu(false);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <FaEye className="mr-3 text-blue-500 w-4 h-4" />
              View Profile
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              onClick={() => {
                setShowDeleteModal(true);
                setShowMenu(false);
              }}
              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <FaTrash className="mr-3 w-4 h-4" />
              Delete User
            </button>
          </div>
        </>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-auto">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FaCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Verify User</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Are you sure you want to verify this user?
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-900 font-medium">{selectedUser.name}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedUser.email}</p>
                <p className="text-xs text-gray-500 mt-1">Role: {selectedUser.role}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyUser}
                  className="w-full sm:w-auto px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 text-sm font-medium"
                >
                  Verify User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-auto">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <FaTrash className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone. All user data will be permanently deleted.
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 font-medium">Warning: Critical Action</p>
                <p className="text-xs text-red-600 mt-1">
                  Deleting user: <span className="font-medium">{selectedUser.name}</span>
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Email: <span className="font-medium">{selectedUser.email}</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 text-sm font-medium"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;