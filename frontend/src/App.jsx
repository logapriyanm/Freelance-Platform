import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { Toaster } from 'react-hot-toast';

// Common
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';


// Admin
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import DisputeResolution from './components/admin/DisputeResolution.jsx';
import UserManagement from './components/admin/UserManagement.jsx';
import AdminSettings from './components/admin/AdminSettings.jsx';

// Client
import ClientDashboard from './components/client/ClientDashboard';
import ClientPayments from './components/client/ClientPayments';
import PostProject from './components/client/PostProject';
import ClientProjects from './components/client/ClientProjects';

// Freelancer
import FreelancerDashboard from './components/freelancer/FreelancerDashboard';
import FreelancerProjects from './components/freelancer/FreelancerProjects';
import MyBids from './components/freelancer/MyBids';
import Portfolio from './components/freelancer/Portfolio';
import Earnings from './components/freelancer/Earnings';

// Shared (accessible by all authenticated users)
import BrowseProjects from './components/shared/BrowseProjects';
import ProjectDetails from './components/shared/ProjectDetails';
import FreelancerDetails from './components/shared/FreelancerDetails';
import Chat from './components/shared/Chat';

import Profile from './components/shared/Profile';
import Reviews from './components/shared/Reviews';

// Pages
import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Support from './pages/Support';
import NotFound from './pages/NotFound';

function App() {


  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/support" element={<Support />} />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/disputes"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DisputeResolution />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />

                {/* Client Routes */}
                <Route
                  path="/client/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/projects"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientProjects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/post-project"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <PostProject />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/payments"
                  element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientPayments />
                    </ProtectedRoute>
                  }
                />

                {/* Freelancer Routes */}
                <Route
                  path="/freelancer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['freelancer']}>
                      <FreelancerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/projects"
                  element={
                    <ProtectedRoute allowedRoles={['freelancer']}>
                      <FreelancerProjects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/my-bids"
                  element={
                    <ProtectedRoute allowedRoles={['freelancer']}>
                      <MyBids />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/portfolio"
                  element={
                    <ProtectedRoute allowedRoles={['freelancer']}>
                      <Portfolio />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/earnings"
                  element={
                    <ProtectedRoute allowedRoles={['freelancer']}>
                      <Earnings />
                    </ProtectedRoute>
                  }
                />



                {/* Shared Routes (accessible by all authenticated users) */}
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <BrowseProjects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project/:id"
                  element={
                    <ProtectedRoute>
                      <ProjectDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/freelancer/:id"
                  element={
                    <ProtectedRoute>
                      <FreelancerDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reviews"
                  element={
                    <ProtectedRoute>
                      <Reviews />
                    </ProtectedRoute>
                  }
                />



                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </div>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
