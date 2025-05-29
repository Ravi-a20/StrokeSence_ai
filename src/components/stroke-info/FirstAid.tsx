
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Heart, Phone, AlertCircle } from 'lucide-react';

interface FirstAidProps {
  onClose: () => void;
}

const FirstAid: React.FC<FirstAidProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-red-700">
            <Heart className="h-6 w-6 mr-2" />
            First Aid for Stroke
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Immediate Steps */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Immediate Emergency Steps
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold text-red-800">Call 911 Immediately</h4>
                  <p className="text-red-700 text-sm">Don't wait - every minute counts. Emergency services can provide treatment en route.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold text-red-800">Note the Time</h4>
                  <p className="text-red-700 text-sm">Record when symptoms first appeared - this information is crucial for treatment decisions.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold text-red-800">Stay Calm</h4>
                  <p className="text-red-700 text-sm">Keep yourself and the patient calm while waiting for help.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Do's */}
          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-3">✅ DO These Things</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800">Keep Patient Comfortable</h4>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Help them lie down with head slightly elevated</li>
                  <li>• Loosen any tight clothing around neck</li>
                  <li>• Keep them warm with a blanket</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800">Monitor Breathing</h4>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Check if they're breathing normally</li>
                  <li>• If unconscious, place in recovery position</li>
                  <li>• Be prepared to perform CPR if needed</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800">Stay With Them</h4>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Provide reassurance and comfort</li>
                  <li>• Talk calmly and clearly</li>
                  <li>• Monitor their condition continuously</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Don'ts */}
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-3">❌ DON'T Do These Things</h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <ul className="text-sm text-red-700 space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Don't give food, water, or medication
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Don't leave them alone
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Don't let them drive themselves to hospital
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Don't assume symptoms will go away
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Don't give aspirin unless directed by 911 operator
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="font-semibold text-yellow-800">Important Notes</h3>
            </div>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Every stroke is different - symptoms may vary</li>
              <li>• Time is brain - faster treatment means better outcomes</li>
              <li>• Even if symptoms seem to improve, still seek emergency care</li>
              <li>• Have emergency contact information ready for medical personnel</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirstAid;
