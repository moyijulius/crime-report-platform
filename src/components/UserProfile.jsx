import React, { useState, useEffect } from 'react';
import OfficerHeader from './UserProfileHeader';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaEye, FaTrash, FaSearch } from 'react-icons/fa';

function UserProfile() {
  const [user, setUser] = useState({ username: '', email: '', phone: '' });
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [pastReports, setPastReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile data and reports on component mount
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
          // Fetch user's reports
          const reportsResponse = await fetch('http://localhost:5000/api/reports/user', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const reportsData = await reportsResponse.json();
          if (reportsResponse.ok) {
            const reportData = Array.isArray(reportsData) ? reportsData : [];
            setPastReports(reportData);
            setFilteredReports(reportData);
          } else {
            setErrorMessage(reportsData.error || 'Failed to fetch reports');
            setIsErrorModalOpen(true);
          }
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

  // Apply filters effect
  // Apply filters effect
useEffect(() => {
  if (!Array.isArray(pastReports)) {
    setFilteredReports([]);
    return;
  }
  
  let result = [...pastReports];
  
  // Apply status filter
  if (statusFilter !== 'all') {
    result = result.filter(report => report.status === statusFilter);
  }
  
  // Apply search filter
  if (searchTerm.trim() !== '') {
    const searchLower = searchTerm.toLowerCase();
    result = result.filter(report => 
      report.crimeType.toLowerCase().includes(searchLower) ||
      report.referenceNumber.toLowerCase().includes(searchLower) ||
      report.location.toLowerCase().includes(searchLower)
    );
  }
  
  setFilteredReports(result);
  setCurrentPage(1); // Reset to first page when filters change
}, [statusFilter, searchTerm, pastReports]);

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
      } else {
        setErrorMessage(data.error || 'Failed to update profile');
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      setErrorMessage('Error updating profile');
      setIsErrorModalOpen(true);
    }
  };

  // Handle deleting a report
  const handleDeleteReport = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        setPastReports(pastReports.filter((report) => report._id !== id));
        setIsSuccessModalOpen(true);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to delete report');
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      setErrorMessage('Error deleting report');
      setIsErrorModalOpen(true);
    }
  };

  // Handle view report details
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLogoutModalOpen(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  // Format date from ISO to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Pagination calculations
const safeFilteredReports = Array.isArray(filteredReports) ? filteredReports : [];
const totalPages = Math.ceil(safeFilteredReports.length / rowsPerPage);
const startIndex = (currentPage - 1) * rowsPerPage;
const endIndex = startIndex + rowsPerPage;
const currentReports = safeFilteredReports.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
        >
          &lt;
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    );
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Investigation':
        return 'bg-purple-100 text-purple-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <OfficerHeader handleLogout={handleLogout} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">My Reports</h2>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by crime type, reference number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
                >
                  <FaFilter className="mr-2 text-gray-600" />
                  <span>Filter</span>
                </button>
                
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={15}>15 per page</option>
                </select>
              </div>
            </div>
            
            {/* Filter options */}
            {isFilterOpen && (
              <div className="mt-4 p-4 bg-white border rounded-lg">
                <h4 className="font-medium mb-2">Filter by Status:</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('Under Review')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      statusFilter === 'Under Review' ? 'bg-blue-600 text-white' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => setStatusFilter('In Progress')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      statusFilter === 'In Progress' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setStatusFilter('Investigation')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      statusFilter === 'Investigation' ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    Investigation
                  </button>
                  <button
                    onClick={() => setStatusFilter('Closed')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      statusFilter === 'Closed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    Closed
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Reports Table */}
          {filteredReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crime Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.crimeType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{report.referenceNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{formatDate(report.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status || 'Under Review'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{report.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No reports found.
            </div>
          )}
          
          {/* Pagination */}
          {filteredReports.length > rowsPerPage && (
            <div className="p-4 border-t border-gray-200">
              {renderPagination()}
            </div>
          )}
        </div>
      </div>

      {/* View Report Modal */}
      {isViewModalOpen && selectedReport && (
        <Modal onClose={() => setIsViewModalOpen(false)}>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Report Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Crime Type</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.crimeType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.referenceNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedReport.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-sm text-gray-900">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status || 'Under Review'}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.description}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <Modal onClose={() => setIsSuccessModalOpen(false)}>
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Success!</h3>
            <p className="text-sm text-gray-700">Your action was completed successfully.</p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Error Modal */}
      {isErrorModalOpen && (
        <Modal onClose={() => setIsErrorModalOpen(false)}>
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Error</h3>
            <p className="text-sm text-gray-700">{errorMessage}</p>
            <button
              onClick={() => setIsErrorModalOpen(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <Modal onClose={() => setIsLogoutModalOpen(false)}>
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Logged Out</h3>
            <p className="text-sm text-gray-700">You have been successfully logged out. Redirecting to login page...</p>
          </div>
        </Modal>
      )}
    </>
  );
}

export default UserProfile;
