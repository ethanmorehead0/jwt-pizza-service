const os = require("os");

function getCpuUsagePercentage() {
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  return (cpuUsage * 100).toFixed(2);
}

function getMemoryUsagePercentage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = (usedMemory / totalMemory) * 100;
  return memoryUsage.toFixed(2);
}

function reportMetrics() {
  const cpuUsage = getCpuUsagePercentage();
  const memoryUsage = getMemoryUsagePercentage();
  console.log(`CPU Usage: ${cpuUsage}%`);
  console.log(`Memory Usage: ${memoryUsage}%`);
}

// Report metrics every 5 seconds
setInterval(reportMetrics, 5000);

function track(route) {
  return (req, res, next) => {
    console.log(`Tracking route: ${route}`);
    next();
  };
}

module.exports = { track };
