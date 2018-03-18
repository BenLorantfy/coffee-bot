import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import logger, { getStackLines } from './utils/logger';
import { ValidationError } from './errors';

const app = express();
app.use(bodyParser.json());

function isValidQuery() {
  return false;
}

app.get('/auth', (req, res, next) => {
  if (!isValidQuery(req.query)) {
    return next(new ValidationError('Not a valid query'));
  }

  const html = fs.readFileSync(`${__dirname}/../static/auth.html`);
  res.header('Content-Type', 'text/html');
  return res.send(html);
});

app.post('*', (req, res) => {
  res.send('Hello World POST!');
});

app.use((err, req, res, next) => {
  if (err) {
    logger.error(err.toString());
    if (err.stack) {
      getStackLines(err.stack).forEach(line => logger.error(line));
    }
    res.status(err.code || 500);
    return res.send('Sorry, an error occurred :(');
  }

  return next(err);
});

const listener = app.listen(3000, () => {
  logger.info(`Listing on port ${listener.address().port}`);
});
