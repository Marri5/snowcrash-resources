// Import required modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { NodeSSH } = require('node-ssh');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// SSH connection configuration
const ssh = new NodeSSH();
const SSH_CONFIG = {
  host: process.env.SERVER_IP || '10.12.3.32',
  username: process.env.SSH_USERNAME || 'username', // Change this
  password: process.env.SSH_PASSWORD || 'password', // Change this or use privateKey
  // privateKey: process.env.SSH_PRIVATE_KEY_PATH
};

// Set view engine and static files
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index', { serverIp: SSH_CONFIG.host });
});

// Helper function to execute remote commands and get system info
async function getSystemInfo() {
  try {
    if (!ssh.isConnected()) {
      await ssh.connect(SSH_CONFIG);
      console.log('SSH connection established');
    }
    
    // Get CPU usage
    const cpuInfo = await ssh.execCommand("top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'");
    
    // Get Memory usage
    const memInfo = await ssh.execCommand("free -m | awk 'NR==2{printf \"%.2f\", $3*100/$2}'");
    
    // Get Disk usage
    const diskInfo = await ssh.execCommand("df -h | awk '$NF==\"/\"{printf \"%s\", $5}'");
    
    // Get system uptime
    const uptimeInfo = await ssh.execCommand("uptime -p");

    // Get load average
    const loadAvgInfo = await ssh.execCommand("cat /proc/loadavg | awk '{print $1,$2,$3}'");
    
    return {
      cpu: cpuInfo.stdout || '0',
      memory: memInfo.stdout || '0',
      disk: diskInfo.stdout || '0%',
      uptime: uptimeInfo.stdout || 'unknown',
      loadAvg: loadAvgInfo.stdout || '0 0 0'
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    return {
      cpu: '0',
      memory: '0',
      disk: '0%',
      uptime: 'Connection failed',
      loadAvg: '0 0 0',
      error: error.message
    };
  }
}

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A client connected');
  
  // Send system info every 5 seconds
  const interval = setInterval(async () => {
    const systemInfo = await getSystemInfo();
    socket.emit('systemInfo', systemInfo);
  }, 5000);
  
  // Clean up on disconnect
  socket.on('disconnect', () => {
    console.log('A client disconnected');
    clearInterval(interval);
  });
});

// Handle SSH disconnection gracefully
process.on('SIGINT', async () => {
  if (ssh.isConnected()) {
    await ssh.dispose();
    console.log('SSH connection closed');
  }
  process.exit(0);
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the dashboard`);
}); 