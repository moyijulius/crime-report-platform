import React, { useState } from 'react';
import { FaSearch, FaUser, FaTimes } from 'react-icons/fa';
import logo from '../assets/logo.png';

function OfficerHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'Officer Smith',
    email: 'officer.smith@crimereport.gov',
    phone: '(555) 123-4567'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for: ${searchQuery}`);
  };

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Here you would typically send the updated profile to your backend
    alert('Profile updated successfully');
    toggleProfileModal();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('officerToken');
    window.location.href = '/login';
  };

  return (
    <header className="bg-blue-600 text-white p-4 fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Name */}
        <div className="flex items-center">
          <img src={logo} alt="CrimeReport Logo" className="h-10 mr-2 logo" />
          <span className="text-2xl font-bold">CrimeReport</span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="flex items-center bg-white rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search cases, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 w-full text-gray-800 focus:outline-none"
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-700 transition-colors duration-300"
            >
              <FaSearch />
            </button>
          </div>
        </form>

        {/* User Profile Icon */}
        <button
          onClick={toggleProfileModal}
          className="p-2 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-300"
        >
          <FaUser size={20} />
        </button>
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
            {/* Close button */}
            <button 
              onClick={toggleProfileModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-blue-600">Officer Profile</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Update Profile
                </button>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

export default OfficerHeader;