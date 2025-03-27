import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import axios from 'axios';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // backend URL
  const API_URL = 'http://localhost:5000'; 

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Use the full URL including the API_URL
        const response = await axios.get(`${API_URL}/api/testimonials`);
        setTestimonials(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load testimonials');
        setLoading(false);
        console.error('Error fetching testimonials:', err);
      }
    };

    fetchTestimonials();
  }, []);

  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-blue-600">What Our Users Say</h2>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-blue-600">What Our Users Say</h2>
          <div className="text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  // Fallback to default testimonials if none are found in the database
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      _id: '1',
      text: 'This platform helped me report a crime anonymously. Highly recommended!',
      rating: 5,
    },
    {
      _id: '2',
      text: 'The case tracking feature is amazing. I always knew the status of my report.',
      rating: 5,
    },
    {
      _id: '3',
      text: 'Great service! The officers were very responsive.',
      rating: 5,
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12 text-blue-600">What Our Users Say</h2>
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.2 }}
          variants={cardVariants}
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="px-4"
          >
            {displayTestimonials.map((testimonial) => (
              <SwiperSlide key={testimonial._id}>
                <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <p className="text-gray-600 italic mb-6">{testimonial.text}</p>
                  <div className="flex justify-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-2xl">⭐</span>
                    ))}
                  </div>
                  {testimonial.author && testimonial.author !== 'Anonymous' && (
                    <p className="mt-4 text-gray-500">- {testimonial.author}</p>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;