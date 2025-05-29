
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Shield, Heart, Activity, Apple } from 'lucide-react';

interface StrokePreventionProps {
  onClose: () => void;
}

const StrokePrevention: React.FC<StrokePreventionProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-blue-700">
            <Shield className="h-6 w-6 mr-2" />
            Stroke Prevention
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lifestyle Changes */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Healthy Lifestyle Choices
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 flex items-center">
                    <Apple className="h-4 w-4 mr-2" />
                    Healthy Diet
                  </h4>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Eat plenty of fruits and vegetables</li>
                    <li>• Choose whole grains over refined</li>
                    <li>• Limit saturated and trans fats</li>
                    <li>• Reduce sodium intake</li>
                    <li>• Include omega-3 fatty acids</li>
                  </ul>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Regular Exercise</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• At least 150 minutes moderate activity/week</li>
                    <li>• Include cardio and strength training</li>
                    <li>• Start slowly and gradually increase</li>
                    <li>• Walking, swimming, cycling are great</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Avoid Harmful Habits</h4>
                  <ul className="text-sm text-purple-700 mt-2 space-y-1">
                    <li>• Quit smoking completely</li>
                    <li>• Limit alcohol consumption</li>
                    <li>• Avoid illegal drugs</li>
                    <li>• Manage stress effectively</li>
                  </ul>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800">Quality Sleep</h4>
                  <ul className="text-sm text-orange-700 mt-2 space-y-1">
                    <li>• 7-9 hours of sleep per night</li>
                    <li>• Maintain regular sleep schedule</li>
                    <li>• Treat sleep apnea if present</li>
                    <li>• Create comfortable sleep environment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Management */}
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Medical Risk Factor Management
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800">Blood Pressure</h4>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Monitor regularly at home</li>
                  <li>• Take medications as prescribed</li>
                  <li>• Aim for less than 120/80 mmHg</li>
                  <li>• Reduce salt and increase potassium</li>
                </ul>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800">Cholesterol</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Get tested regularly</li>
                  <li>• Take statins if prescribed</li>
                  <li>• Eat heart-healthy foods</li>
                  <li>• Exercise regularly</li>
                </ul>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800">Diabetes</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Monitor blood sugar levels</li>
                  <li>• Take medications as directed</li>
                  <li>• Follow diabetic diet plan</li>
                  <li>• Regular check-ups with doctor</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800">Atrial Fibrillation</h4>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Take blood thinners if prescribed</li>
                  <li>• Monitor heart rhythm</li>
                  <li>• Follow up with cardiologist</li>
                  <li>• Report symptoms immediately</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Regular Monitoring */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Regular Health Monitoring</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Annual physical examinations</li>
                <li>• Blood pressure checks</li>
                <li>• Cholesterol screening</li>
                <li>• Diabetes screening</li>
              </ul>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Heart rhythm monitoring</li>
                <li>• Carotid artery screening</li>
                <li>• Regular medication reviews</li>
                <li>• Discuss family history with doctor</li>
              </ul>
            </div>
          </div>

          {/* Prevention Tips */}
          <div className="bg-green-100 p-4 rounded-lg border border-green-300">
            <h3 className="font-semibold text-green-800 mb-2">Key Prevention Tips</h3>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Know your risk factors and work with your doctor to manage them</li>
              <li>• Learn the warning signs of stroke and teach them to family members</li>
              <li>• Take all medications exactly as prescribed</li>
              <li>• Use this app regularly to monitor your stroke risk</li>
              <li>• Don't ignore small symptoms - they can be warning signs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrokePrevention;
