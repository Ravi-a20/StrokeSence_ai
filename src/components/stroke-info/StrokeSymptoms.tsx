import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Clock, Eye, Move3D, Mic2 } from 'lucide-react';

interface StrokeSymptomsProps {
  onClose: () => void;
}

const StrokeSymptoms: React.FC<StrokeSymptomsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-red-700">
            <AlertTriangle className="h-6 w-6 mr-2" />
            Recognizing Stroke Symptoms: B.E.S.T.
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* BEST Method */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
              <Move3D className="h-5 w-5 mr-2" />
              Remember B.E.S.T.
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 text-lg">B - Balance</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Sudden loss of balance or coordination</li>
                    <li>• Trouble standing or walking</li>
                    <li>• Dizziness or unsteadiness</li>
                    <li>• Ask person to walk a few steps</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 text-lg">E - Eye Tracking</h4>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Sudden vision changes or double vision</li>
                    <li>• Difficulty tracking objects with eyes</li>
                    <li>• Eyes may not move together</li>
                    <li>• Ask person to follow your finger with their eyes</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 text-lg">S - Slurred Speech</h4>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Slurred or garbled speech</li>
                    <li>• Difficulty understanding or being understood</li>
                    <li>• Trouble finding words</li>
                    <li>• Ask person to repeat a simple phrase</li>
                  </ul>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 text-lg">T - Timely Assistance</h4>
                  <ul className="text-sm text-red-700 mt-2 space-y-1">
                    <li>• Time is critical - call 911 immediately</li>
                    <li>• Note the time symptoms started</li>
                    <li>• Do not wait for symptoms to improve</li>
                    <li>• Every minute matters</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Symptoms */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Other Warning Signs</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Sudden severe headache
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Sudden confusion or trouble understanding
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Nausea or vomiting
                </li>
              </ul>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Sudden numbness or weakness, especially on one side
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Sudden trouble seeing in one or both eyes
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Sudden trouble walking or loss of coordination
                </li>
              </ul>
            </div>
          </div>

          {/* Emergency Action */}
          <div className="bg-red-100 p-4 rounded-lg border border-red-300">
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="font-semibold text-red-800">Immediate Action Required</h3>
            </div>
            <p className="text-red-700 text-sm">
              If you notice ANY of these signs, call emergency services immediately (911).
              Do not drive to the hospital - emergency services can provide treatment en route.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrokeSymptoms;