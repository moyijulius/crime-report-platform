
import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaFilter,
  FaDownload,
  FaBell,
  FaUserCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaChevronLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function OfficerDashboard() {
  // State management
  const [selectedReport, setSelectedReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [crimeReports, setCrimeReports] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [crimeTypeFilter, setCrimeTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("dateDesc");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [officerProfile, setOfficerProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  // Added state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);

  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setCrimeReports([]);
    setSelectedReport(null);
    setMessages([]);
    setIsLogoutModalOpen(true);

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  // Fetch officer profile - uncommented and fixed
  useEffect(() => {
    const fetchOfficerProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
      
        const mockData = {
          name: "Officer John Doe",
          badge: "ID: 12345",
          department: "Central Division",
          role: "Detective"
        };
        
        setOfficerProfile(mockData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading officer profile');
      }
    };
    
    fetchOfficerProfile();
  }, [navigate]);

  // Fetch reports - improved error handling and added progress indication
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Try to fetch from API, fall back to mock data if it fails
        let data;
        try {
          const response = await fetch("http://localhost:5000/api/reports", {
            headers: { Authorization: `Bearer ${token}` },
            // Added timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000)
          });

          if (!response.ok) {
            throw new Error("Failed to fetch reports");
          }

          data = await response.json();
        } catch (apiError) {
          console.warn("API error, using mock data:", apiError);
          // Mock data for demonstration
          data = generateMockReports(25);
        }

        const reportsWithMessages = data.map((report) => ({
          ...report,
          messages: report.messages || [],
          documents: report.files || [],
          priority: getPriorityLevel(report.crimeType),
        }));

        setCrimeReports(reportsWithMessages);

        // Set initial dashboard statistics
        if (activeTab === "dashboard") {
          generateDashboardStats(reportsWithMessages);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        setError("Failed to load reports. Please try again later.");
        toast.error("Error loading reports");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();

    // Setup periodic refresh every 5 minutes
    const refreshInterval = setInterval(fetchReports, 300000);
    return () => clearInterval(refreshInterval);
  }, [navigate]);

  // Generate mock reports for demonstration
  const generateMockReports = (count) => {
    const crimeTypes = ["Assault", "Robbery", "Theft", "Burglary", "Vandalism", "Fraud"];
    const statuses = ["Under Review", "In Progress", "Investigation", "Closed"];
    const locations = ["Main Street", "Oak Avenue", "Pine Road", "Cedar Lane", "Maple Drive"];
    
    return Array(count).fill().map((_, index) => {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
      
      return {
        _id: `id-${index}`,
        referenceNumber: `CR-2023-${1000 + index}`,
        crimeType: crimeTypes[Math.floor(Math.random() * crimeTypes.length)],
        description: `This is a sample description for report ${index + 1}.`,
        location: locations[Math.floor(Math.random() * locations.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString(),
        contactEmail: `reporter${index}@example.com`,
        messages: [],
        files: []
      };
    });
  };

  // Fetch notifications - implemented with better error handling
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Mock fetch for notifications
        const mockNotifications = [
          {
            id: 1,
            message: "New report submitted: Theft at Main Street",
            isRead: false,
            timestamp: new Date(Date.now() - 3600000),
          },
          {
            id: 2,
            message: "Status update required for case #CR-2023-0042",
            isRead: false,
            timestamp: new Date(Date.now() - 7200000),
          },
          {
            id: 3,
            message: "Citizen message on case #CR-2023-0039",
            isRead: true,
            timestamp: new Date(Date.now() - 86400000),
          },
        ];

        setNotifications(mockNotifications);
        setHasUnreadNotifications(
          mockNotifications.some((notif) => !notif.isRead)
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Silent fail for notifications to not disrupt main functionality
      }
    };

    fetchNotifications();

    // Setup periodic refresh every 2 minutes
    const notificationInterval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(notificationInterval);
  }, []);

  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState({
    totalCases: 0,
    openCases: 0,
    resolvedCases: 0,
    highPriorityCases: 0,
    recentActivity: [],
    crimeTypeDistribution: {},
    casesByStatus: {},
    weeklyTrend: [],
  });

  // Generate dashboard statistics - improved calculations
  const generateDashboardStats = (reports) => {
    if (!reports || reports.length === 0) {
      return;
    }
    
    const totalCases = reports.length;
    const openCases = reports.filter((r) => r.status !== "Closed").length;
    const resolvedCases = reports.filter((r) => r.status === "Closed").length;
    const highPriorityCases = reports.filter(
      (r) => getPriorityLevel(r.crimeType) === "high"
    ).length;

    // Crime type distribution
    const crimeTypeDistribution = reports.reduce((acc, report) => {
      acc[report.crimeType] = (acc[report.crimeType] || 0) + 1;
      return acc;
    }, {});

    // Cases by status
    const casesByStatus = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});

    // Recent activity (last 5 updated reports)
    const recentActivity = [...reports]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      )
      .slice(0, 5);

    // Generate weekly trend from actual report data
    const weeklyTrend = generateWeeklyTrend(reports);

    setDashboardStats({
      totalCases,
      openCases,
      resolvedCases,
      highPriorityCases,
      recentActivity,
      crimeTypeDistribution,
      casesByStatus,
      weeklyTrend,
    });
  };

  // Generate weekly trend from reports
  const generateWeeklyTrend = (reports) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    const weekData = Array(7).fill().map((_, i) => {
      const dayIndex = (dayOfWeek - 6 + i + 7) % 7; // Calculate correct day index
      return {
        day: dayNames[dayIndex],
        cases: 0,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - i))
      };
    });
    
    // Count reports per day
    reports.forEach(report => {
      const reportDate = new Date(report.createdAt);
      for (let i = 0; i < 7; i++) {
        if (reportDate.toDateString() === weekData[i].date.toDateString()) {
          weekData[i].cases++;
          break;
        }
      }
    });
    
    return weekData;
  };

  // Determine priority level based on crime type
  const getPriorityLevel = (crimeType) => {
    const highPriorityCrimes = [
      "Assault",
      "Robbery",
      "Homicide",
      "Kidnapping",
      "Rape",
    ];
    const mediumPriorityCrimes = ["Burglary", "Theft", "Fraud", "Vandalism"];

    if (highPriorityCrimes.includes(crimeType)) return "high";
    if (mediumPriorityCrimes.includes(crimeType)) return "medium";
    return "low";
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Under Review":
        return "bg-yellow-500";
      case "In Progress":
        return "bg-blue-500";
      case "Investigation":
        return "bg-purple-500";
      case "Closed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setMessages(report.messages || []);
    // Close sidebar on mobile when viewing details
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Improved message sending with loading state
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedReport || sendingMessage) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem("token");
     

      // Mock successful response
      const messageData = {
        text: newMessage,
        sender: "officer",
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...messages, messageData];
      setMessages(updatedMessages);
      setNewMessage("");

      const updatedReports = crimeReports.map((report) =>
        report._id === selectedReport._id
          ? { ...report, messages: updatedMessages }
          : report
      );
      setCrimeReports(updatedReports);
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Apply filters and search to reports - improved filtering logic
  const getFilteredReports = () => {
    return crimeReports.filter((report) => {
      // Apply tab filter
      if (activeTab === "pending" && report.status === "Closed") return false;
      if (activeTab === "resolved" && report.status !== "Closed") return false;

      // Apply search term - improved to be case-insensitive and handle null values
      // Apply search term - improved to be case-insensitive and handle null values
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          (report.referenceNumber?.toLowerCase().includes(search) ||
          report.description?.toLowerCase().includes(search) ||
          report.location?.toLowerCase().includes(search) ||
          report.crimeType?.toLowerCase().includes(search) ||
          report.contactEmail?.toLowerCase().includes(search));
        
        if (!matchesSearch) return false;
      }

      // Apply status filter
      if (statusFilter !== "all" && report.status !== statusFilter) return false;

      // Apply crime type filter
      if (crimeTypeFilter !== "all" && report.crimeType !== crimeTypeFilter) return false;

      // Apply time filter
      if (timeFilter !== "all") {
        const reportDate = new Date(report.createdAt);
        const now = new Date();
        const daysDifference = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));

        if (timeFilter === "today" && daysDifference > 0) return false;
        if (timeFilter === "week" && daysDifference > 7) return false;
        if (timeFilter === "month" && daysDifference > 30) return false;
      }

      return true;
    });
  };

  // Sort filtered reports
  const getSortedReports = (reports) => {
    return [...reports].sort((a, b) => {
      switch (sortOption) {
        case "dateAsc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "dateDesc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "priorityDesc":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "statusAsc":
          return a.status.localeCompare(b.status);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  // Get current page reports for pagination
  const getCurrentPageReports = () => {
    const filteredReports = getFilteredReports();
    const sortedReports = getSortedReports(filteredReports);
    
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    
    return sortedReports.slice(indexOfFirstReport, indexOfLastReport);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case "status":
        setStatusFilter(value);
        break;
      case "crimeType":
        setCrimeTypeFilter(value);
        break;
      case "time":
        setTimeFilter(value);
        break;
      case "sort":
        setSortOption(value);
        break;
      default:
        break;
    }
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("all");
    setCrimeTypeFilter("all");
    setTimeFilter("all");
    setSortOption("dateDesc");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handle status update for a report
  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      
      
      // Mock successful update
      const updatedReports = crimeReports.map((report) =>
        report._id === reportId ? { ...report, status: newStatus } : report
      );
      
      setCrimeReports(updatedReports);
      
      if (selectedReport && selectedReport._id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
      
      toast.success(`Status updated to ${newStatus}`);
      
      // Update dashboard statistics if on dashboard tab
      if (activeTab === "dashboard") {
        generateDashboardStats(updatedReports);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  // Handle pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle mark all notifications as read
  const markAllNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      isRead: true
    }));
    setNotifications(updatedNotifications);
    setHasUnreadNotifications(false);
  };

  // Export reports to CSV
  const exportReportsToCSV = () => {
    const filteredReports = getFilteredReports();
    if (filteredReports.length === 0) {
      toast.warning("No reports to export");
      return;
    }
    
    try {
      // Create CSV content
      const headers = ["Reference", "Type", "Location", "Status", "Date", "Priority"];
      let csvContent = headers.join(",") + "\n";
      
      filteredReports.forEach(report => {
        const row = [
          report.referenceNumber,
          report.crimeType,
          report.location,
          report.status,
          new Date(report.createdAt).toLocaleDateString(),
          report.priority
        ];
        csvContent += row.join(",") + "\n";
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `crime_reports_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Reports exported successfully");
    } catch (error) {
      console.error("Error exporting reports:", error);
      toast.error("Error exporting reports");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
            <h1 className="text-xl font-bold">Police Department Portal</h1>
          </div>
          <div className="flex items-center">
            <button
              className="relative mr-4 text-white"
              onClick={() => setNotificationModalOpen(!notificationModalOpen)}
            >
              <FaBell size={20} />
              {hasUnreadNotifications && (
                <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3"></span>
              )}
            </button>
            <div className="hidden md:block">
              {officerProfile && (
                <div className="flex items-center">
                  <FaUserCircle size={24} className="mr-2" />
                  <div>
                    <p className="text-sm font-semibold">{officerProfile.name}</p>
                    <p className="text-xs">{officerProfile.badge}</p>
                  </div>
                </div>
              )}
            </div>
            <button
              className="ml-4 bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-gray-800 text-white w-64 flex-shrink-0 fixed md:relative md:translate-x-0 inset-y-0 left-0 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out z-30 md:z-auto overflow-y-auto`}
          style={{ top: "60px", height: "calc(100% - 60px)" }}
        >
          <nav className="p-4">
            {officerProfile && (
              <div className="mb-6 p-3 bg-gray-700 rounded-lg md:hidden">
                <FaUserCircle size={48} className="mx-auto mb-2" />
                <p className="text-center font-semibold">{officerProfile.name}</p>
                <p className="text-center text-sm text-gray-300">{officerProfile.badge}</p>
                <p className="text-center text-xs text-gray-400">{officerProfile.department}</p>
              </div>
            )}
            <ul>
              <li className="mb-2">
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === "dashboard"
                      ? "bg-blue-700 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <span className="mr-3">📊</span> Dashboard
                </button>
              </li>
              <li className="mb-2">
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === "all"
                      ? "bg-blue-700 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  <span className="mr-3">📋</span> All Reports
                </button>
              </li>
              <li className="mb-2">
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === "pending"
                      ? "bg-blue-700 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveTab("pending")}
                >
                  <span className="mr-3">⏳</span> Pending Reports
                </button>
              </li>
              <li className="mb-2">
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === "resolved"
                      ? "bg-blue-700 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveTab("resolved")}
                >
                  <span className="mr-3">✅</span> Resolved
                </button>
              </li>
            </ul>
            <div className="border-t border-gray-700 my-4"></div>
            <ul>
              <li className="mb-2">
                <button
                  className="w-full text-left px-4 py-2 rounded-lg flex items-center text-gray-300 hover:bg-gray-700"
                  onClick={() => alert("Feature coming soon")}
                >
                  <span className="mr-3">📈</span> Analytics
                </button>
              </li>
              <li className="mb-2">
                <button
                  className="w-full text-left px-4 py-2 rounded-lg flex items-center text-gray-300 hover:bg-gray-700"
                  onClick={() => alert("Feature coming soon")}
                >
                  <span className="mr-3">⚙️</span> Settings
                </button>
              </li>
              <li className="mb-2">
                <button
                  className="w-full text-left px-4 py-2 rounded-lg flex items-center text-gray-300 hover:bg-gray-700"
                  onClick={() => alert("Feature coming soon")}
                >
                  <span className="mr-3">❓</span> Help
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Reports</p>
                      <h3 className="text-3xl font-bold text-gray-800">{dashboardStats.totalCases}</h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <span className="text-blue-800 text-xl">📋</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Open Cases</p>
                      <h3 className="text-3xl font-bold text-gray-800">{dashboardStats.openCases}</h3>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <span className="text-yellow-800 text-xl">⏳</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Resolved</p>
                      <h3 className="text-3xl font-bold text-gray-800">{dashboardStats.resolvedCases}</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <span className="text-green-800 text-xl">✅</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">High Priority</p>
                      <h3 className="text-3xl font-bold text-gray-800">{dashboardStats.highPriorityCases}</h3>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <span className="text-red-800 text-xl">🔥</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent activity and charts section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-5 lg:col-span-1">
                  <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                  {dashboardStats.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardStats.recentActivity.map((report, index) => (
                        <div key={index} className="border-b pb-3 last:border-0">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{report.referenceNumber}</span>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(report.status)} text-white`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{report.crimeType} - {report.location}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(report.updatedAt || report.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No recent activity</p>
                  )}
                </div>

                {/* Weekly Trend Chart */}
                <div className="bg-white rounded-lg shadow p-5 lg:col-span-2">
                  <h3 className="text-xl font-semibold mb-4">Weekly Case Trend</h3>
                  <div className="h-60">
                    {dashboardStats.weeklyTrend.length > 0 ? (
                      <div className="flex items-end h-48 w-full">
                        {dashboardStats.weeklyTrend.map((day, index) => {
                          const maxCases = Math.max(...dashboardStats.weeklyTrend.map(d => d.cases));
                          const heightPercentage = day.cases ? (day.cases / maxCases) * 100 : 0;
                          return (
                            <div key={index} className="flex flex-col items-center flex-1">
                              <div className="w-full px-1">
                                <div 
                                  className="bg-blue-500 rounded-t" 
                                  style={{ height: `${heightPercentage}%`, minHeight: day.cases ? '4px' : '0' }}
                                />
                              </div>
                              <div className="text-xs mt-2">{day.day}</div>
                              <div className="text-xs font-medium">{day.cases}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional charts row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Crime Type Distribution */}
                <div className="bg-white rounded-lg shadow p-5">
                  <h3 className="text-xl font-semibold mb-4">Crime Type Distribution</h3>
                  {Object.keys(dashboardStats.crimeTypeDistribution).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(dashboardStats.crimeTypeDistribution).map(([type, count]) => (
                        <div key={type}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">{type}</span>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${(count / dashboardStats.totalCases) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No data available</p>
                  )}
                </div>

                {/* Status Distribution */}
                <div className="bg-white rounded-lg shadow p-5">
                  <h3 className="text-xl font-semibold mb-4">Status Distribution</h3>
                  {Object.keys(dashboardStats.casesByStatus).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(dashboardStats.casesByStatus).map(([status, count]) => {
                        let statusColor;
                        switch (status) {
                          case "Under Review": statusColor = "bg-yellow-500"; break;
                          case "In Progress": statusColor = "bg-blue-500"; break;
                          case "Investigation": statusColor = "bg-purple-500"; break;
                          case "Closed": statusColor = "bg-green-500"; break;
                          default: statusColor = "bg-gray-500";
                        }
                        
                        return (
                          <div key={status}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{status}</span>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`${statusColor} h-2.5 rounded-full`} 
                                style={{ width: `${(count / dashboardStats.totalCases) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reports Lists (All, Pending, Resolved) */}
          {(activeTab === "all" || activeTab === "pending" || activeTab === "resolved") && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  {activeTab === "all" && "All Crime Reports"}
                  {activeTab === "pending" && "Pending Reports"}
                  {activeTab === "resolved" && "Resolved Reports"}
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterModalOpen(true)}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-300 flex items-center"
                    >
                      <FaFilter className="mr-2 text-gray-600" /> Filter
                    </button>
                    
                    <button
                      onClick={exportReportsToCSV}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white flex items-center"
                    >
                      <FaDownload className="mr-2" /> Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Applied filters display */}
              {(statusFilter !== "all" || crimeTypeFilter !== "all" || timeFilter !== "all" || searchTerm) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {searchTerm && (
                    <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center">
                      Search: {searchTerm}
                      <button 
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        onClick={() => setSearchTerm("")}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  {statusFilter !== "all" && (
                    <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center">
                      Status: {statusFilter}
                      <button 
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        onClick={() => setStatusFilter("all")}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  {crimeTypeFilter !== "all" && (
                    <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center">
                      Type: {crimeTypeFilter}
                      <button 
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        onClick={() => setCrimeTypeFilter("all")}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  {timeFilter !== "all" && (
                    <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center">
                      Time: {timeFilter}
                      <button 
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        onClick={() => setTimeFilter("all")}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <button 
                    className="text-red-600 hover:text-red-800 text-sm underline"
                    onClick={clearFilters}
                  >
                    Clear All
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="bg-white rounded-lg shadow p-8 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center text-red-600 mb-4">
                    <FaExclamationTriangle className="mr-2" />
                    <p>{error}</p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Retry
                  </button>
                </div>
              ) : getCurrentPageReports().length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500 mb-2">No reports found matching your criteria</p>
                  {(statusFilter !== "all" || crimeTypeFilter !== "all" || timeFilter !== "all" || searchTerm) && (
                    <button
                      onClick={clearFilters}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getCurrentPageReports().map((report) => (
                        <tr key={report._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-blue-600">{report.referenceNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.crimeType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(report.status)} text-white`}>
                                                          {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(
                                report.priority
                              )} text-white`}
                            >
                              {report.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(report)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEye className="inline-block mr-1" /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={
                          currentPage ===
                          Math.ceil(getFilteredReports().length / reportsPerPage)
                        }
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(currentPage - 1) * reportsPerPage + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              currentPage * reportsPerPage,
                              getFilteredReports().length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {getFilteredReports().length}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <FaChevronLeft className="h-4 w-4" />
                          </button>
                          {Array.from({
                            length: Math.ceil(
                              getFilteredReports().length / reportsPerPage
                            ),
                          }).map((_, index) => (
                            <button
                              key={index}
                              onClick={() => paginate(index + 1)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === index + 1
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {index + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={
                              currentPage ===
                              Math.ceil(getFilteredReports().length / reportsPerPage)
                            }
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <FaChevronLeft className="h-4 w-4 transform rotate-180" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Report Details Modal */}
          {selectedReport && (
            <Modal
              isOpen={!!selectedReport}
              onClose={() => setSelectedReport(null)}
              title={`Report Details - ${selectedReport.referenceNumber}`}
            >
              <div className="space-y-6">
                {/* Report Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Crime Type
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReport.crimeType}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReport.location}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReport.status}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date Reported
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReport.priority}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReport.contactEmail}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Messages */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Messages
                  </h3>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          message.sender === "officer"
                            ? "bg-blue-50 ml-auto"
                            : "bg-gray-100 mr-auto"
                        }`}
                      >
                        <p className="text-sm text-gray-800">{message.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="mt-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message..."
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {sendingMessage ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Status Update */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Update Status
                  </h3>
                  <div className="flex gap-2">
                    {["Under Review", "In Progress", "Investigation", "Closed"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleStatusUpdate(selectedReport._id, status)
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            selectedReport.status === status
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </Modal>
          )}

          {/* Filter Modal */}
          {filterModalOpen && (
            <Modal
              isOpen={filterModalOpen}
              onClose={() => setFilterModalOpen(false)}
              title="Filter Reports"
            >
              <div className="space-y-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Investigation">Investigation</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Crime Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crime Type
                  </label>
                  <select
                    value={crimeTypeFilter}
                    onChange={(e) =>
                      handleFilterChange("crimeType", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="Assault">Assault</option>
                    <option value="Robbery">Robbery</option>
                    <option value="Theft">Theft</option>
                    <option value="Burglary">Burglary</option>
                    <option value="Vandalism">Vandalism</option>
                    <option value="Fraud">Fraud</option>
                  </select>
                </div>

                {/* Time Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <select
                    value={timeFilter}
                    onChange={(e) => handleFilterChange("time", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                {/* Sort Option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortOption}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dateDesc">Newest First</option>
                    <option value="dateAsc">Oldest First</option>
                    <option value="priorityDesc">Priority (High to Low)</option>
                    <option value="statusAsc">Status (A-Z)</option>
                  </select>
                </div>
              </div>
            </Modal>
          )}

          {/* Notification Modal */}
          {notificationModalOpen && (
            <Modal
              isOpen={notificationModalOpen}
              onClose={() => setNotificationModalOpen(false)}
              title="Notifications"
            >
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  <>
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Mark all as read
                    </button>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg ${
                          notification.isRead
                            ? "bg-gray-50"
                            : "bg-blue-50 border border-blue-200"
                        }`}
                      >
                        <p className="text-sm text-gray-800">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-gray-500">No notifications</p>
                )}
              </div>
            </Modal>
          )}
        </main>
      </div>

      {/* Footer */}
    
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default OfficerDashboard;