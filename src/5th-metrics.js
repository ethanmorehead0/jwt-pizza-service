// const config = require("./config");

// // const os = require("os");

// // function getCpuUsagePercentage() {
// //   const cpuUsage = os.loadavg()[0] / os.cpus().length;
// //   return cpuUsage.toFixed(2) * 100;
// // }

// // function getMemoryUsagePercentage() {
// //   const totalMemory = os.totalmem();
// //   const freeMemory = os.freemem();
// //   const usedMemory = totalMemory - freeMemory;
// //   const memoryUsage = (usedMemory / totalMemory) * 100;
// //   return memoryUsage.toFixed(2);
// // }

// let requests1 = 0;
// // let requests = 0;
// // let requestsTypes = [0, 0, 0, 0]; //get, put, post, delete
// let latency = 0;

// setInterval(() => {
//   const cpuValue = Math.floor(Math.random() * 100) + 1;
//   sendMetricToGrafana("cpu", cpuValue, "gauge", "%");

//   sendMetricToGrafana("requests", requests1, "sum", "1");

//   latency += Math.floor(Math.random() * 200) + 1;
//   sendMetricToGrafana("latency", latency, "sum", "ms");

//   //   sendMetricToGrafana("CPU", getCpuUsagePercentage(), "sum", "%");
//   //sendMetricToGrafana("MemoryUsage", getMemoryUsagePercentage(), "gauge", "%");
//   //sendMetricToGrafana("MemoryUsage", parseFloat(getMemoryUsagePercentage()), "gauge", "%");
// }, 5000);

// function sendMetricToGrafana(metricName, metricValue, type, unit) {
//   const metric = {
//     resourceMetrics: [
//       {
//         scopeMetrics: [
//           {
//             metrics: [
//               {
//                 name: metricName,
//                 unit: unit,
//                 [type]: {
//                   dataPoints: [
//                     {
//                       asInt: metricValue,
//                       timeUnixNano: Date.now() * 1000000,
//                     },
//                   ],
//                 },
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   };

//   if (type === "sum") {
//     metric.resourceMetrics[0].scopeMetrics[0].metrics[0][
//       type
//     ].aggregationTemporality = "AGGREGATION_TEMPORALITY_CUMULATIVE";
//     metric.resourceMetrics[0].scopeMetrics[0].metrics[0][
//       type
//     ].isMonotonic = true;
//   }

//   const body = JSON.stringify(metric);
//   fetch(`${config.metrics.url}`, {
//     method: "POST",
//     body: body,
//     headers: {
//       Authorization: `Bearer ${config.metrics.apiKey}`,
//       "Content-Type": "application/json",
//     },
//   })
//     .then((response) => {
//       if (!response.ok) {
//         response.text().then((text) => {
//           console.error(
//             `Failed to push metrics data to Grafana: ${text}\n${body}`
//           );
//         });
//       } else {
//         console.log(`Pushed ${metricName}`);
//       }
//     })
//     .catch((error) => {
//       console.error("Error pushing metrics:", error);
//     });
// }

// // function requestTracker() {
// //   sendMetricToGrafana("test", 100, "sum", "1");
// //   requests++;
// //   console.log(requests);
// //   return (req, res, next) => {
// //     const start = process.hrtime();
// //     switch (req.method) {
// //       case "GET":
// //         requestsTypes[0]++;
// //         break;
// //       case "PUT":
// //         requestsTypes[1]++;
// //         break;
// //       case "POST":
// //         requestsTypes[2]++;
// //         break;
// //       case "DELETE":
// //         requestsTypes[3]++;
// //         break;
// //     }
// //     res.on("finish", () => {
// //       const [seconds, nanoseconds] = process.hrtime(start);
// //       const duration = seconds * 1000 + nanoseconds / 1e6; // Convert to milliseconds

// //       sendMetricToGrafana("request_duration", duration, "sum", "ms");
// //       sendMetricToGrafana("request_count", 1, "sum", "1");
// //     });

// //     next();
// //   };
// // }

// // module.exports = {
// //   requestTracker,
// // };

// async function track(req, res, next) {
//   sendMetricToGrafana("test", 200, "sum", "1");
//   return (req, res, next) => {
//     if (scope === "all") {
//       const start = Date.now();
//       res.on("finish", () => {
//         const duration = Date.now() - start;
//         console.log(`Tracked: ${req.method} ${req.url} (${duration}ms)`);
//       });
//     }
//     next();
//   };
// }

// module.exports = track();
