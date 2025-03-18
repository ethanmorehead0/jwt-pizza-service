const os = require("os");
const config = require("config");

let requests = 0;
let latency = 0;

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

function sendMetricToGrafana(metricName, metricValue, type, unit) {
  const metric = {
    resourceMetrics: [
      {
        scopeMetrics: [
          {
            metrics: [
              {
                name: metricName,
                unit: unit,
                [type]: {
                  dataPoints: [
                    {
                      asInt: metricValue,
                      timeUnixNano: Date.now() * 1000000,
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  };

  if (type === "sum") {
    metric.resourceMetrics[0].scopeMetrics[0].metrics[0][
      type
    ].aggregationTemporality = "AGGREGATION_TEMPORALITY_CUMULATIVE";
    metric.resourceMetrics[0].scopeMetrics[0].metrics[0][
      type
    ].isMonotonic = true;
  }

  const body = JSON.stringify(metric);
  fetch(`${config.url}`, {
    method: "POST",
    body: body,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        response.text().then((text) => {
          console.error(
            `Failed to push metrics data to Grafana: ${text}\n${body}`
          );
        });
      } else {
        console.log(`Pushed ${metricName}`);
      }
    })
    .catch((error) => {
      console.error("Error pushing metrics:", error);
    });
}

// Report metrics every 5 seconds
setInterval(() => {
  const cpuValue = Math.floor(Math.random() * 100) + 1;
  sendMetricToGrafana("cpu", cpuValue, "gauge", "%");

  requests += Math.floor(Math.random() * 200) + 1;
  sendMetricToGrafana("requests", requests, "sum", "1");

  latency += Math.floor(Math.random() * 200) + 1;
  sendMetricToGrafana("latency", latency, "sum", "ms");
  sendMetricToGrafana("memory", getMemoryUsagePercentage(), "gauge", "%");
  sendMetricToGrafana("cpu", getCpuUsagePercentage(), "gauge", "%");
}, 5000);

function track(route) {
  return (req, res, next) => {
    console.log(`Tracking route: ${route}`);

    const metricName = `route_${route}_requests`;
    requests += 1;
    sendMetricToGrafana(metricName, requests, "sum", "1");

    next();
  };
}

module.exports = { track };
