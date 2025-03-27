import React, { useState, useEffect } from 'react';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // More conversational initial messages
  const initialMessages = [
    { text: "Hi there. I'm here to support you through the crime reporting process.", sender: 'bot' },
    { text: "If you've experienced or witnessed a crime, I'm ready to help guide you.", sender: 'bot' }
  ];

  useEffect(() => {
    setMessages(initialMessages);
  }, []);

  const generateHumanLikeResponse = (userInput) => {
    const lowercaseInput = userInput.toLowerCase();

    // More nuanced, empathetic, and conversational responses
    const responseCategories = {
      'help': [
        "Of course, I'm here to help. What specific concerns do you have about reporting a crime?",
        "I understand this can be a difficult process. Let me walk you through our reporting system step by step.",
        "Reporting a crime can feel overwhelming. I'll do my best to make this as smooth as possible for you."
      ],
      'safety': [
        "Your safety is our top priority. We have protocols in place to protect those reporting crimes.",
        "I want to assure you that we take every report seriously and will handle your information with utmost confidentiality.",
        "Rest assured, we have multiple safeguards to protect individuals who come forward."
      ],
      'anonymous': [
        "Yes, we absolutely offer anonymous reporting. You can choose to submit a report without revealing your identity.",
        "If you're concerned about your safety, our anonymous reporting option provides you complete protection.",
        "Your comfort and security are paramount. We fully support anonymous reporting."
      ],
      'unsure': [
        "It's okay to feel uncertain. Many people are hesitant about reporting. Would you like to discuss your specific situation?",
        "Even if you're not sure whether what happened constitutes a crime, we're here to listen and provide guidance.",
        "Every report matters. Even if you're unsure, we can help you understand your options."
      ],
      'trauma': [
        "I understand this might be a sensitive and potentially traumatic experience. Would you like information about support resources?",
        "Reporting a crime can bring up difficult emotions. We're here to support you, not just process a report.",
        "Your emotional well-being is just as important as the technical details of the report."
      ]
    };

    // Intelligent response matching
    const matchResponses = (categories) => {
      for (const [category, responses] of Object.entries(categories)) {
        if (lowercaseInput.includes(category)) {
          return responses[Math.floor(Math.random() * responses.length)];
        }
      }
      return null;
    };

    // Contextual response selection
    let response = matchResponses(responseCategories);
    
    if (!response) {
      const generalResponses = [
        "I'm listening. Please tell me more about what happened.",
        "Thank you for reaching out. I'm here to help you through this process.",
        "Every piece of information helps. What would you like to share?",
        "Your courage in coming forward is important. How can I assist you today?"
      ];
      response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    return response;
  };

  const handleSend = () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      const botResponse = generateHumanLikeResponse(input);
      
      // Simulate natural typing delay
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { text: botResponse, sender: 'bot' }]);
        setInput('');
      }, 800);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="w-80 bg-white rounded-lg shadow-lg p-4 border">
          <div className="h-64 overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <span 
                  className={`inline-block px-4 py-2 rounded-lg max-w-[80%] break-words ${
                    msg.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your concerns..."
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        💬
      </button>
    </div>
  );
}

export default Chatbot;