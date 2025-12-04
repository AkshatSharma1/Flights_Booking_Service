const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const apiRoutes = require('./routes');
const logger = require('./utils/logger');
const config = require('./config/serverConfig');
const { CronJobs } = require("./utils/common");
const { createChannel } = require("./utils/messageQueue");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

app.listen(config.PORT, async () => {
  logger.info(
    `🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`
  );

  //Start Cron jobs
  CronJobs();
  console.log("⏰ Cron Jobs Scheduled");

  // 1. Connect to RabbitMQ
  const channel = await createChannel();
  // 2. Attach channel to the global app object (so Controllers can use it)
  app.channel = channel;

  console.log("✅ RabbitMQ Channel Created");
});