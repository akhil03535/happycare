# Health Monitoring IoT System

A comprehensive health monitoring system that integrates IoT devices with real-time data analysis and emergency alerts.

## Features

- Real-time ECG monitoring with ML-based analysis
- Vital signs tracking (Heart Rate, Temperature, SpO2, Blood Pressure)
- Fall detection with emergency alerts
- Alcohol level monitoring
- SMS notifications for critical events
- ThingSpeak IoT integration
- Responsive web interface

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Machine Learning: Python + TensorFlow
- IoT Integration: ThingSpeak API
- SMS Notifications: Twilio
- Styling: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd project
```

2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install Python dependencies
pip install -r server/requirements.txt
```

3. Configure environment variables
- Create a `.env` file in the root directory
- Add your ThingSpeak and Twilio credentials

4. Start the development servers
```bash
# Start frontend
npm run dev

# Start backend
cd server
node index.js
```

## Configuration

### ThingSpeak Setup
1. Create a ThingSpeak account
2. Set up a new channel
3. Add your channel ID and API key in the profile settings

### SMS Notifications
- Configure Twilio credentials in the server environment
- Add emergency contacts in the user profile

## Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgments

- ThingSpeak for IoT data handling
- Twilio for SMS capabilities
- Chart.js for visualization
