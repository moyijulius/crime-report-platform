# Crime Reporting Platform

## 📌 Project Overview
This is a role-based crime reporting platform that allows citizens to securely report crimes, track case progress, and communicate with law enforcement. The system has three user roles:

- **Normal Users**: Report crimes and track case status
- **Officers**: Review and manage crime reports
- **Admins**: Manage system content and user accounts

---

## 🚀 Prerequisites
Before running this project, ensure you have:

- **MongoDB** installed and running locally or provide a connection string to a remote MongoDB instance
- **Node.js** (v14 or later) installed
- **npm** or **yarn** package manager

---

## ⚙️ Installation
### Clone the repository:
```bash
git clone https://github.com/moyijulius/crime-report-platform.git
cd crime-reporting-platform
```

### Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 🔧 Configuration
### Backend Configuration
Create a `.env` file in the `backend` directory with the following variables:
```plaintext
MONGODB_URI=mongodb://localhost:27017/crimeReportingDB
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Frontend Configuration (if needed)
Create a `.env` file in the `frontend` directory:
```plaintext
REACT_APP_API_BASE_URL=http://localhost:5000
```

---

## 🏃‍♂️ Running the Application
### Start the backend server:
```bash
cd backend
npm start
```

### Start the frontend in a separate terminal:
```bash
cd frontend
npm start
```

The application should now be running at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 👥 User Roles & Initial Setup
### 🔐 Creating Initial Admin and Officers
Use **MongoDB Compass** or the **mongo shell** to manually create the first admin account in the `users` collection:
```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "hashed_password", // Use bcrypt to hash the password
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Creating Officers:
Officers can be created:
- By the admin through the admin dashboard after initial setup
- Or manually in the database with `role: "officer"`

### 🆕 Normal User Registration
Normal users can register through the application's registration page:
1. Navigate to [http://localhost:3000/register](http://localhost:3000/register)
2. Fill in the registration form (email, name, password)
3. Submit to create a normal user account

---

## 🌟 Key Features

### 👨‍💻 For Normal Users
#### Report a Crime
- Navigate to "Report a Crime"
- Fill in crime details (type, location, description)
- Upload supporting documents
- Choose anonymous or registered reporting
- Receive a reference number for tracking

#### Track Case Status
- Use reference number to check status
- View progress through visual indicators
- Message officers about specific cases

#### User Profile
- View past reports
- Update personal information
- Manage notification preferences

### 👮 For Officers
#### Officer Dashboard
- View assigned cases
- Update case status
- Communicate with reporters
- Review submitted evidence

### 👨‍⚖️ For Admins
#### User Management
- Create/edit/delete users
- Assign officer roles


#### Content Management
- Approve/reject testimonials
- Monitor all reports
- Manage system settings

---

## 🤖 AI Chatbot Assistance
The report crime page includes an **AI chatbot** that:
- Provides guidance on completing reports
- Answers common questions
- Suggests optimal ways to describe incidents

---

## 📊 Database Collections
The **MongoDB database** uses these main collections:
- `users` - Stores all user accounts (normal users, officers, admins)
- `reports` - Contains all crime reports with status updates
- `testimonials` - Stores user testimonials for the homepage
- `messages` - Contains communication between users and officers

---

## 🛠 Troubleshooting
### MongoDB Connection Issues
- Ensure MongoDB is running (`sudo systemctl start mongod` on Linux)
- Verify connection string in `.env` file

### Authentication Problems
- Check JWT secret in backend `.env`
- Ensure passwords are properly hashed before manual DB insertion

### Frontend-Backend Communication
- Verify `REACT_APP_API_BASE_URL` matches your backend URL
- Check **CORS settings** in backend if requests are blocked

---


For support or questions, please contact moyijulius17@gmail.com.

