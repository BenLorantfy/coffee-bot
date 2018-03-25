import { Router } from 'express';
import config from 'config';
import logger from '../../utils/logger';
import fs from 'fs';
import { ValidationError } from '../../errors';
import secrets from '../../../secrets';
import jwt from 'jsonwebtoken';
import { promisify } from 'es6-promisify';

const ONE_DAY_IN_SECONDS = 86400;
const jwtVerify = promisify(jwt.verify);
const router = Router();

function isValidAuthRequest(query) {
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

function isValidTokenRequest(body) {
  if (body.client_id !== config.get('google.clientId')) {
    logger.error(`client_id wasn\'t '${config.get('google.clientId')}', instead found: ${body.client_id}`);
    return false;
  }

  if (body.client_secret !== secrets.client_secret) {
    logger.error(`client_secret wasn\'t correct, found: ${body.client_secret}`);
    return false;
  }

  // https://oauth-redirect.googleusercontent.com/r/YOUR_PROJECT_ID
  if (body.grant_type !== 'authorization_code' && body.grant_type !== 'refresh_token') {
    logger.error(`grant_type wasn\'t correct, found ${body.grant_type}`);
    return false;
  }

  return true;
}

router.get('/auth', (req, res, next) => {
  if (!isValidAuthRequest(req.query)) {
    return next(new ValidationError('Not a valid query'));
  }

  const html = fs.readFileSync(`${__dirname}/../../../views/auth.html`);
  res.header('Content-Type', 'text/html');
  return res.send(html);
});

router.post('/token', (req, res, next) => {
  if (!isValidTokenRequest(req.body)) {
    return next(new ValidationError('Not a valid body'));
  }

  return jwtVerify(req.body.code || req.body.refresh_token, secrets.jwt_secret)
    .then((decoded) => {
      const info = {
        client_id: config.get('google.clientId'),
        username: decoded.username
      }

      const expiresIn = ONE_DAY_IN_SECONDS;
      const accessToken = jwt.sign({ ...info, type: 'access_token' }, secrets.jwt_secret, { expiresIn });
      const refreshToken = jwt.sign({ ...info, type: 'refresh_token' }, secrets.jwt_secret);

      res.json({
        token_type: "bearer",
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn
      })
    })
    .catch(next);
});

export default router;
