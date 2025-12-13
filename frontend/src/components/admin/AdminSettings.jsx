import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import {
  FaSave,
  FaCog,
  FaShieldAlt,
  FaEnvelope,
  FaDollarSign,
  FaPercentage,
  FaCalendar,
  FaUsers,
  FaBell,
  FaLock,
  FaGlobe,
  FaFileContract,
  FaChartLine,
  FaPalette,
  FaSync,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaDownload,
  FaUpload,
  FaUndo
} from 'react-icons/fa';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: 'FreelancePro',
    platformEmail: 'admin@freelancepro.com',
    supportEmail: 'support@freelancepro.com',
    contactPhone: '+1 (555) 123-4567',
    defaultCurrency: 'USD',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    
    // Commission & Fees
    platformCommission: 10,
    freelancerCommission: 5,
    clientFeePercentage: 2.5,
    transactionFee: 2,
    withdrawalFee: 1,
    minimumWithdrawal: 50,
    maximumWithdrawal: 10000,
    
    // Security Settings
    maxLoginAttempts: 5,
    sessionTimeout: 60,
    twoFactorEnabled: true,
    passwordMinLength: 8,
    requireStrongPassword: true,
    ipWhitelist: [],
    
    // Verification Settings
    emailVerificationRequired: true,
    identityVerificationRequired: true,
    portfolioVerificationRequired: true,
    bankVerificationRequired: true,
    
    // Project Settings
    projectAutoApprove: false,
    maxProjectDuration: 180,
    minProjectBudget: 10,
    maxProjectBudget: 50000,
    escrowEnabled: true,
    escrowPercentage: 50,
    disputeResolutionDays: 7,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    projectAlerts: true,
    paymentAlerts: true,
    securityAlerts: true,
    
    // Performance Settings
    cacheEnabled: true,
    cacheDuration: 300,
    maxUploadSize: 10,
    allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    
    // Legal Settings
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    refundPolicyUrl: '/refund-policy',
    cookiePolicyUrl: '/cookie-policy'
  });

  const [activeTab, setActiveTab] = useState('general');
  const [tempSettings, setTempSettings] = useState({});
  const [ipInput, setIpInput] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data) {
        setSettings(response.data);
        setTempSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('api/admin/settings', settings);
      if (response.data && response.data.success) {
        toast.success('Settings saved successfully');
        setTempSettings({ ...settings });
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...tempSettings });
    toast.info('Changes discarded');
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addIpAddress = () => {
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipInput && ipRegex.test(ipInput) && !settings.ipWhitelist.includes(ipInput)) {
      setSettings(prev => ({
        ...prev,
        ipWhitelist: [...prev.ipWhitelist, ipInput]
      }));
      setIpInput('');
      toast.success('IP address added');
    } else if (!ipRegex.test(ipInput)) {
      toast.error('Please enter a valid IP address');
    }
  };

  const removeIpAddress = (ip) => {
    setSettings(prev => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter(item => item !== ip)
    }));
    toast.success('IP address removed');
  };

  const handleBackupSettings = async () => {
    try {
      setBackupLoading(true);
      const response = await api.get('api/admin/settings/backup', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.setAttribute('download', `settings-backup-${timestamp}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Settings backup downloaded successfully');
    } catch (error) {
      console.error('Error backing up settings:', error);
      toast.error('Error downloading backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      return;
    }

    try {
      setResetLoading(true);
      const response = await api.post('api/admin/settings/reset');
      if (response.data && response.data.success) {
        toast.success('Settings reset to default successfully');
        fetchSettings();
      } else {
        toast.error('Failed to reset settings');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Error resetting settings');
    } finally {
      setResetLoading(false);
    }
  };

  const handleFileTypeAdd = () => {
    const fileTypeInput = document.getElementById('fileTypeInput');
    if (fileTypeInput && fileTypeInput.value.trim()) {
      const newType = fileTypeInput.value.trim().toLowerCase();
      if (!settings.allowedFileTypes.includes(newType)) {
        setSettings(prev => ({
          ...prev,
          allowedFileTypes: [...prev.allowedFileTypes, newType]
        }));
        fileTypeInput.value = '';
        toast.success(`File type .${newType} added`);
      } else {
        toast.error('File type already exists');
      }
    }
  };

  const removeFileType = (type) => {
    setSettings(prev => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.filter(item => item !== type)
    }));
    toast.success(`File type .${type} removed`);
  };

  const handleFileTypeKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFileTypeAdd();
    }
  };

  const hasChanges = () => {
    return JSON.stringify(settings) !== JSON.stringify(tempSettings);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <FaCog /> },
    { id: 'fees', label: 'Fees & Commission', icon: <FaDollarSign /> },
    { id: 'security', label: 'Security', icon: <FaLock /> },
    { id: 'verification', label: 'Verification', icon: <FaShieldAlt /> },
    { id: 'projects', label: 'Projects', icon: <FaFileContract /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'performance', label: 'Performance', icon: <FaChartLine /> },
    { id: 'legal', label: 'Legal', icon: <FaGlobe /> }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR'];
  const timezones = ['UTC', 'EST', 'PST', 'GMT', 'CET', 'IST'];
  const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MMMM DD, YYYY'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <FaCog className="mr-3 text-blue-600" />
                Admin Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Configure platform settings and preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackupSettings}
                disabled={backupLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center text-sm"
              >
                {backupLoading ? (
                  <FaSync className="animate-spin mr-2" />
                ) : (
                  <FaDownload className="mr-2" />
                )}
                Backup
              </button>
              
              <button
                onClick={handleResetToDefault}
                disabled={resetLoading}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center text-sm"
              >
                {resetLoading ? (
                  <FaSync className="animate-spin mr-2" />
                ) : (
                  <FaUndo className="mr-2" />
                )}
                Reset Defaults
              </button>
            </div>
          </div>
          
          {hasChanges() && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700 text-sm flex items-center">
                <FaExclamationTriangle className="mr-2" />
                You have unsaved changes. Don't forget to save!
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FaCog className="mr-2" />
                General Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => handleChange('platformName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Email
                  </label>
                  <input
                    type="email"
                    value={settings.platformEmail}
                    onChange={(e) => handleChange('platformEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    value={settings.defaultCurrency}
                    onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => handleChange('dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {dateFormats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Fees & Commission Settings */}
          {activeTab === 'fees' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FaDollarSign className="mr-2" />
                Fees & Commission
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Commission (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.1"
                        value={settings.platformCommission}
                        onChange={(e) => handleChange('platformCommission', parseFloat(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <FaPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Percentage taken by platform from each project</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Fee (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={settings.clientFeePercentage}
                        onChange={(e) => handleChange('clientFeePercentage', parseFloat(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <FaPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Additional fee charged to clients</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Fee (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={settings.transactionFee}
                        onChange={(e) => handleChange('transactionFee', parseFloat(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <FaPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Fee per transaction (payment processing)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Withdrawal Fee (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={settings.withdrawalFee}
                        onChange={(e) => handleChange('withdrawalFee', parseFloat(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <FaPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Fee charged when freelancers withdraw funds</p>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Withdrawal Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Withdrawal ($)
                      </label>
                      <div className="relative">
                        <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          min="1"
                          value={settings.minimumWithdrawal}
                          onChange={(e) => handleChange('minimumWithdrawal', parseFloat(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Withdrawal ($)
                      </label>
                      <div className="relative">
                        <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          min="100"
                          value={settings.maximumWithdrawal}
                          onChange={(e) => handleChange('maximumWithdrawal', parseFloat(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FaLock className="mr-2" />
                Security Settings
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Before account is temporarily locked</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Inactivity before automatic logout</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      min="6"
                      max="32"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="twoFactorEnabled"
                      checked={settings.twoFactorEnabled}
                      onChange={(e) => handleChange('twoFactorEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="twoFactorEnabled" className="ml-2 text-sm font-medium text-gray-700">
                      Enable Two-Factor Authentication
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireStrongPassword"
                      checked={settings.requireStrongPassword}
                      onChange={(e) => handleChange('requireStrongPassword', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requireStrongPassword" className="ml-2 text-sm font-medium text-gray-700">
                      Require Strong Passwords (uppercase, lowercase, numbers, symbols)
                    </label>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">IP Whitelist</h3>
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter IP address (e.g., 192.168.1.1)"
                        value={ipInput}
                        onChange={(e) => setIpInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addIpAddress()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={addIpAddress}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Add IP
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Only these IPs will be allowed to access admin panel (leave empty to allow all)
                    </p>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {settings.ipWhitelist.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="font-mono text-sm">{ip}</span>
                        </div>
                        <button
                          onClick={() => removeIpAddress(ip)}
                          className="text-red-600 hover:text-red-800 p-1 transition-colors duration-200"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    
                    {settings.ipWhitelist.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No IP addresses whitelisted</p>
                        <p className="text-gray-400 text-xs mt-1">Admin panel accessible from all IPs</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Settings */}
          {activeTab === 'verification' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FaShieldAlt className="mr-2" />
                Verification Settings
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailVerificationRequired"
                      checked={settings.emailVerificationRequired}
                      onChange={(e) => handleChange('emailVerificationRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailVerificationRequired" className="ml-2 text-sm font-medium text-gray-700">
                      Require Email Verification
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">Users must verify email before using platform</p>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="identityVerificationRequired"
                      checked={settings.identityVerificationRequired}
                      onChange={(e) => handleChange('identityVerificationRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="identityVerificationRequired" className="ml-2 text-sm font-medium text-gray-700">
                      Require Identity Verification (Freelancers)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">Government ID verification for freelancers</p>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="portfolioVerificationRequired"
                      checked={settings.portfolioVerificationRequired}
                      onChange={(e) => handleChange('portfolioVerificationRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="portfolioVerificationRequired" className="ml-2 text-sm font-medium text-gray-700">
                      Require Portfolio Verification (Freelancers)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">Freelancers must submit portfolio for approval</p>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bankVerificationRequired"
                      checked={settings.bankVerificationRequired}
                      onChange={(e) => handleChange('bankVerificationRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="bankVerificationRequired" className="ml-2 text-sm font-medium text-gray-700">
                      Require Bank Account Verification (Freelancers)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">Bank account verification for withdrawal</p>
                </div>
              </div>
            </div>
          )}

          {/* Project Settings */}
          {activeTab === 'projects' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FaFileContract className="mr-2" />
                Project Settings
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Project Duration (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.maxProjectDuration}
                      onChange={(e) => handleChange('maxProjectDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum allowed project timeline</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Project Budget ($)
                    </label>
                    <div className="relative">
                      <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        value={settings.minProjectBudget}
                        onChange={(e) => handleChange('minProjectBudget', parseFloat(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Project Budget ($)
                    </label>
                    <div className="relative">
                      <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="100"
                        value={settings.maxProjectBudget}
                        onChange={(e) => handleChange('maxProjectBudget', parseFloat(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Escrow Percentage (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={settings.escrowPercentage}
                        onChange={(e) => handleChange('escrowPercentage', parseInt(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <FaPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Percentage of funds held in escrow</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="projectAutoApprove"
                      checked={settings.projectAutoApprove}
                      onChange={(e) => handleChange('projectAutoApprove', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="projectAutoApprove" className="ml-2 text-sm font-medium text-gray-700">
                      Auto-approve projects (skip admin review)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="escrowEnabled"
                      checked={settings.escrowEnabled}
                      onChange={(e) => handleChange('escrowEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="escrowEnabled" className="ml-2 text-sm font-medium text-gray-700">
                      Enable Escrow System
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dispute Resolution Period (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.disputeResolutionDays}
                    onChange={(e) => handleChange('disputeResolutionDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Time given to resolve disputes before escalation</p>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FaBell className="mr-2" />
                Notification Settings
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="ml-2 text-sm font-medium text-gray-700">
                    Enable Email Notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pushNotifications" className="ml-2 text-sm font-medium text-gray-700">
                    Enable Push Notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="projectAlerts"
                    checked={settings.projectAlerts}
                    onChange={(e) => handleChange('projectAlerts', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="projectAlerts" className="ml-2 text-sm font-medium text-gray-700">
                    Project Activity Alerts
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="paymentAlerts"
                    checked={settings.paymentAlerts}
                    onChange={(e) => handleChange('paymentAlerts', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="paymentAlerts" className="ml-2 text-sm font-medium text-gray-700">
                    Payment Transaction Alerts
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="securityAlerts"
                    checked={settings.securityAlerts}
                    onChange={(e) => handleChange('securityAlerts', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="securityAlerts" className="ml-2 text-sm font-medium text-gray-700">
                    Security & Login Alerts
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Performance Settings */}
          {activeTab === 'performance' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FaChartLine className="mr-2" />
                Performance Settings
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cache Duration (seconds)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="3600"
                      value={settings.cacheDuration}
                      onChange={(e) => handleChange('cacheDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">0 = No caching</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max File Upload Size (MB)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.maxUploadSize}
                      onChange={(e) => handleChange('maxUploadSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="cacheEnabled"
                      checked={settings.cacheEnabled}
                      onChange={(e) => handleChange('cacheEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="cacheEnabled" className="ml-2 text-sm font-medium text-gray-700">
                      Enable Caching
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed File Types
                  </label>
                  <div className="mb-3">
                    <div className="flex gap-2">
                      <input
                        id="fileTypeInput"
                        type="text"
                        placeholder="Add file extension (e.g., txt)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={handleFileTypeKeyPress}
                      />
                      <button
                        onClick={handleFileTypeAdd}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.allowedFileTypes.map((type, index) => (
                      <div key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg">
                        <span className="text-sm font-medium">.{type}</span>
                        <button
                          onClick={() => removeFileType(type)}
                          className="text-red-600 hover:text-red-800 p-1 transition-colors duration-200"
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {settings.allowedFileTypes.length === 0 && (
                      <p className="text-gray-500 text-sm italic">No file types allowed. Users cannot upload files.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legal Settings */}
          {activeTab === 'legal' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FaGlobe className="mr-2" />
                Legal Settings
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms of Service URL
                  </label>
                  <input
                    type="text"
                    value={settings.termsUrl}
                    onChange={(e) => handleChange('termsUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Policy URL
                  </label>
                  <input
                    type="text"
                    value={settings.privacyUrl}
                    onChange={(e) => handleChange('privacyUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Policy URL
                  </label>
                  <input
                    type="text"
                    value={settings.refundPolicyUrl}
                    onChange={(e) => handleChange('refundPolicyUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cookie Policy URL
                  </label>
                  <input
                    type="text"
                    value={settings.cookiePolicyUrl}
                    onChange={(e) => handleChange('cookiePolicyUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Bar */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm">
                {hasChanges() ? (
                  <span className="text-yellow-600 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    You have unsaved changes
                  </span>
                ) : (
                  <span className="text-green-600 flex items-center">
                    <FaCheck className="mr-2" />
                    All changes saved
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  disabled={!hasChanges()}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                    hasChanges()
                      ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FaTimes className="mr-2" />
                  Discard Changes
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges() || saving}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                    hasChanges() && !saving
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <>
                      <FaSync className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;