import React, { useState, useEffect } from 'react';
import { FaUser, FaTimes, FaCheckCircle, FaExclamationCircle, FaFileAlt, FaPlusCircle } from 'react-icons/fa';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from '../assets/logo.png';
import { useNavigate, Link } from 'react-router-dom';

function UserProfileHeader() {
  const [user, setUser] = useState({ username: '', email: '', phone: '' });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data);
        } else {
          setErrorMessage(data.error || 'Failed to fetch profile');
          setIsErrorModalOpen(true);
        }
      } catch (error) {
        setErrorMessage('Error fetching profile');
        setIsErrorModalOpen(true);
      }
    };
    fetchUserProfile();
  }, []);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(user),
      });
      const data = await response.json();
      if (response.ok) {
        setIsSuccessModalOpen(true);
        // Close success modal after 3 seconds
        setTimeout(() => {
          setIsSuccessModalOpen(false);
        }, 3000);
      } else {
        setErrorMessage(data.error || 'Failed to update profile');
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      setErrorMessage('Error updating profile');
      setIsErrorModalOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('officerToken');
    toast.success("Logged out successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  return (
    <header className="bg-blue-600 text-white p-4 fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Name */}
        <div className="flex items-center">
          <img src={logo} alt="CrimeReport Logo" className="h-10 mr-2 logo" />
          <span className="text-2xl font-bold">CrimeReport</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          <Link
            to="/track"
            className="flex items-center px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <FaFileAlt className="mr-2" />
            <span>Track Case</span>
          </Link>
          <Link
            to="/report"
            className="flex items-center px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <FaPlusCircle className="mr-2" />
            <span>Report Crime</span>
          </Link>
        </div>

        {/* User Profile Icon (Moved to top-right corner) */}
        <div className="flex items-center">
          <button
            onClick={toggleProfileModal}
            className="p-2 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-300"
          >
            <FaUser size={20} />
          </button>
        </div>

        {/* Toast Container */}
        <ToastContainer />
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
            
            <h2 className="text-2xl font-bold mb-6 text-blue-600">User Profile</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={user.username}
                  onChange={(e) => setUser({...user, username: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({...user, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={user.phone}
                  onChange={(e) => setUser({...user, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
                >
                  <span>Update Profile</span>
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

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button 
              onClick={closeSuccessModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
            
            <div className="flex flex-col items-center justify-center py-4">
              <FaCheckCircle size={50} className="text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
              <p className="text-gray-700 text-center">Your profile has been updated successfully.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button 
              onClick={closeErrorModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
            
            <div className="flex flex-col items-center justify-center py-4">
              <FaExclamationCircle size={50} className="text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
              <p className="text-gray-700 text-center">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default UserProfileHeader;