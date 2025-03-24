import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FormReview() {
  const [formData, setFormData] = useState({
    text: '',
    rating: 5,
    author: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Using fetch instead of axios
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit testimonial');
      }
      
      setStatus({
        type: 'success',
        message: 'Thank you for your feedback! Your testimonial has been submitted for review.'
      });
      setFormData({ text: '', rating: 5, author: '' });
      
      // After 3 seconds, redirect to homepage
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'There was an error submitting your testimonial. Please try again.'
      });
      console.error('Error submitting testimonial:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-6 text-center text-blue-600">Share Your Experience</h3>
      
      {status.message && (
        <div className={`p-4 mb-4 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="rating" className="block text-gray-700 mb-2">Rating</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="text-2xl focus:outline-none"
              >
                {star <= formData.rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="text" className="block text-gray-700 mb-2">Your Testimonial</label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Share your experience with our platform..."
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label htmlFor="author" className="block text-gray-700 mb-2">Your Name (Optional)</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Anonymous"
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-1/2 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-1/2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-300"
          >
            {submitting ? 'Submitting...' : 'Submit Testimonial'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormReview;