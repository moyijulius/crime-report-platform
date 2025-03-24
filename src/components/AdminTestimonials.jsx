import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [testimonials, setTestimonials] = useState([]);
  const [users, setUsers] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("all");
  const [displayCount, setDisplayCount] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "user"
  });
  const [editingReportId, setEditingReportId] = useState(null);
  const [reportStatus, setReportStatus] = useState("Under Review");
  const [newMessage, setNewMessage] = useState("");
  
  const API_URL = "http://localhost:5000";
  const navigate = useNavigate();
  
  // Setup axios with auth token
  const authAxios = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`
    }
  });
// Fetch all data on component mount
const fetchData = async () => {
  try {
   
    const testimonialsRes = await authAxios.get("/api/admin/testimonials");
    setTestimonials(testimonialsRes.data);

    const usersRes = await authAxios.get("/api/admin/users");
    setUsers(usersRes.data);

    const officersRes = await authAxios.get("/api/admin/users/role/officer");
    setOfficers(officersRes.data);

    const reportsRes = await authAxios.get("/api/admin/reports");
    setReports(reportsRes.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("adminToken");
      navigate("/login");
    }
  }
};
useEffect(() => {
  // Check if admin token exists
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    navigate("/login");
    return;
  }

  // Fetch all data
  fetchData();
}, [activeTab]); // Fetch data when activeTab changes

  // Handle testimonial approval
  const updateApproval = async (id, approved) => {
    try {
      await authAxios.put(`/api/admin/testimonials/${id}`, { approved });
      setTestimonials((prev) =>
        prev.map((t) => (t._id === id ? { ...t, approved } : t))
      );
    } catch (error) {
      console.error("Error updating testimonial:", error);
    }
  };

  // Handle user form input change
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormData({
      ...userFormData,
      [name]: value
    });
  };

  // Handle user edit
  const editUser = (user) => {
    setEditingUser(user._id);
    setUserFormData({
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      role: user.role
    });
  };

  // Save user changes
  const saveUserChanges = async () => {
    try {
      const res = await authAxios.put(`/api/admin/users/${editingUser}`, userFormData);
      setUsers(users.map(user => user._id === editingUser ? res.data : user));
      
      // If we updated an officer, also update the officers list
      if (res.data.role === "officer") {
        if (officers.find(o => o._id === editingUser)) {
          setOfficers(officers.map(o => o._id === editingUser ? res.data : o));
        } else {
          setOfficers([...officers, res.data]);
        }
      } else {
        // If the user was an officer but no longer is, remove from officers list
        setOfficers(officers.filter(o => o._id !== editingUser));
      }
      
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Handle report status update
  const updateReportStatus = async (id, status) => {
    try {
      await authAxios.put(`/api/admin/reports/${id}`, { status });
      setReports(reports.map(report => 
        report._id === id ? { ...report, status } : report
      ));
      setEditingReportId(null);
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  // Send message on report
  const sendReportMessage = async (reportId) => {
    if (!newMessage.trim()) return;
    
    try {
      const res = await authAxios.post(`/api/admin/reports/${reportId}/messages`, {
        message: newMessage
      });
      
      setReports(reports.map(report => 
        report._id === reportId ? {
          ...report,
          messages: [...report.messages, res.data]
        } : report
      ));
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle deletion of any item
  const confirmDelete = (item, type) => {
    setItemToDelete({ ...item, type });
    setShowModal(true);
  };

  const deleteItem = async () => {
    if (!itemToDelete) return;

    try {
      await authAxios.delete(`/api/admin/${itemToDelete.type}/${itemToDelete._id}`);
      switch (itemToDelete.type) {
        case "testimonials":
          setTestimonials((prev) => prev.filter((t) => t._id !== itemToDelete._id));
          break;
        case "users":
          setUsers((prev) => prev.filter((u) => u._id !== itemToDelete._id));
          // Also remove from officers if applicable
          setOfficers((prev) => prev.filter((o) => o._id !== itemToDelete._id));
          break;
        case "reports":
          setReports((prev) => prev.filter((r) => r._id !== itemToDelete._id));
          break;
        default:
          break;
      }
      setShowModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  // Filter and paginate testimonials
  const filteredTestimonials = testimonials
    .filter((t) => {
      if (filter === "approved") return t.approved && !t.deleted;
      if (filter === "not-approved") return !t.approved && !t.deleted;
      if (filter === "deleted") return t.deleted;
      return !t.deleted;
    })
    .filter((t) =>
      t.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.author?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice((currentPage - 1) * displayCount, currentPage * displayCount);

  // Filter and paginate users
  const filteredUsers = users
    .filter((u) =>
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice((currentPage - 1) * displayCount, currentPage * displayCount);

  // Filter and paginate officers
  const filteredOfficers = officers
    .filter((o) =>
      o.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice((currentPage - 1) * displayCount, currentPage * displayCount);

  // Filter and paginate reports
  const filteredReports = reports
    .filter((r) => {
      if (reportFilter === "under-review") return r.status === "Under Review";
      if (reportFilter === "in-progress") return r.status === "In Progress";
      if (reportFilter === "investigation") return r.status === "Investigation";
      if (reportFilter === "closed") return r.status === "Closed";
      return true;
    })
    .filter((r) =>
      r.crimeType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice((currentPage - 1) * displayCount, currentPage * displayCount);

    return (
        <div
          className={`flex min-h-screen ${
            darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          {/* Overlay to close sidebar when clicking outside (mobile only) */}
          {isSidebarOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-0"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar Navigation */}
          <div
            className={`w-64 ${
              darkMode ? "bg-blue-900" : "bg-blue-800"
            } text-white p-6 fixed h-full transform ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 transition-transform duration-200 z-10`}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Admin Panel</h2>
              {/* Close button - only visible on mobile */}
              <button 
                className="md:hidden text-2xl font-bold" 
                onClick={() => setIsSidebarOpen(false)}
              >
                &times;
              </button>
            </div>
            
            <nav>
              <ul className="space-y-4">
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("dashboard");
                      setCurrentPage(1);
                      setIsSidebarOpen(false); // Close sidebar on navigation
                    }}
                    className={`hover:text-blue-300 ${
                      activeTab === "dashboard" ? "font-bold text-blue-300" : ""
                    }`}
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("testimonials");
                      setCurrentPage(1);
                      setIsSidebarOpen(false); // Close sidebar on navigation
                    }}
                    className={`hover:text-blue-300 ${
                      activeTab === "testimonials" ? "font-bold text-blue-300" : ""
                    }`}
                  >
                    Manage Testimonials
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("users");
                      setCurrentPage(1);
                      setIsSidebarOpen(false); // Close sidebar on navigation
                    }}
                    className={`hover:text-blue-300 ${
                      activeTab === "users" ? "font-bold text-blue-300" : ""
                    }`}
                  >
                    Manage Users
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("officers");
                      setCurrentPage(1);
                      setIsSidebarOpen(false); // Close sidebar on navigation
                    }}
                    className={`hover:text-blue-300 ${
                      activeTab === "officers" ? "font-bold text-blue-300" : ""
                    }`}
                  >
                    Manage Officers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab("reports");
                      setCurrentPage(1);
                      setIsSidebarOpen(false); // Close sidebar on navigation
                    }}
                    className={`hover:text-blue-300 ${
                      activeTab === "reports" ? "font-bold text-blue-300" : ""
                    }`}
                  >
                    Manage Reports
                  </button>
                </li>
              </ul>
            </nav>
            
            <button
              onClick={handleLogout}
              className="mt-8 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
            
            <button
              onClick={toggleDarkMode}
              className="mt-4 w-full bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-8 ml-0 md:ml-64">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden mb-4 p-2 bg-blue-800 text-white rounded"
            >
              ☰ Menu
            </button>
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md`}>
                <h3 className="text-xl font-bold">Testimonials</h3>
                <p className="text-2xl">{testimonials.length}</p>
                <p className="text-sm mt-2">
                  <span className="text-green-500">{testimonials.filter(t => t.approved).length} approved</span> | 
                  <span className="text-yellow-500"> {testimonials.filter(t => !t.approved && !t.deleted).length} pending</span>
                </p>
              </div>
              <div className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md`}>
                <h3 className="text-xl font-bold">Users</h3>
                <p className="text-2xl">{users.length}</p>
                <p className="text-sm mt-2">
                  <span className="text-blue-500">{users.filter(u => u.role === 'user').length} regular users</span>
                </p>
              </div>
              <div className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md`}>
                <h3 className="text-xl font-bold">Reports</h3>
                <p className="text-2xl">{reports.length}</p>
                <p className="text-sm mt-2">
                  <span className="text-red-500">{reports.filter(r => r.status === 'Under Review').length} under review</span> | 
                  <span className="text-blue-500"> {reports.filter(r => r.status === 'In Progress').length} in progress</span> | 
                  <span className="text-green-500"> {reports.filter(r => r.status === 'Closed').length} closed</span>
                </p>
              </div>
              <div className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md`}>
                <h3 className="text-xl font-bold">Officers</h3>
                <p className="text-2xl">{officers.length}</p>
                <p className="text-sm mt-2">
                  <span className="text-purple-500">Active officers</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Manage Testimonials */}
        {/* Manage Testimonials */}
        {activeTab === "testimonials" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Manage Testimonials</h2>
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <input
                type="text"
                placeholder="Search by author or text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`p-2 border rounded w-full md:w-auto ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`p-2 border rounded ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
                >
                  <option value="all">Show All</option>
                  <option value="approved">Approved</option>
                  <option value="not-approved">Not Approved</option>
                  <option value="deleted">Deleted</option>
                </select>
                <select
                  value={displayCount}
                  onChange={(e) => {
                    setDisplayCount(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`p-2 border rounded ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
                >
                  <option value="5">Show 5</option>
                  <option value="10">Show 10</option>
                  <option value="15">Show 15</option>
                </select>
              </div>
            </div>
            {filteredTestimonials.length === 0 ? (
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-center py-10`}>No testimonials available.</p>
            ) : (
              <div className="space-y-4">
                {filteredTestimonials.map((t) => (
                  <div key={t._id} className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md`}>
                    <p className="text-lg">{t.text}</p>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>- {t.author}</p>
                    <p className="text-sm">Rating: {t.rating} ⭐</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!t.approved && !t.deleted ? (
                        <>
                          <button
                            onClick={() => updateApproval(t._id, true)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateApproval(t._id, false)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </>
                      ) : t.approved && !t.deleted ? (
                        <span className="text-green-600">Approved ✅</span>
                      ) : (
                        <span className="text-red-600">Deleted ❌</span>
                      )}
                      <button
                        onClick={() => confirmDelete(t, "testimonials")}
                        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 ${currentPage === 1 ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white rounded`}
              >
                Previous
              </button>
              <span className="p-2">Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={filteredTestimonials.length < displayCount}
                className={`p-2 ${filteredTestimonials.length < displayCount ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white rounded`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Manage Users */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Manage Users</h2>
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`p-2 border rounded w-full md:w-auto ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
              />
              <select
                value={displayCount}
                onChange={(e) => {
                  setDisplayCount(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={`p-2 border rounded ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
              >
                <option value="5">Show 5</option>
                <option value="10">Show 10</option>
                <option value="15">Show 15</option>
              </select>
            </div>
            {filteredUsers.length === 0 ? (
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-center py-10`}>No users available.</p>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user._id} className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md`}>
                    {editingUser === user._id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Username</label>
                          <input
                            type="text"
                            name="username"
                            value={userFormData.username}
                            onChange={handleUserFormChange}
                            className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={userFormData.email}
                            onChange={handleUserFormChange}
                            className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone</label>
                          <input
                            type="text"
                            name="phone"
                            value={userFormData.phone}
                            onChange={handleUserFormChange}
                            className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Role</label>
                          <select
                            name="role"
                            value={userFormData.role}
                            onChange={handleUserFormChange}
                            className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}
                          >
                            <option value="user">User</option>
                            <option value="officer">Officer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={saveUserChanges}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-medium">{user.username}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{user.email}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Phone: {user.phone || "Not provided"}</p>
                        <p className="text-sm">
                          Role: 
                          <span className={`ml-1 px-2 py-1 rounded text-xs ${
                            user.role === "admin" 
                              ? "bg-purple-100 text-purple-800" 
                              : user.role === "officer" 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-green-100 text-green-800"
                          }`}>
                            {user.role}
                          </span>
                        </p>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => editUser(user)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(user, "users")}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 ${currentPage === 1 ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white rounded`}
              >
                Previous
              </button>
              <span className="p-2">Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={filteredUsers.length < displayCount}
                className={`p-2 ${filteredUsers.length < displayCount ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white rounded`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Manage Officers */}
        {activeTab === "officers" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Manage Officers</h2>
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`p-2 border rounded w-full md:w-auto ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
              />
              <select
                value={displayCount}
                onChange={(e) => {
                  setDisplayCount(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={`p-2 border rounded ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
              >
                <option value="5">Show 5</option>
                <option value="10">Show 10</option>
                <option value="15">Show 15</option>
              </select>
            </div>
            {filteredOfficers.length === 0 ? (
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-center py-10`}>No officers available.</p>
            ) : (
              <div className="space-y-4">
                {filteredOfficers.map((officer) => (
                  <div key={officer._id} className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md`}>
                    {editingUser === officer._id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Username</label>
                          <input
                            type="text"
                            name="username"
                            value={userFormData.username}
                            onChange={handleUserFormChange}
                            className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={userFormData.email}
                            onChange={handleUserFormChange}
                            className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone</label>
                          <input
                            type="text"
                            name="phone"
                            value={userFormData.phone}
                            onChange={handleUserFormChange}
                            className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}
                          />
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={saveUserChanges}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-medium">{officer.username}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{officer.email}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Phone: {officer.phone || "Not provided"}</p>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => editUser(officer)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(officer, "users")}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 ${currentPage === 1 ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white rounded`}
              >
                Previous
              </button>
              <span className="p-2">Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={filteredOfficers.length < displayCount}
                className={`p-2 ${filteredOfficers.length < displayCount ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white rounded`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Manage Reports */}
        {activeTab === "reports" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Manage Reports</h2>
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <input
                type="text"
                placeholder="Search by crime type, location or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`p-2 border rounded w-full md:w-auto ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={reportFilter}
                  onChange={(e) => setReportFilter(e.target.value)}
                  className={`p-2 border rounded ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
                >
                  <option value="all">All Reports</option>
                  <option value="under-review">Under Review</option>
                  <option value="in-progress">In Progress</option>
                  <option value="investigation">Investigation</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={displayCount}
                  onChange={(e) => {
                    setDisplayCount(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`p-2 border rounded ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
                >
                  <option value="5">Show 5</option>
                  <option value="10">Show 10</option>
                  <option value="15">Show 15</option>
                </select>
              </div>
            </div>
            {filteredReports.length === 0 ? (
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-center py-10`}>No reports available.</p>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report._id} className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md`}>
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{report.crimeType}</h3>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Reference: {report.referenceNumber}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Location: {report.location}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
  Date: {new Date(report.incidentDate).toLocaleDateString()}
</p>
<p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
  Reported by: {report.userId ? report.userId.username : "Unknown"}
</p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === "Under Review" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : report.status === "In Progress" 
                              ? "bg-blue-100 text-blue-800" 
                              : report.status === "Investigation" 
                                ? "bg-purple-100 text-purple-800" 
                                : "bg-green-100 text-green-800"
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium">Description:</h4>
                      <p className="text-sm mt-1">{report.description}</p>
                    </div>
                    {report.evidence && report.evidence.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium">Evidence:</h4>
                        <ul className="list-disc list-inside">
                          {report.evidence.map((item, index) => (
                            <li key={index} className="text-sm">
                              {item.type}: {item.description}
                              {item.fileUrl && (
                                <a 
                                  href={item.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-500 hover:underline"
                                >
                                  View File
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Status Update Section */}
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      {editingReportId === report._id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Update Status</label>
                            <select
                              value={reportStatus}
                              onChange={(e) => setReportStatus(e.target.value)}
                              className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}
                            >
                              <option value="Under Review">Under Review</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Investigation">Investigation</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateReportStatus(report._id, reportStatus)}
                              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => setEditingReportId(null)}
                              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingReportId(report._id);
                            setReportStatus(report.status);
                          }}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Change Status
                        </button>
                      )}
                    </div>
                    {/* Messages Section */}
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <h4 className="font-medium mb-2">Messages:</h4>
                      {report.messages && report.messages.length > 0 ? (
  <div className="space-y-3">
    {report.messages.map((msg, index) => (
      <div 
        key={index} 
        className={`p-3 rounded ${
          msg.sender && msg.sender.role === 'admin' 
            ? `${darkMode ? "bg-blue-900" : "bg-blue-100"}`
            : `${darkMode ? "bg-gray-700" : "bg-gray-100"}`
        }`}
      >
        <p className="text-sm">{msg.text}</p>
        <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {msg.sender ? msg.sender.username : "Unknown"} (
          {msg.sender ? msg.sender.role : "unknown"}) - {
          new Date(msg.timestamp).toLocaleString()}
        </p>
      </div>
    ))}
  </div>
) : (
  <p className="text-sm italic">No messages yet.</p>
)}
                      <div className="mt-3">
                        <textarea
                          placeholder="Type a message..."
                          className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}
                          rows="3"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                          onClick={() => sendReportMessage(report._id)}
                          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Send Message
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => confirmDelete(report, "reports")}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Delete Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 ${currentPage === 1 ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white rounded`}
              >
                Previous
              </button>
              <span className="p-2">Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={filteredReports.length < displayCount}
                className={`p-2 ${filteredReports.length < displayCount ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white rounded`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
          <div className={`max-w-md w-full p-6 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this {itemToDelete?.type.slice(0, -1)}?</p>
            <p className="text-sm mt-2">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={deleteItem}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;