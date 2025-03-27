import React, { useState, useEffect } from 'react';

function TrackCase() {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [caseStatus, setCaseStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [isAssociatedUser, setIsAssociatedUser] = useState(false); 

  // Check if the user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    console.log('Token:', token);
    console.log('User ID:', userId);
    setIsLoggedIn(!!token); // Set isLoggedIn to true if token exists
  }, []);
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      if (!referenceNumber.trim()) {
        setError('Please enter a reference number');
        setIsLoading(false);
        return;
      }
  
      if (!referenceNumber.startsWith('REF-')) {
        setError('Invalid reference number format. Reference numbers should start with "REF-"');
        setIsLoading(false);
        return;
      }
  
      const token = localStorage.getItem('token');
      const loggedInUserId = localStorage.getItem('userId');
  
      const response = await fetch(`http://localhost:5000/api/reports/${referenceNumber.trim()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      console.log('Response:', data);
  
      if (response.ok) {
        setCaseStatus(data);
        if (data.messages) {
          setMessages(data.messages);
        }
  
        // Check if the logged-in user is associated with the case
        if (data.userId === loggedInUserId || data.assignedTo === loggedInUserId) {
          setIsAssociatedUser(true);
        } else {
          setIsAssociatedUser(false);
        }
      } else {
        setError(data.error || 'No case found with this reference number');
        setCaseStatus(null);
        setIsAssociatedUser(false);
      }
    } catch (error) {
      setError('Unable to connect to the server. Please try again later.');
      setCaseStatus(null);
      setIsAssociatedUser(false);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
  
    if (!isAssociatedUser) {
      setError('You are not authorized to send messages for this case.');
      return;
    }
  
    if (!newMessage.trim()) {
      setError('Message cannot be empty.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
  
      const response = await fetch(`http://localhost:5000/api/reports/${referenceNumber}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data]);
        setNewMessage('');
        setError('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message. Please try again.');
    }
  };
  
  return (
    <section className="py-12 bg-gray-50 ">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-8">Track Your Case</h2>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="reference" className="text-sm text-gray-600">
                Reference Number (e.g., REF-XXXXXXXXX)
              </label>
              <div className="flex">
                <input
                  id="reference"
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter case reference number"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`ml-2 px-6 py-2 rounded-lg text-white transition-colors duration-300
                    ${isLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Case Status */}
        {caseStatus && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Case Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Reference Number:</span>
                <span className="font-medium">{caseStatus.referenceNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Crime Type:</span>
                <span className="font-medium">{caseStatus.crimeType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm
                  ${caseStatus.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                    caseStatus.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      caseStatus.status === 'Investigation' ? 'bg-purple-100 text-purple-800' :
                        caseStatus.status === 'Closed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}`}>
                  {caseStatus.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Date Submitted:</span>
                <span className="font-medium">
                  {new Date(caseStatus.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Messages */}
              <div className="mt-8">
                <h4 className="text-xl font-bold mb-4">Communication with Officers</h4>
                <div className="h-64 overflow-y-auto mb-4 border p-4 rounded-lg bg-gray-50">
                {messages.map((msg, index) => {
  console.log(msg.sender); // Debugging: Check the sender value
  return (
    <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
      <div
        className={`inline-block px-4 py-2 rounded-lg max-w-[80%] break-words
          ${msg.sender === 'user'
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-700 rounded-bl-none'
          }`}
      >
        {msg.text}
      </div>
      <div className={`text-xs text-gray-500 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
        {msg.sender === 'user' ? 'You' : 'Officer'} •
        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
      </div>
    </div>
  );
})}

 </div>

                {/* Message Input */}
                {!isLoggedIn ? (
                  <div className="text-center text-gray-500">
                    You must <a href="/login" className="text-blue-600 hover:underline">log in</a> to send a message.
                  </div>
                ) : !isAssociatedUser ? (
                  <div className="text-center text-gray-500">
                    You are not authorized to send messages for this case.
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      placeholder="Type a message to the officer..."
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      Send
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default TrackCase;