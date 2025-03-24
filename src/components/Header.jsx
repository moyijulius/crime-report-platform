import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaSearch, FaUser, FaBell } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  // Check if a nav link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={`${
        isScrolled ? "bg-blue-700 py-2" : "bg-blue-600 py-4"
      } text-white fixed w-full top-0 z-50 shadow-lg transition-all duration-300`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo with improved spacing and animation */}
        <Link to="/" className="flex items-center group">
          <img 
            src={logo} 
            alt="CrimeReport Logo" 
            className="h-10 mr-3 transition-transform duration-300 group-hover:scale-105" 
          />
          <span className="text-2xl font-bold tracking-tight">
            Crime<span className="text-yellow-300">Report</span>
          </span>
        </Link>

        {/* Desktop Navigation and Search Bar */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Navigation Links */}
          <nav>
            <ul className="flex space-x-6 items-center">
              <li>
                <Link
                  to="/"
                  className={`${
                    isActive("/") 
                      ? "text-yellow-300 font-semibold" 
                      : "hover:text-blue-200"
                  } transition-colors duration-300`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/report"
                  className={`${
                    isActive("/report") 
                      ? "text-yellow-300 font-semibold" 
                      : "hover:text-blue-200"
                  } transition-colors duration-300`}
                >
                  Report Crime
                </Link>
              </li>
              <li>
                <Link
                  to="/track"
                  className={`${
                    isActive("/track") 
                      ? "text-yellow-300 font-semibold" 
                      : "hover:text-blue-200"
                  } transition-colors duration-300`}
                >
                  Track Case
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={`${
                    isActive("/contact") 
                      ? "text-yellow-300 font-semibold" 
                      : "hover:text-blue-200"
                  } transition-colors duration-300`}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-blue-800 rounded-full overflow-hidden border border-blue-400 focus-within:border-white transition-all duration-300"
          >
            <input
              type="text"
              placeholder="Search cases, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-blue-800 text-white placeholder-blue-300 focus:outline-none w-48 lg:w-64"
            />
            <button
              type="submit"
              className="text-white px-4 py-2 hover:bg-blue-700 transition-colors duration-300"
              aria-label="Search"
            >
              <FaSearch />
            </button>
          </form>

          {/* Login/SignUp Button */}
          <button
            onClick={handleLoginClick}
            className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-medium py-2 px-5 rounded-full transition-all duration-300 flex items-center"
          >
            <FaUser className="mr-2" />
            <span>Login / Sign Up</span>
          </button>
        </div>

        {/* Mobile Nav Controls */}
        <div className="flex items-center space-x-3 lg:hidden">
          <button 
            onClick={() => navigate('/search')}
            className="text-xl p-2"
            aria-label="Search"
          >
            <FaSearch />
          </button>
          <button 
            onClick={handleLoginClick}
            className="text-xl p-2"
            aria-label="Login"
          >
            <FaUser />
          </button>
          <button 
            className="text-xl p-2" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu - Slide Down Animation */}
      <div 
        className={`lg:hidden bg-blue-800 overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container mx-auto px-4 py-2">
          <ul className="flex flex-col space-y-4 py-4">
            <li>
              <Link
                to="/"
                className={`block py-2 px-3 rounded ${
                  isActive("/") 
                    ? "bg-blue-700 text-yellow-300 font-semibold" 
                    : "hover:bg-blue-700"
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/report"
                className={`block py-2 px-3 rounded ${
                  isActive("/report") 
                    ? "bg-blue-700 text-yellow-300 font-semibold" 
                    : "hover:bg-blue-700"
                }`}
              >
                Report Crime
              </Link>
            </li>
            <li>
              <Link
                to="/track"
                className={`block py-2 px-3 rounded ${
                  isActive("/track") 
                    ? "bg-blue-700 text-yellow-300 font-semibold" 
                    : "hover:bg-blue-700"
                }`}
              >
                Track Case
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`block py-2 px-3 rounded ${
                  isActive("/contact") 
                    ? "bg-blue-700 text-yellow-300 font-semibold" 
                    : "hover:bg-blue-700"
                }`}
              >
                Contact Us
              </Link>
            </li>
            <li className="pt-2">
              <button
                onClick={handleLoginClick}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-medium py-3 px-5 rounded-full transition-colors duration-300 flex items-center justify-center"
              >
                <FaUser className="mr-2" />
                <span>Login / Sign Up</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;