import React, { useState } from 'react';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaUser,
  FaHeading,
  FaComment,
  FaCheckCircle
} from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const contactInfo = [
    {
      icon: <FaPhone />,
      title: 'Phone',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
      description: 'Mon-Fri from 8am to 6pm',
    },
    {
      icon: <FaEnvelope />,
      title: 'Email',
      details: ['support@freelancepro.com', 'sales@freelancepro.com'],
      description: 'We respond within 24 hours',
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Office',
      details: ['123 Tech Street', 'San Francisco, CA 94107', 'United States'],
      description: 'Headquarters',
    },
    {
      icon: <FaClock />,
      title: 'Working Hours',
      details: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 10:00 AM - 4:00 PM'],
      description: 'Pacific Time Zone',
    },
  ];

  const categories = [
    'General Inquiry',
    'Technical Support',
    'Billing',
    'Partnership',
    'Feedback',
    'Report a Problem',
    'Other',
  ];

  const faqs = [
    {
      q: 'How do I create a freelancer profile?',
      a: 'Click on "Sign Up" and select "Join as Freelancer". Fill in your details, skills, and portfolio to create a complete profile.',
    },
    {
      q: 'What are the payment methods?',
      a: 'We support credit/debit cards, PayPal, bank transfers, and several local payment methods depending on your country.',
    },
    {
      q: 'How are disputes resolved?',
      a: 'We have a dedicated dispute resolution team that mediates between clients and freelancers to find fair solutions.',
    },
    {
      q: 'Is there a fee for using the platform?',
      a: 'Freelancers pay a service fee of 10% on completed projects. Clients can post projects for free and pay only when they hire someone.',
    },
  ];

  const supportChannels = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      action: 'Start Chat',
      icon: '💬',
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Help Center',
      description: 'Browse our knowledge base and tutorials',
      action: 'Visit Help Center',
      icon: '📚',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Community Forum',
      description: 'Get help from other freelancers and clients',
      action: 'Join Forum',
      icon: '👥',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      title: 'Social Media',
      description: 'Follow us for updates and tips',
      action: 'Follow Us',
      icon: '📱',
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    
    setSnackbar({
      open: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.',
      severity: 'success',
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: '',
      message: '',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto">
            Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl text-blue-600 mb-4 flex justify-center">
                {info.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{info.title}</h3>
              <div className="space-y-1 mb-3">
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600">{detail}</p>
                ))}
              </div>
              <p className="text-sm text-gray-500">{info.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form & FAQ */}
      <div className="container mx-auto px-4 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
              <p className="text-gray-600 mb-6">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaHeading className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    required
                    placeholder="Tell us how we can help..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <FaPaperPlane />
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* FAQ & Map */}
          <div className="space-y-6">
            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-gray-900 mb-2">{faq.q}</h4>
                    <p className="text-gray-600 text-sm">{faq.a}</p>
                    {index < faqs.length - 1 && <hr className="my-4" />}
                  </div>
                ))}
              </div>

              <a
                href="/faq"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 mt-4"
              >
                View All FAQs
              </a>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Location</h3>
              <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">Interactive Map Would Go Here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Channels */}
      <div className="bg-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Additional Support Channels</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6 text-center border">
                <div className="text-4xl mb-4">{channel.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{channel.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{channel.description}</p>
                <button className={`px-4 py-2 ${channel.color} rounded-lg font-medium hover:opacity-90 transition-opacity duration-200`}>
                  {channel.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`rounded-lg shadow-lg p-4 max-w-sm ${snackbar.severity === 'success' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800'} border`}>
            <div className="flex items-center">
              <FaCheckCircle className="mr-2" />
              <p>{snackbar.message}</p>
              <button
                onClick={handleCloseSnackbar}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;