import express from 'express';
import bodyParser from 'body-parser';
import logger, { getStackLines } from './utils/logger';
import auth from './routes/auth';
import oauth from './routes/oauth';
import fulfillment from './routes/fulfillment';

const app = express();

/** middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

/** start the app */
const listener = app.listen(3000, () => {
  logger.info(`Listing on port ${listener.address().port}`);
});
