const express = require("express");
const app = express();

const metrics = require("./metrics");
let greeting = "hello";

app.use(express.json());

app.get("/hello/:name", metrics.track("getGreeting"), (req, res) => {
  res.send({ [greeting]: req.params.name });
});

app.listen(3000, function () {
  console.log(`Listening on port 3000`);
});
