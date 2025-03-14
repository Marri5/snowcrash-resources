// Connect to WebSocket server
const socket = io();

// DOM elements
const connectionStatus = document.getElementById('connection-status');
const cpuValue = document.getElementById('cpu-value');
const memoryValue = document.getElementById('memory-value');
const diskValue = document.getElementById('disk-value');
const uptimeValue = document.getElementById('uptime-value');
const load1 = document.getElementById('load-1');
const load5 = document.getElementById('load-5');
const load15 = document.getElementById('load-15');
const lastUpdate = document.getElementById('last-update');

// Chart data
const chartData = {
  labels: [],
  datasets: [
    {
      label: 'CPU Usage (%)',
      data: [],
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.2)',
      borderWidth: 2,
      tension: 0.3
    },
    {
      label: 'Memory Usage (%)',
      data: [],
      borderColor: '#2ecc71',
      backgroundColor: 'rgba(46, 204, 113, 0.2)',
      borderWidth: 2,
      tension: 0.3
    }
  ]
};

// Initialize gauge charts
const gaugeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  rotation: -90,
  circumference: 180,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: false
    }
  }
};

// Create gauge charts
const cpuGauge = new Chart(document.getElementById('cpu-gauge'), {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [0, 100],
      backgroundColor: ['#3498db', '#ecf0f1'],
      borderWidth: 0
    }]
  },
  options: gaugeOptions
});

const memoryGauge = new Chart(document.getElementById('memory-gauge'), {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [0, 100],
      backgroundColor: ['#2ecc71', '#ecf0f1'],
      borderWidth: 0
    }]
  },
  options: gaugeOptions
});

const diskGauge = new Chart(document.getElementById('disk-gauge'), {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [0, 100],
      backgroundColor: ['#e74c3c', '#ecf0f1'],
      borderWidth: 0
    }]
  },
  options: gaugeOptions
});

// Create history chart
const historyChart = new Chart(document.getElementById('history-chart'), {
  type: 'line',
  data: chartData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Usage (%)'
        },
        min: 0,
        max: 100
      }
    }
  }
});

// Update gauge chart
function updateGauge(chart, value) {
  chart.data.datasets[0].data[0] = value;
  chart.data.datasets[0].data[1] = 100 - value;
  chart.update();
}

// Update history chart
function updateHistoryChart(cpu, memory) {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  
  // Add new data point
  chartData.labels.push(timeString);
  chartData.datasets[0].data.push(parseFloat(cpu));
  chartData.datasets[1].data.push(parseFloat(memory));
  
  // Limit to 20 data points to avoid clutter
  if (chartData.labels.length > 20) {
    chartData.labels.shift();
    chartData.datasets[0].data.shift();
    chartData.datasets[1].data.shift();
  }
  
  historyChart.update();
}

// Handle WebSocket events
socket.on('connect', () => {
  connectionStatus.textContent = 'Connected';
  connectionStatus.className = 'status-connected';
});

socket.on('disconnect', () => {
  connectionStatus.textContent = 'Disconnected';
  connectionStatus.className = 'status-error';
});

socket.on('systemInfo', (data) => {
  // Check for connection errors
  if (data.error) {
    connectionStatus.textContent = 'Error: ' + data.error;
    connectionStatus.className = 'status-error';
    return;
  }
  
  // Update connection status
  connectionStatus.textContent = 'Connected';
  connectionStatus.className = 'status-connected';
  
  // Parse numeric values
  const cpuUsage = parseFloat(data.cpu);
  const memoryUsage = parseFloat(data.memory);
  const diskUsage = parseInt(data.disk);
  
  // Update gauge values
  cpuValue.textContent = cpuUsage.toFixed(1) + '%';
  memoryValue.textContent = memoryUsage.toFixed(1) + '%';
  diskValue.textContent = data.disk;
  
  // Update gauges
  updateGauge(cpuGauge, cpuUsage);
  updateGauge(memoryGauge, memoryUsage);
  updateGauge(diskGauge, diskUsage);
  
  // Update uptime
  uptimeValue.textContent = data.uptime;
  
  // Update load average
  const loadValues = data.loadAvg.split(' ');
  if (loadValues.length >= 3) {
    load1.textContent = loadValues[0];
    load5.textContent = loadValues[1];
    load15.textContent = loadValues[2];
  }
  
  // Update history chart
  updateHistoryChart(cpuUsage, memoryUsage);
  
  // Update last update timestamp
  lastUpdate.textContent = new Date().toLocaleString();
}); 