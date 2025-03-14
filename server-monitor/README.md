# Server Monitor Dashboard

A real-time dashboard application to monitor system resources (CPU, RAM, Disk) on an Ubuntu server.

![Dashboard Screenshot](dashboard-screenshot.png)

## Features

- Real-time monitoring of CPU usage
- Memory (RAM) usage tracking
- Disk space utilization
- System uptime display
- Load average metrics
- Historical chart of resource usage
- Responsive design for desktop and mobile

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- SSH access to the Ubuntu server you want to monitor
- The target Ubuntu server must have standard Linux utilities (top, free, df)

## Installation

1. Clone this repository or download the source code
2. Navigate to the project directory:
   ```
   cd server-monitor
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Configure your server connection:
   - Copy `.env.example` to `.env`
   - Edit `.env` and set your server details:
     ```
     SERVER_IP=10.12.3.32
     SSH_USERNAME=your_username
     SSH_PASSWORD=your_password
     # Or use SSH key authentication:
     # SSH_PRIVATE_KEY_PATH=/path/to/your/key
     ```

## Usage

1. Start the application:
   ```
   npm start
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
3. The dashboard will connect to your server and display real-time metrics

## Development

For development with auto-restart on file changes:
```
npm run dev
```

## Security Considerations

- Store your `.env` file securely and never commit it to version control
- Consider using SSH key authentication instead of passwords
- Limit access to the dashboard using a reverse proxy with authentication
- Run the monitoring agent with the least privileges necessary

## Troubleshooting

- If you see "Connection failed", check your SSH credentials and server IP
- Ensure your server has the required utilities installed (top, free, df)
- Check firewall settings to ensure SSH connections are allowed

## License

MIT 