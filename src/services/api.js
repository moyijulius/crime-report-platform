// src/services/api.js

/**
 * Fetch crime reports from the API
 */
export const fetchReports = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }
  
    const response = await fetch("http://localhost:5000/api/reports", {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch reports");
    }
  
    return response.json();
  };
  
  /**
   * Fetch officer profile from the API
   */
  export const fetchOfficerProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }
  
    const response = await fetch("http://localhost:5000/api/officers/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }
  
    return response.json();
  };
  
  /**
   * Fetch notifications from the API (mock implementation)
   */
  export const fetchNotifications = async () => {
    // Mock fetch for notifications - replace with actual API
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
  
    return mockNotifications;
  };