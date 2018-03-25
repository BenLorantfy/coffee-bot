import { Router } from 'express';
import config from 'config';
import logger from '../../utils/logger';
import fs from 'fs';
import { ValidationError } from '../../errors';

const router = Router();

function isValidQuery(query) {
  if (query.client_id !== config.get('google.clientId')) {
    logger.error(`client_id wasn\'t '${config.get('google.clientId')}', instead found: ${query.client_id}`);
    return false;
  }

  if (query.response_type !== 'code') {
    logger.error(`response_type wasn\'t 'code', instead found: ${query.response_type}`);
    return false;
  }

  // https://oauth-redirect.googleusercontent.com/r/YOUR_PROJECT_ID
  if (query.redirect_uri !== `https://oauth-redirect.googleusercontent.com/r/${config.get('google.projectId')}`) {
    logger.error(`redirect_uri wasn\'t google, instead found: ${query.redirect_uri}`);
    return false;
  }

  return true;
}

router.get('/auth', (req, res) => {
  if (!isValidQuery(req.query)) {
    return next(new ValidationError('Not a valid query'));
  }

  const html = fs.readFileSync(`${__dirname}/../../../views/auth.html`);
  res.header('Content-Type', 'text/html');
  return res.send(html);
});

router.post('/*', (req, res) => {
  res.send('Hello World POST!');
});

export default router;
