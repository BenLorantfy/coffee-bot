import { Router } from 'express';
import config from 'config';
import logger from '../../utils/logger';
import fs from 'fs';
import { ValidationError } from '../../errors';
import secrets from '../../../secrets';
import jwt from 'jsonwebtoken';
import { promisify } from 'es6-promisify';


const router = Router();

router.post('/', (req, res, next) => {
  logger.info('Received some intents');
  console.log('body', req.body);
  return res.send(null);
});


export default router;
