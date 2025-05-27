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
- MongoDB Atlas account (for database)

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
- Copy `.env.example` to create `.env` file in the root directory
- Set up MongoDB Atlas:
  1. Create a MongoDB Atlas account if you don't have one
  2. Create a new cluster
  3. Click "Connect" on your cluster
  4. Choose "Connect your application"
  5. Copy the connection string
  6. Replace `<username>`, `<password>` in the MONGODB_URI with your credentials
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

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Create a new project in Vercel
3. Import your GitHub repository
4. Configure environment variables in Vercel:
   - Go to Project Settings > Environment Variables
   - Add all variables from your `.env` file
   - Make sure to use the MongoDB Atlas connection string
5. Deploy the project

Note: Make sure your MongoDB Atlas cluster's Network Access settings allow connections from anywhere (0.0.0.0/0) or from Vercel's IP range.

### Database Configuration

The project uses MongoDB Atlas as the cloud database service. To set up:

1. Create a MongoDB Atlas account
2. Create a new cluster (the free tier is sufficient for development)
3. Set up database access:
   - Create a database user with appropriate permissions
   - Add your IP address to the IP Access List
4. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>`, `<password>` with your database user credentials
5. Update your environment variables with the connection string
