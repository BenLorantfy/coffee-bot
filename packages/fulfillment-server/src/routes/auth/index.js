import { Router } from 'express';
import config from 'config';
import logger from '../../utils/logger';
import { ValidationError } from '../../errors';
import basicAuth from 'basic-auth';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/token', (req, res) => {
  var credentials = basicAuth.parse(req.get('Authorization'));
  var info = {
    username: credentials.name,
  }

  // todo: signup/login user
  var token = jwt.sign(info, 'shhhhh');

  return res.json({ 
    token,
    oauth: {
      projectId: config.get('google.projectId')
    }
  });
});

export default router;
