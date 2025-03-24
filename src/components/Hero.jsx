import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaArrowRight, FaSearch, FaPhone } from "react-icons/fa";
import cityscape from "../assets/cityscape.jpg";

function Hero() {
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.2, duration: 0.8, ease: "easeOut" }
    })
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-black/80 z-10"></div>
      
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${cityscape})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          y: scrollY * 0.2, // Parallax effect
        }}
        initial={{ scale: 1.05 }}
        animate={{ 
          scale: [1.05, 1.12, 1.05],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut"
        }}
      ></motion.div>
      
      {/* Animated shape accent */}
      <motion.div 
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "loop"
        }}
      ></motion.div>
      
      {/* Hero Content Container */}
      <div className="relative z-20 container mx-auto px-6 py-12 flex flex-col items-center">
        {/* Icon and Badge */}
        <motion.div
          className="mb-6 flex items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <FaShieldAlt className="text-yellow-400 text-4xl mr-3" />
          <span className="bg-blue-900/50 text-yellow-400 text-sm uppercase tracking-wider px-3 py-1 rounded-full border border-blue-400/30 backdrop-blur-sm">
            Civil Protection Initiative
          </span>
        </motion.div>
        
        {/* Main Headline */}
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-white text-center max-w-4xl leading-tight"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Your Voice, <span className="text-yellow-400">Your Safety</span>
        </motion.h1>
        
        {/* Subheadline */}
        <motion.p
          className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl text-center font-light"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Report crimes anonymously & securely, and help build a safer community for everyone.
        </motion.p>
        
        {/* Call to Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Link 
            to="/report" 
            className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-8 py-4 rounded-lg font-medium flex-1 flex items-center justify-center transition-all group shadow-lg shadow-yellow-500/20"
          >
            Report a Crime 
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            to="/track" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium flex-1 flex items-center justify-center transition-all group border border-blue-500/30 shadow-lg shadow-blue-500/20"
          >
            Track Case
            <FaSearch className="ml-2 group-hover:scale-110 transition-transform" />
          </Link>
        </motion.div>
        
        {/* Emergency Contact */}
        <motion.div
          className="mt-10 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 text-white border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="flex items-center">
            <FaPhone className="text-red-400 mr-2" />
            <span className="text-sm">Emergency? Call <span className="font-bold text-red-400">911</span></span>
          </div>
        </motion.div>
      </div>
      
      {/* Stats Section */}
      <motion.div 
        className="relative z-20 w-full mt-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="text-center p-4">
              <h3 className="text-yellow-400 text-4xl font-bold">94%</h3>
              <p className="text-blue-100 mt-2 text-sm">Response Rate</p>
            </div>
            <div className="text-center p-4">
              <h3 className="text-yellow-400 text-4xl font-bold">12K+</h3>
              <p className="text-blue-100 mt-2 text-sm">Cases Resolved</p>
            </div>
            <div className="text-center p-4">
              <h3 className="text-yellow-400 text-4xl font-bold">100%</h3>
              <p className="text-blue-100 mt-2 text-sm">Anonymous Reporting</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center">
          <motion.div 
            className="w-2 h-2 bg-white rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          ></motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default Hero;