import React from 'react';
import FormReview from './FormReview';

function ReviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Share Your Experience</h1>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          We value your feedback! Please take a moment to share your experience with our platform.
          Your testimonial helps us improve our services and helps others learn about our platform.
        </p>
        <FormReview />
      </div>
    </div>
  );
}

export default ReviewPage;