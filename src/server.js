const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const apiRoutes = require('./routes');
const logger = require('./utils/logger');
const config = require('./config/serverConfig');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api', apiRoutes)

app.listen(config.PORT, () => {
  logger.info(`🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});