import React from "react";
import { FaUserShield, FaSearch, FaChartLine, FaHandshake } from "react-icons/fa";
import { motion } from "framer-motion";

const HowItWorks = () => {
  // Animation variants for cards
  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
        delay: 0.1,
      },
    },
  };

  // Process steps data
  const steps = [
    {
      icon: <FaUserShield className="text-4xl text-blue-600" />,
      title: "Report a Crime",
      description: "Submit details of the crime securely and anonymously through our encrypted portal.",
      color: "blue",
    },
    {
      icon: <FaSearch className="text-4xl text-indigo-600" />,
      title: "Officer Reviews",
      description: "Our dedicated team of experts reviews your report within 24 hours with strict confidentiality.",
      color: "indigo",
    },
    {
      icon: <FaChartLine className="text-4xl text-purple-600" />,
      title: "Track Progress",
      description: "Monitor your case status in real-time through our secure dashboard with customizable alerts.",
      color: "purple",
    },
    {
      icon: <FaHandshake className="text-4xl text-teal-600" />,
      title: "Resolution",
      description: "Receive updates on actions taken and how your report has contributed to community safety.",
      color: "teal",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            How <span className="text-blue-600">It Works</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Our streamlined process ensures your reports are handled efficiently and professionally
            while maintaining the highest standards of security and privacy.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.2 }}
              variants={cardVariants}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-gray-100 flex flex-col">
                <div className="flex justify-center mb-6">
                  <div className={`bg-${step.color}-100 p-5 rounded-full`}>
                    {step.icon}
                  </div>
                </div>
                <h3 className={`text-2xl font-semibold mb-4 text-${step.color}-600`}>
                  {step.title}
                </h3>
                <p className="text-gray-600 flex-grow">
                  {step.description}
                </p>
                <div className="mt-6 flex justify-center">
                  <span className={`text-${step.color}-600 font-medium text-sm`}>
                    Step {index + 1}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <a
              href="#report"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300 inline-flex items-center"
            >
              Start Your Report
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;