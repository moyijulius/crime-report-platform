import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">About CrimeReport</h3>
            <p className="text-gray-200">
              CrimeReport is a platform dedicated to helping you report crimes securely and anonymously. Your safety is our priority.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-200 hover:text-white">Home</a></li>
              <li><a href="/report" className="text-gray-200 hover:text-white">Report a Crime</a></li>
              <li><a href="/track" className="text-gray-200 hover:text-white">Track Case</a></li>
              <li><a href="/contact" className="text-gray-200 hover:text-white">Contact Us</a></li>
              <li><a href="/privacy" className="text-gray-200 hover:text-white">Privacy Policy</a></li>
              <li><a href="/review" className="text-gray-200 hover:text-white">review</a></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h3 className="text-xl font-bold mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-gray-200 mb-4">
              Stay updated with the latest news and updates from CrimeReport.
            </p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="p-2 rounded-lg text-gray-800 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Get Connected</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white"
              >
                <FaFacebook className="text-2xl" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white"
              >
                <FaTwitter className="text-2xl" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white"
              >
                <FaInstagram className="text-2xl" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white"
              >
                <FaLinkedin className="text-2xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-500 mt-8 pt-8 text-center">
          <p className="text-gray-200">
            &copy; 2023 CrimeReport. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}