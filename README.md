# StrokeSense.AI

**StrokeSense.AI** is a smart, cross-platform application designed for early detection of stroke indicators and timely medical assistance. Leveraging AI and real-time sensor data, the platform analyzes balance, eye movement, and speech to identify potential stroke symptoms. If symptoms are detected, the app can automatically alert emergency contacts with the user’s location and relevant details, enabling rapid response and potentially saving lives.

---

## Features

- **Balance Test:** Detects abnormal shakes or loss of balance using device motion sensors.
- **Eye Tracking:** Monitors eye movement for irregularities using the device camera and AI models.
- **Slurred Speech Detection:** Analyzes speech for slurring using advanced deep learning models.
- **Emergency Alerts:** Automatically notifies caregivers or emergency services with real-time alerts and geolocation.
- **User-Friendly Interface:** Seamless experience on both mobile and web platforms.
- **Secure Authentication:** User registration and login with secure data handling.
- **Dashboard:** View test results and manage emergency contacts.

---

## Tech Stack

- **Frontend:** React.js, TypeScript, Capacitor
- **Backend:** FastAPI, Node.js, MongoDB Atlas
- **Machine Learning:** TensorFlow Lite, Wav2Vec2, MediaPipe, OpenCV
- **Integrations:** Twilio API for emergency notifications

---

## How to Run

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Python 3.8+
- MongoDB Atlas account (or local MongoDB)
- Twilio account (for SMS/call alerts)

### Frontend

```sh
cd balance-gaze-alert-app
npm install
npm start
