import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Brain, Activity, Eye, Mic, Phone, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    hover: {
      y: -10,
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <motion.header 
        className="bg-blue-600 text-white"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold">Stroke Sense</h1>
          </motion.div>
          <div className="space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" className="text-blue-600 bg-white hover:bg-gray-100" onClick={() => navigate('/login')}>
                Login
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <motion.div 
          className="text-center mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-8" variants={itemVariants}>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotateY: [0, 180, 360]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Brain className="h-24 w-24 text-blue-600 mx-auto mb-6" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            className="text-6xl font-bold text-gray-900 mb-6"
            variants={itemVariants}
          >
            Early Stroke Detection
            <br />
            <motion.span 
              className="text-blue-600"
              animate={{ color: ["#2563eb", "#3b82f6", "#1d4ed8", "#2563eb"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Saves Lives
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            A comprehensive mobile application that helps detect early stroke symptoms, provides timely assistance, and offers educational resources.
          </motion.p>
          
          <motion.div className="space-x-4" variants={itemVariants}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg" onClick={() => navigate('/register')}>
                Get Started Now
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Key Features Section */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="text-center mb-12"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h3>
            <p className="text-xl text-gray-600">
              Our comprehensive tools help detect and respond to stroke symptoms quickly
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="text-center border-0 shadow-lg h-full">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Activity className="h-8 w-8 text-blue-600" />
                  </motion.div>
                  <CardTitle className="text-xl">Balance Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    Sophisticated sensors measure balance stability to detect potential stroke symptoms.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Try Now
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="text-center border-0 shadow-lg h-full">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Eye className="h-8 w-8 text-blue-600" />
                  </motion.div>
                  <CardTitle className="text-xl">Eye Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    Advanced algorithms analyze eye movement patterns to identify neurological issues.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Try Now
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="text-center border-0 shadow-lg h-full">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Mic className="h-8 w-8 text-blue-600" />
                  </motion.div>
                  <CardTitle className="text-xl">Speech Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    Cutting-edge voice recognition evaluates speech clarity to identify potential slurring.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Try Now
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="text-center border-0 shadow-lg h-full">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(239, 68, 68, 0.7)",
                        "0 0 0 10px rgba(239, 68, 68, 0)",
                        "0 0 0 0 rgba(239, 68, 68, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Phone className="h-8 w-8 text-red-600" />
                  </motion.div>
                  <CardTitle className="text-xl">Emergency Assistance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    Quick access to emergency services when every second matters for stroke treatment.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Access
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-xl text-gray-600">
              Our simple 4-step process helps you monitor and respond to stroke symptoms
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Register</h4>
                  <p className="text-gray-600 mb-4">
                    Create your profile with personal details, medical history, and emergency contacts for comprehensive care.
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto">
                    Register Now <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Regular Testing</h4>
                  <p className="text-gray-600 mb-4">
                    Perform balance, eye tracking, and speech tests regularly to establish baseline data and monitor changes.
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto">
                    View Tests <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Automated Analysis</h4>
                  <p className="text-gray-600 mb-4">
                    Our advanced AI algorithms analyze your results in real-time and detect potential stroke warning signs.
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto">
                    See Analysis <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Immediate Response</h4>
                  <p className="text-gray-600 mb-4">
                    If stroke signs are detected, instantly access emergency assistance and contact your pre-configured emergency contacts.
                  </p>
                  <Button variant="link" className="text-red-600 p-0 h-auto">
                    Emergency Access <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
