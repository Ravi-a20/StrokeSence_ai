
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { authService, AuthUser } from '../services/authService';
import { Brain, Activity, Eye, Mic, Phone, LogOut, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import StrokeSymptoms from '../components/stroke-info/StrokeSymptoms';
import FirstAid from '../components/stroke-info/FirstAid';
import StrokePrevention from '../components/stroke-info/StrokePrevention';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const handleComprehensiveAnalysis = () => {
    navigate('/comprehensive-analysis');
    toast({
      title: "Starting Comprehensive Analysis",
      description: "You will complete balance, eye tracking, and speech tests sequentially.",
    });
  };

  if (!user) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="h-8 w-8 text-blue-600" />
        </motion.div>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mobile Header */}
      <motion.header 
        className="bg-white p-4 flex justify-between items-center border-b border-gray-100"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-8 w-8 text-blue-600" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-blue-600">Stroke</h1>
            <h1 className="text-xl font-bold text-blue-600 -mt-1">Sense</h1>
          </div>
        </motion.div>
        <div className="flex items-center space-x-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')} className="text-xs px-3 py-2">
              Patient Profile
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs px-3 py-1">
              <LogOut className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        className="p-4 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-4">
              <motion.h2 
                className="text-lg font-bold text-gray-900 mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Welcome back!
              </motion.h2>
              <motion.p 
                className="text-sm text-gray-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Your regular assessment helps us monitor your health more effectively.
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detection Modules */}
        <motion.div variants={itemVariants}>
          <motion.h3 
            className="text-lg font-semibold text-gray-800 mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Detection Modules
          </motion.h3>
          <motion.p 
            className="text-sm text-gray-600 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Select a module to perform detection
          </motion.p>
          
          <motion.div 
            className="grid grid-cols-2 gap-4 mb-6"
            variants={containerVariants}
          >
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Card 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer text-center border-gray-200" 
                onClick={() => navigate('/balance-test')}
              >
                <CardContent className="p-6">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Activity className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                  </motion.div>
                  <h4 className="text-base font-medium text-gray-900">Balance</h4>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Card 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer text-center border-gray-200" 
                onClick={() => navigate('/eye-tracking-test')}
              >
                <CardContent className="p-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Eye className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                  </motion.div>
                  <h4 className="text-base font-medium text-gray-900">Eye Tracking</h4>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Card 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer text-center border-gray-200" 
                onClick={() => navigate('/speech-test')}
              >
                <CardContent className="p-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Mic className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                  </motion.div>
                  <h4 className="text-base font-medium text-gray-900">Speech</h4>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Card 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer text-center bg-red-50 border-red-200" 
                onClick={() => navigate('/emergency')}
              >
                <CardContent className="p-6">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(239, 68, 68, 0.7)",
                        "0 0 0 10px rgba(239, 68, 68, 0)",
                        "0 0 0 0 rgba(239, 68, 68, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
                  </motion.div>
                  <h4 className="text-base font-medium text-red-600">Emergency</h4>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Comprehensive Analysis Button */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleComprehensiveAnalysis}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-4 text-base font-medium shadow-lg"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="mr-3"
              >
                <Brain className="h-5 w-5" />
              </motion.div>
              Comprehensive Analysis
            </Button>
          </motion.div>
        </motion.div>

        {/* Quick Information */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Information</CardTitle>
              <p className="text-sm text-gray-600">Education about stroke</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div 
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setActiveInfo('symptoms')}
                whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-medium text-gray-900">Recognizing Stroke Symptoms</h4>
              </motion.div>

              <motion.div 
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setActiveInfo('firstaid')}
                whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-medium text-gray-900">First Aid for Stroke</h4>
              </motion.div>

              <motion.div 
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setActiveInfo('prevention')}
                whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-medium text-gray-900">Stroke Prevention</h4>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.main>

      {/* Information Modals */}
      {activeInfo === 'symptoms' && (
        <StrokeSymptoms onClose={() => setActiveInfo(null)} />
      )}
      {activeInfo === 'firstaid' && (
        <FirstAid onClose={() => setActiveInfo(null)} />
      )}
      {activeInfo === 'prevention' && (
        <StrokePrevention onClose={() => setActiveInfo(null)} />
      )}
    </motion.div>
  );
};

export default Dashboard;
