import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import { logger, getStackLines } from './utils';
import auth from './routes/auth';
import oauth from './routes/oauth';
import fulfillment from './routes/fulfillment';
import CoffeeController from './controllers/coffee';
import packageJson from '../package.json';

const app = express();
const server = http.Server(app);

/** middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/*', (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

/** routes */
app.use('/fulfillment', fulfillment);
app.use('/auth', auth);
app.use('/oauth', oauth);

app.use((err, req, res, next) => {
  if (err) {
    logger.error(err.toString());
    if (err.stack) {
      getStackLines(err.stack).forEach(line => logger.error(line));
    }
    res.status(err.code || 500);
    return res.send('Sorry, an error occurred');
  }

  return next(err);
});

logger.info(`Starting coffee-bot fulfillment-server version ${packageJson.version}...`);

/**
 * Listen for the coffee maker to start a connection
 */
CoffeeController.listenForCoffeeMachine(server);

/**
 * Listen for HTTP requests
 */
const listener = server.listen(3000, () => {
  logger.info(`Listening for API requests on port ${listener.address().port}...`);
});
