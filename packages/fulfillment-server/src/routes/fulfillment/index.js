import { Router } from 'express';
import config from 'config';
import logger from '../../utils/logger';
import fs from 'fs';
import { ValidationError } from '../../errors';
import secrets from '../../../secrets';
import jwt from 'jsonwebtoken';
import { promisify } from 'es6-promisify';
import IntentsController from '../../controllers/intents';

const router = Router();

router.post('/', (req, res, next) => {
  logger.info('Received some intents');
  if (!req.body && !req.body.inputs && !Array.isArray(req.body.inputs) && req.body.inputs[0]) {
    return next(new ValidationError('Request wasn\'t formatted correctly'));
  }

  const intent = req.body.inputs[0];
  const payload = IntentsController.process(intent);

  return res.json({
    requestId: req.body.requestId,
    payload
  });
});


export default router;
