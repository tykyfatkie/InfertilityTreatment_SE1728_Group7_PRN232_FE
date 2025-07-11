import React, { useState } from 'react';
import { User, Mail, Lock, Phone, UserCheck } from 'lucide-react';

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7184/api';
      const response = await fetch(`${apiUrl}/accounts/register/patient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setResponse(data);
        setFormData({
          username: '',
          password: '',
          email: '',
          fullName: '',
          phoneNumber: ''
        });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillExampleData = () => {
    setFormData({
      username: 'john_doe_patient',
      password: 'SecurePass123!',
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      phoneNumber: '+84901234567'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="bg-green-500 text-white px-6 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="bg-white text-green-500 px-3 py-1 rounded text-sm font-medium">POST</span>
              <span className="font-mono text-sm">/api/accounts/register/patient</span>
            </div>
            <button
              onClick={fillExampleData}
              className="bg-white text-green-500 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Try it out
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <UserCheck className="mr-2 text-green-500" size={24} />
              Patient Registration
            </h2>

            <div className="space-y-4">
              {/* Username */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Username
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter username"
                />
              </div>

              {/* Password */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline mr-2" size={16} />
                  Password
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter password"
                />
              </div>

              {/* Email */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter email address"
                />
              </div>

              {/* Full Name */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Full Name
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter full name"
                />
              </div>

              {/* Phone Number */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline mr-2" size={16} />
                  Phone Number
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Registering...' : 'Register Patient'}
              </button>
            </div>

            {/* Request Body Preview */}
            <div className="mt-6 p-4 bg-gray-800 text-green-400 rounded-lg">
              <h3 className="text-sm font-medium mb-2 text-white">Request Body (JSON):</h3>
              <pre className="text-xs font-mono overflow-x-auto">
{JSON.stringify(formData, null, 2)}
              </pre>
            </div>

            {/* Response Section */}
            {(response || error) && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Response:</h3>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">ERROR</span>
                      <span className="ml-2 text-red-700 font-medium">Request Failed</span>
                    </div>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                {response && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">200</span>
                      <span className="ml-2 text-green-700 font-medium">Success</span>
                    </div>
                    <pre className="text-sm text-green-800 bg-green-100 p-3 rounded overflow-x-auto">
{JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* API Info */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium text-gray-800 mb-2">API Information</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Endpoint:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{import.meta.env.VITE_API_BASE_URL || 'https://localhost:7184/api'}/accounts/register/patient</code></p>
            <p><strong>Method:</strong> POST</p>
            <p><strong>Content-Type:</strong> application/json</p>
            <p><strong>Expected Response:</strong> 200 - Success</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;