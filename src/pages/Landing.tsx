// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Heart, Shield, Zap, Menu, X, Star, Check, ArrowRight, Activity, Brain, Stethoscope, Laptop, Wifi, Database, Bell, User } from 'lucide-react';
// import { motion } from 'framer-motion';

// const Landing: React.FC = () => {
//   const navigate = useNavigate();

//   const features = [
//     {
//       icon: <Activity className="w-6 h-6" />,
//       title: "Real-time Monitoring",
//       description: "Track vital signs with advanced IoT sensors for immediate health insights."
//     },
//     {
//       icon: <Brain className="w-6 h-6" />,
//       title: "AI-Powered Analysis",
//       description: "Advanced machine learning algorithms for predictive health analytics."
//     },
//     {
//       icon: <Bell className="w-6 h-6" />,
//       title: "Smart Alerts",
//       description: "Instant notifications for critical health changes and emergencies."
//     },
//     {
//       icon: <Shield className="w-6 h-6" />,
//       title: "Fall Detection",
//       description: "Advanced fall detection system with immediate emergency response."
//     }
//   ];

//   const stats = [
//     { value: "99.9%", label: "Uptime" },
//     { value: "24/7", label: "Monitoring" },
//     { value: "<50ms", label: "Response Time" },
//     { value: "128bit", label: "Encryption" }
//   ];

//   const testimonials = [
//     {
//       name: "Mithesh",
//       quote: "These IoT devices have transformed my Health Monitoring experience. I feel safer and more connected to my health data."
//     },
//     {
//       name: "Varun",
//       quote: "The real-time monitoring and alerts have given me peace of mind. I can focus on my work knowing my health is in good hands."
//     },
//     {
//       name: "Sanjeev",
//       quote: "The AI-powered analysis is impressive. It provides insights that I never thought possible. Highly recommend this system!"
//     }
//   ];

//   const techFeatures = [
//     { icon: <Wifi />, title: "IoT Integration" },
//     { icon: <Database />, title: "Secure Storage" },
//     { icon: <Laptop />, title: "Web Dashboard" },
//     { icon: <Stethoscope />, title: "Medical Grade" }
//   ];

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.2
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { y: 0, opacity: 1 }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
//       <nav className="bg-white shadow-sm fixed w-full z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16 items-center">
//             <div className="flex items-center">
//               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
//                 <Heart className="h-8 w-8 text-blue-600" />
//               </motion.div>
//               <motion.span
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.5, delay: 0.2 }}
//                 className="ml-2 text-xl font-bold text-gray-900"
//               >
//                 HappyCare
//               </motion.span>
//             </div>
//             <div className="hidden md:flex md:items-center md:space-x-6">
//               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')} className="text-gray-700 hover:text-gray-900">
//                 Login
//               </motion.button>
//               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/signup')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
//                 Sign Up
//               </motion.button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="pt-24 pb-16">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
//             Next-Generation Healthcare Monitoring
//           </motion.h1>
//           <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
//             Advanced IoT-based health monitoring system for comprehensive vital sign tracking, fall detection, and instant alerts. Your health, monitored 24/7.
//           </motion.p>
//           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/signup')} className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 flex items-center mx-auto">
//             Get Started
//             <ArrowRight className="ml-2 w-5 h-5" />
//           </motion.button>
//         </motion.div>

//         {/* Features */}
//         <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {features.map((feature) => (
//               <motion.div key={feature.title} variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
//                 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
//                   {feature.icon}
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
//                 <p className="text-gray-600">{feature.description}</p>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>

//         {/* Stats */}
//         <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
//           <div className="bg-blue-600 rounded-2xl p-8 md:p-12">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//               {stats.map((stat) => (
//                 <motion.div key={stat.label} variants={itemVariants} className="text-center">
//                   <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
//                   <div className="text-blue-100">{stat.label}</div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </motion.div>

//         {/* Tech Features */}
//         <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {techFeatures.map((feature) => (
//               <motion.div key={feature.title} variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
//                 <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
//                   {feature.icon}
//                 </div>
//                 <h3 className="font-semibold">{feature.title}</h3>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>

//         {/* Testimonials */}
//         <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pb-20">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial) => (
//               <motion.div key={testimonial.name} variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
//                 <div className="flex items-center mb-4">
//                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                     <User className="w-6 h-6 text-blue-600" />
//                   </div>
//                   <div className="ml-4">
//                     <h3 className="font-semibold">{testimonial.name}</h3>
//                   </div>
//                 </div>
//                 <p className="text-gray-700 italic">"{testimonial.quote}"</p>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Landing;
//-------------------------------------------------------------------------------------------------------------------------
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Zap, Menu, X, Star, Check, ArrowRight, Activity, Brain, Stethoscope, Laptop, Wifi, Database, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Real-time Monitoring",
      description: "Track vital signs with advanced IoT sensors for immediate health insights."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms for predictive health analytics."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Alerts",
      description: "Instant notifications for critical health changes and emergencies."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Fall Detection",
      description: "Advanced fall detection system with immediate emergency response."
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Monitoring" },
    { value: "<50ms", label: "Response Time" },
    { value: "128bit", label: "Encryption" }
  ];

  const testimonials = [
    {
      name: "Mithesh",
      quote: "These IoT devices have transformed my Health Monitoring experience. I feel safer and more connected to my health data."
    },
    {
      name: "Varun",
      quote: "The real-time monitoring and alerts have given me peace of mind. I can focus on my work knowing my health is in good hands."
    },
    {
      name: "Sanjeev",
      quote: "The AI-powered analysis is impressive. It provides insights that I never thought possible. Highly recommend this system!"
    }
  ];

  const techFeatures = [
    { icon: <Wifi />, title: "IoT Integration" },
    { icon: <Database />, title: "Secure Storage" },
    { icon: <Laptop />, title: "Web Dashboard" },
    { icon: <Stethoscope />, title: "Medical Grade" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleDoctorAuth = () => {
    navigate('/doctor-auth');
  };

  const handlePatientAuth = () => {
    navigate('/patient-auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                <Heart className="h-8 w-8 text-blue-600" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="ml-2 text-xl font-bold text-gray-900"
              >
                HappyCare
              </motion.span>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-6">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePatientAuth} className="text-gray-700 hover:text-gray-900">
                Patient Login
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDoctorAuth} className="text-gray-700 hover:text-gray-900">
                Doctor Login
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Next-Generation Healthcare Monitoring
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Advanced IoT-based health monitoring system for comprehensive vital sign tracking, fall detection, and instant alerts. Your health, monitored 24/7.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-12"
          >
            <motion.div
              whileHover={{ y: -5 }}
              onClick={handlePatientAuth}
              className="bg-white p-8 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl border border-blue-100"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Patient Portal</h3>
              <p className="text-gray-600 mb-6">Access your health data, view reports, and connect with your doctors.</p>
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/Login');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Patient Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/SignUp');
                  }}
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Patient Signup
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              onClick={handleDoctorAuth}
              className="bg-white p-8 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl border border-blue-100"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Doctor Portal</h3>
              <p className="text-gray-600 mb-6">Monitor your patients, review data, and provide remote care.</p>
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/Login1');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Doctor Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/Signup1');
                  }}
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Doctor Signup
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* You can continue appending other parts of the layout like testimonials and stats here as per the same structure */}
      </div>
    </div>
  );
};

export default Landing;
