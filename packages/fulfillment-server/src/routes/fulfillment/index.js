import { Router } from 'express';
import config from 'config';
import logger from '../../utils/logger';
import fs from 'fs';
import { ValidationError, UnauthorizedError } from '../../errors';
import secrets from '../../../secrets';
import jwt from 'jsonwebtoken';
import { promisify } from 'es6-promisify';
import IntentsController from '../../controllers/intents';
const jwtVerify = promisify(jwt.verify);
const router = Router();

router.post('/', (req, res, next) => {
  logger.info('Received some intents');
  if (!req.body && !req.body.inputs && !Array.isArray(req.body.inputs) && req.body.inputs[0]) {
    return next(new ValidationError('Request wasn\'t formatted correctly'));
  }

  if (!req.headers.authorization) {
    return next(new UnauthorizedError('Missing authorization header'));
  }

  const token = req.headers.authorization.split(' ')[1];
  return jwtVerify(token, secrets.jwt_secret)
    .catch((err) => {
      next(new UnauthorizedError('Invalid JWT'))
    })
    .then((decoded) => {
      if (!(decoded && decoded.scopes && decoded.scopes.includes('coffee.make'))) {
        return next(new UnauthorizedError('User doesn\'t have the coffee.make scope'));
      }

      const intent = req.body.inputs[0];
      IntentsController.process(intent).then((payload) => {
        res.json({
          requestId: req.body.requestId,
          payload
        });
      });
    });
});


export default router;
