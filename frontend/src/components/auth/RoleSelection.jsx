import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBusinessTime, FaUserTie, FaArrowRight } from 'react-icons/fa';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate('/register', { state: { role } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Join SB Works
            </h1>
            <p className="text-gray-600">
              Select how you want to use our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Client Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6 flex flex-col h-full">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <FaBusinessTime className="text-blue-600 text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    I'm a Client
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Hire skilled freelancers for your projects
                  </p>
                </div>

                <div className="flex-grow">
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Post projects and receive bids</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Review freelancer profiles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Manage projects and payments</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Get quality work delivered</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleRoleSelect('client')}
                  className="w-full flex justify-center items-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Hire Freelancers
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>

            {/* Freelancer Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6 flex flex-col h-full">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <FaUserTie className="text-green-600 text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    I'm a Freelancer
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Find projects that match your skills
                  </p>
                </div>

                <div className="flex-grow">
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Browse and bid on projects</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Showcase your portfolio</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Get paid securely</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Build your reputation</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleRoleSelect('freelancer')}
                  className="w-full flex justify-center items-center py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  Find Work
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;